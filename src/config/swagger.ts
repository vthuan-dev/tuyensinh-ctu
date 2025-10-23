import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Admissions Consulting API',
      version: '1.0.0',
      description: 'API cho hệ thống quản lý tư vấn tuyển sinh',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            full_name: {
              type: 'string',
              description: 'Full name'
            },
            user_type: {
              type: 'string',
              enum: ['admin', 'counselor', 'manager'],
              description: 'User type'
            },
            is_main_consultant: {
              type: 'boolean',
              description: 'Is main consultant'
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'on_leave'],
              description: 'User status'
            }
          }
        },
        Student: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Student ID'
            },
            student_name: {
              type: 'string',
              description: 'Student name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Student email'
            },
            phone_number: {
              type: 'string',
              description: 'Phone number'
            },
            gender: {
              type: 'string',
              enum: ['male', 'female', 'other'],
              description: 'Gender'
            },
            current_status: {
              type: 'string',
              enum: ['Lead', 'Engaging', 'Registered', 'Dropped Out', 'Archived'],
              description: 'Current status'
            },
            source: {
              type: 'string',
              enum: ['Mail', 'Fanpage', 'Zalo', 'Website', 'Friend', 'SMS', 'Banderole', 'Poster', 'Brochure', 'Google', 'Brand', 'Event'],
              description: 'Source of contact'
            }
          }
        },
        Course: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Course ID'
            },
            name: {
              type: 'string',
              description: 'Course name'
            },
            description: {
              type: 'string',
              description: 'Course description'
            },
            price: {
              type: 'number',
              description: 'Course price'
            },
            is_active: {
              type: 'boolean',
              description: 'Is course active'
            }
          }
        },
        ConsultationSession: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Session ID'
            },
            session_date: {
              type: 'string',
              format: 'date-time',
              description: 'Session date'
            },
            duration_minutes: {
              type: 'number',
              description: 'Duration in minutes'
            },
            session_type: {
              type: 'string',
              enum: ['Phone Call', 'Online Meeting', 'In-Person', 'Email', 'Chat'],
              description: 'Session type'
            },
            session_status: {
              type: 'string',
              enum: ['Scheduled', 'Completed', 'Canceled', 'No Show'],
              description: 'Session status'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Success message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/controllers/*.ts', './src/main.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
