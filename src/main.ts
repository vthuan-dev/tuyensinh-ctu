import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from '@/config';
import connectDB from '@/config/database';
import { errorHandler, notFound } from '@/middlewares/error.middleware';

// Import controllers
import * as authController from '@/controllers/auth.controller';
import * as studentController from '@/controllers/student.controller';
import * as courseController from '@/controllers/course.controller';
import * as consultationSessionController from '@/controllers/consultation-session.controller';
import * as kpiController from '@/controllers/kpi.controller';
import * as fileController from '@/controllers/file.controller';

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', express.Router()
  .post('/register', authController.register)
  .post('/login', authController.login)
  .post('/refresh-token', authController.refreshToken)
);

app.use('/api/students', express.Router()
  .get('/', studentController.getStudents)
  .get('/:id', studentController.getStudentById)
  .post('/', studentController.createStudent)
  .put('/:id', studentController.updateStudent)
  .delete('/:id', studentController.deleteStudent)
);

// Course Management Routes
app.use('/api/courses', express.Router()
  .get('/', courseController.getCourses)
  .get('/:id', courseController.getCourseById)
  .post('/', courseController.createCourse)
  .put('/:id', courseController.updateCourse)
  .delete('/:id', courseController.deleteCourse)
);

app.use('/api/course-categories', express.Router()
  .get('/', courseController.getCourseCategories)
);

// Consultation Sessions Routes
app.use('/api/consultation-sessions', express.Router()
  .get('/', consultationSessionController.getConsultationSessions)
  .get('/:id', consultationSessionController.getConsultationSessionById)
  .post('/', consultationSessionController.createConsultationSession)
  .put('/:id', consultationSessionController.updateConsultationSession)
  .delete('/:id', consultationSessionController.deleteConsultationSession)
);

// KPI Management Routes
app.use('/api/kpi-definitions', express.Router()
  .get('/', kpiController.getKpiDefinitions)
  .get('/:id', kpiController.getKpiDefinitionById)
  .post('/', kpiController.createKpiDefinition)
  .put('/:id', kpiController.updateKpiDefinition)
  .delete('/:id', kpiController.deleteKpiDefinition)
);

app.use('/api/counselor-kpi-targets', express.Router()
  .get('/', kpiController.getCounselorKpiTargets)
  .get('/:id', kpiController.getCounselorKpiTargetById)
  .post('/', kpiController.createCounselorKpiTarget)
  .put('/:id', kpiController.updateCounselorKpiTarget)
  .delete('/:id', kpiController.deleteCounselorKpiTarget)
);

// File Operations Routes
app.use('/api/upload', express.Router()
  .post('/', fileController.uploadFile)
);

app.use('/api/export', express.Router()
  .get('/students/excel', fileController.exportStudentsToExcel)
  .get('/courses/excel', fileController.exportCoursesToExcel)
  .get('/consultation-sessions/excel', fileController.exportConsultationSessionsToExcel)
);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
