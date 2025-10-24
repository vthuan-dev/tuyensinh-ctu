import Student from '@/models/Student.model';
import ConsultationSession from '@/models/ConsultationSession.model';
import User from '@/models/User.model';
import Appointment from '@/models/Appointment.model';
import Report from '@/models/Report.model';
import * as XLSX from 'xlsx';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

class ReportService {
  async generateStatisticsReport(startDate: Date, endDate: Date, counselorId?: string) {
    const dateFilter = {
      $gte: startDate,
      $lte: endDate
    };

    const counselorFilter = counselorId ? { counselor_id: counselorId } : {};

    // Basic statistics
    const [
      totalStudents,
      newStudents,
      totalConsultations,
      completedConsultations,
      totalAppointments,
      completedAppointments
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ createdAt: dateFilter }),
      ConsultationSession.countDocuments(counselorFilter),
      ConsultationSession.countDocuments({ 
        ...counselorFilter,
        session_status: 'Completed',
        session_date: dateFilter
      }),
      Appointment.countDocuments(counselorFilter),
      Appointment.countDocuments({ 
        ...counselorFilter,
        status: 'completed',
        appointment_date: dateFilter
      })
    ]);

    // Source statistics
    const sourceStats = await Student.aggregate([
      { $match: { createdAt: dateFilter } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Status distribution
    const statusStats = await Student.aggregate([
      { $group: { _id: '$current_status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Counselor performance
    const counselorPerformance = await ConsultationSession.aggregate([
      { $match: { session_date: dateFilter } },
      { $group: { 
        _id: '$counselor_id', 
        totalSessions: { $sum: 1 },
        completedSessions: { 
          $sum: { $cond: [{ $eq: ['$session_status', 'Completed'] }, 1, 0] }
        },
        totalDuration: { $sum: '$duration_minutes' }
      }},
      { $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'counselor'
      }},
      { $unwind: '$counselor' },
      { $project: {
        counselor_name: '$counselor.full_name',
        total_sessions: '$totalSessions',
        completed_sessions: '$completedSessions',
        completion_rate: { $multiply: [{ $divide: ['$completedSessions', '$totalSessions'] }, 100] },
        avg_duration: { $divide: ['$totalDuration', '$totalSessions'] }
      }}
    ]);

    // Monthly trends
    const monthlyTrends = await Student.aggregate([
      { $match: { createdAt: dateFilter } },
      { $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    return {
      overview: {
        total_students: totalStudents,
        new_students: newStudents,
        total_consultations: totalConsultations,
        completed_consultations: completedConsultations,
        total_appointments: totalAppointments,
        completed_appointments: completedAppointments,
        conversion_rate: totalStudents > 0 ? (completedConsultations / totalStudents) * 100 : 0
      },
      source_statistics: sourceStats,
      status_distribution: statusStats,
      counselor_performance: counselorPerformance,
      monthly_trends: monthlyTrends
    };
  }

  async generateExcelReport(reportData: any, reportName: string): Promise<string> {
    const workbook = XLSX.utils.book_new();

    // Overview sheet
    const overviewData = [
      ['Metric', 'Value'],
      ['Total Students', reportData.overview.total_students],
      ['New Students', reportData.overview.new_students],
      ['Total Consultations', reportData.overview.total_consultations],
      ['Completed Consultations', reportData.overview.completed_consultations],
      ['Conversion Rate', `${reportData.overview.conversion_rate.toFixed(2)}%`]
    ];
    const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Overview');

    // Source statistics sheet
    const sourceData = [
      ['Source', 'Count'],
      ...reportData.source_statistics.map((item: any) => [item._id, item.count])
    ];
    const sourceSheet = XLSX.utils.aoa_to_sheet(sourceData);
    XLSX.utils.book_append_sheet(workbook, sourceSheet, 'Source Statistics');

    // Counselor performance sheet
    const counselorData = [
      ['Counselor', 'Total Sessions', 'Completed Sessions', 'Completion Rate', 'Avg Duration'],
      ...reportData.counselor_performance.map((item: any) => [
        item.counselor_name,
        item.total_sessions,
        item.completed_sessions,
        `${item.completion_rate.toFixed(2)}%`,
        `${item.avg_duration.toFixed(1)} min`
      ])
    ];
    const counselorSheet = XLSX.utils.aoa_to_sheet(counselorData);
    XLSX.utils.book_append_sheet(workbook, counselorSheet, 'Counselor Performance');

    // Generate file
    const fileName = `${reportName}_${Date.now()}.xlsx`;
    const filePath = path.join(process.cwd(), 'uploads', 'reports', fileName);
    
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    XLSX.writeFile(workbook, filePath);
    return filePath;
  }

  async generatePDFReport(reportData: any, reportName: string): Promise<string> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const html = this.generateReportHTML(reportData, reportName);
    await page.setContent(html);

    const fileName = `${reportName}_${Date.now()}.pdf`;
    const filePath = path.join(process.cwd(), 'uploads', 'reports', fileName);
    
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await page.pdf({
      path: filePath,
      format: 'A4',
      printBackground: true
    });

    await browser.close();
    return filePath;
  }

  private generateReportHTML(reportData: any, reportName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1, h2 { color: #333; }
          table { border-collapse: collapse; width: 100%; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .metric { margin: 10px 0; }
          .metric-label { font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>${reportName}</h1>
        <h2>Overview</h2>
        <div class="metric">
          <span class="metric-label">Total Students:</span> ${reportData.overview.total_students}
        </div>
        <div class="metric">
          <span class="metric-label">New Students:</span> ${reportData.overview.new_students}
        </div>
        <div class="metric">
          <span class="metric-label">Total Consultations:</span> ${reportData.overview.total_consultations}
        </div>
        <div class="metric">
          <span class="metric-label">Completed Consultations:</span> ${reportData.overview.completed_consultations}
        </div>
        <div class="metric">
          <span class="metric-label">Conversion Rate:</span> ${reportData.overview.conversion_rate.toFixed(2)}%
        </div>

        <h2>Source Statistics</h2>
        <table>
          <tr><th>Source</th><th>Count</th></tr>
          ${reportData.source_statistics.map((item: any) => 
            `<tr><td>${item._id}</td><td>${item.count}</td></tr>`
          ).join('')}
        </table>

        <h2>Counselor Performance</h2>
        <table>
          <tr><th>Counselor</th><th>Total Sessions</th><th>Completed Sessions</th><th>Completion Rate</th><th>Avg Duration</th></tr>
          ${reportData.counselor_performance.map((item: any) => 
            `<tr>
              <td>${item.counselor_name}</td>
              <td>${item.total_sessions}</td>
              <td>${item.completed_sessions}</td>
              <td>${item.completion_rate.toFixed(2)}%</td>
              <td>${item.avg_duration.toFixed(1)} min</td>
            </tr>`
          ).join('')}
        </table>
      </body>
      </html>
    `;
  }

  async generateReport(reportType: string, startDate: Date, endDate: Date, fileFormat: string, generatedBy: string): Promise<string> {
    const reportData = await this.generateStatisticsReport(startDate, endDate);
    const reportName = `${reportType}_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}`;
    
    let filePath: string;
    if (fileFormat === 'excel') {
      filePath = await this.generateExcelReport(reportData, reportName);
    } else if (fileFormat === 'pdf') {
      filePath = await this.generatePDFReport(reportData, reportName);
    } else {
      throw new Error('Unsupported file format');
    }

    // Save report record
    const report = new Report({
      report_name: reportName,
      report_type: reportType,
      report_period: 'custom',
      start_date: startDate,
      end_date: endDate,
      generated_by: generatedBy,
      report_data: reportData,
      file_path: filePath,
      file_format: fileFormat,
      status: 'completed'
    });

    await report.save();
    return filePath;
  }
}

export default new ReportService();
