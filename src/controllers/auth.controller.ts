import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import User from '@/models/User.model';
import { config } from '@/config';
import { validateRequest } from '@/middlewares/validation.middleware';

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  full_name: Joi.string().max(100).required(),
  user_type: Joi.string().valid('admin', 'counselor', 'manager').default('counselor'),
  is_main_consultant: Joi.boolean().default(false),
  employment_date: Joi.date().default(Date.now),
  program_type: Joi.string().max(50).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const refreshTokenSchema = Joi.object({
  refresh_token: Joi.string().required()
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - full_name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: password123
 *               full_name:
 *                 type: string
 *                 example: Nguyễn Văn A
 *               user_type:
 *                 type: string
 *                 enum: [admin, counselor, manager]
 *                 default: counselor
 *               is_main_consultant:
 *                 type: boolean
 *                 default: false
 *               program_type:
 *                 type: string
 *                 example: Aptech
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         access_token:
 *                           type: string
 *                         refresh_token:
 *                           type: string
 *       400:
 *         description: Lỗi validation hoặc email đã tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const register = [
  validateRequest(registerSchema),
  async (req: Request, res: Response) => {
    try {
      const { email, password, full_name, user_type, is_main_consultant, employment_date, program_type } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Hash password
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = new User({
        email,
        password_hash,
        full_name,
        user_type,
        is_main_consultant,
        employment_date,
        program_type
      });

      await user.save();

      // Generate tokens
      const accessToken = jwt.sign(
        { userId: user._id, email: user.email, user_type: user.user_type },
        config.jwtSecret,
        { expiresIn: config.jwtExpire } as any
      );

      const refreshToken = jwt.sign(
        { userId: user._id },
        config.jwtRefreshSecret,
        { expiresIn: config.jwtRefreshExpire } as any
      );

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user._id,
            email: user.email,
            full_name: user.full_name,
            user_type: user.user_type,
            is_main_consultant: user.is_main_consultant,
            status: user.status
          },
          access_token: accessToken,
          refresh_token: refreshToken
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
];

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         access_token:
 *                           type: string
 *                         refresh_token:
 *                           type: string
 *       401:
 *         description: Thông tin đăng nhập không đúng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const login = [
  validateRequest(loginSchema),
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if user is active
      if (user.status !== 'active') {
        return res.status(401).json({
          success: false,
          message: 'Account is not active'
        });
      }

      // Generate tokens
      const accessToken = jwt.sign(
        { userId: user._id, email: user.email, user_type: user.user_type },
        config.jwtSecret,
        { expiresIn: config.jwtExpire } as any
      );

      const refreshToken = jwt.sign(
        { userId: user._id },
        config.jwtRefreshSecret,
        { expiresIn: config.jwtRefreshExpire } as any
      );

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            email: user.email,
            full_name: user.full_name,
            user_type: user.user_type,
            is_main_consultant: user.is_main_consultant,
            status: user.status
          },
          access_token: accessToken,
          refresh_token: refreshToken
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
];

// Refresh token
export const refreshToken = [
  validateRequest(refreshTokenSchema),
  async (req: Request, res: Response) => {
    try {
      const { refresh_token } = req.body;

      // Verify refresh token
      const decoded = jwt.verify(refresh_token, config.jwtRefreshSecret) as any;
      const user = await User.findById(decoded.userId);

      if (!user || user.status !== 'active') {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      // Generate new access token
      const accessToken = jwt.sign(
        { userId: user._id, email: user.email, user_type: user.user_type },
        config.jwtSecret,
        { expiresIn: config.jwtExpire } as any
      );

      return res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          access_token: accessToken
        }
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
  }
];
