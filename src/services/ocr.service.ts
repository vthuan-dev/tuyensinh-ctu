// import Tesseract from 'tesseract.js';
// import pdfParse from 'pdf-parse';
// import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

class OCRService {
  async processImage(imagePath: string): Promise<{text: string, confidence: number}> {
    try {
      // Preprocess image for better OCR results
      const processedImagePath = await this.preprocessImage(imagePath);
      
      // TODO: Implement actual OCR processing
      // const { data: { text, confidence } } = await Tesseract.recognize(
      //   processedImagePath,
      //   'vie+eng', // Vietnamese + English
      //   {
      //     logger: (m: any) => console.log(m)
      //   }
      // );

      // Mock implementation for now
      const text = 'Mock OCR text';
      const confidence = 0.8;

      // Clean up processed image
      if (processedImagePath !== imagePath) {
        fs.unlinkSync(processedImagePath);
      }

      return { text, confidence };
    } catch (error) {
      console.error('OCR processing failed:', error);
      throw error;
    }
  }

  async processPDF(pdfPath: string): Promise<{text: string, confidence: number}> {
    try {
      // TODO: Implement actual PDF processing
      // const dataBuffer = fs.readFileSync(pdfPath);
      // const data = await pdfParse(dataBuffer);
      
      // Mock implementation for now
      return {
        text: 'Mock PDF text',
        confidence: 0.8 // PDF text extraction is generally reliable
      };
    } catch (error) {
      console.error('PDF processing failed:', error);
      throw error;
    }
  }

  private async preprocessImage(imagePath: string): Promise<string> {
    try {
      // TODO: Implement actual image preprocessing
      // const outputPath = path.join(path.dirname(imagePath), `processed_${Date.now()}.png`);
      
      // await sharp(imagePath)
      //   .resize(2000, 2000, { fit: 'inside', withoutEnlargement: false })
      //   .grayscale()
      //   .normalize()
      //   .sharpen()
      //   .png()
      //   .toFile(outputPath);

      // Return original path for now
      return imagePath;
    } catch (error) {
      console.error('Image preprocessing failed:', error);
      return imagePath; // Return original if preprocessing fails
    }
  }

  extractStudentInfo(text: string): {
    name?: string;
    email?: string;
    phone?: string;
    courseInterest?: string;
    source?: string;
  } {
    const studentInfo: any = {};

    // Extract name (look for Vietnamese name patterns)
    const namePattern = /(?:Họ tên|Tên|Name)[:\s]*([A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]+)/i;
    const nameMatch = text.match(namePattern);
    if (nameMatch) {
      studentInfo.name = nameMatch[1].trim();
    }

    // Extract email
    const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
    const emailMatch = text.match(emailPattern);
    if (emailMatch) {
      studentInfo.email = emailMatch[1];
    }

    // Extract phone number
    const phonePattern = /(?:Số điện thoại|Điện thoại|Phone)[:\s]*(\d{10,11})/i;
    const phoneMatch = text.match(phonePattern);
    if (phoneMatch) {
      studentInfo.phone = phoneMatch[1];
    }

    // Extract course interest
    const coursePattern = /(?:Khóa học quan tâm|Khóa học|Course)[:\s]*([^.\n]+)/i;
    const courseMatch = text.match(coursePattern);
    if (courseMatch) {
      studentInfo.courseInterest = courseMatch[1].trim();
    }

    // Extract source
    const sourcePattern = /(?:Nguồn|Source)[:\s]*([^.\n]+)/i;
    const sourceMatch = text.match(sourcePattern);
    if (sourceMatch) {
      studentInfo.source = sourceMatch[1].trim();
    }

    return studentInfo;
  }

  async processDocument(filePath: string, fileType: 'image' | 'pdf'): Promise<{
    text: string;
    confidence: number;
    studentInfo: any;
  }> {
    let result: {text: string, confidence: number};

    if (fileType === 'pdf') {
      result = await this.processPDF(filePath);
    } else {
      result = await this.processImage(filePath);
    }

    const studentInfo = this.extractStudentInfo(result.text);

    return {
      text: result.text,
      confidence: result.confidence,
      studentInfo
    };
  }
}

export default new OCRService();
