import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import { z } from 'zod';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and number'
    ),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export class UserController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validationResult = registerSchema.safeParse(req.body);

      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: {
            message: validationResult.error.errors[0].message,
            fields: validationResult.error.errors,
          },
        });
        return;
      }

      const { email, password } = validationResult.data;

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        res.status(409).json({
          success: false,
          error: {
            message: 'Email already registered',
          },
        });
        return;
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await UserModel.create(email, passwordHash);

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        jwtSecret,
        { expiresIn: '7d' }
      );

      // Return sanitized user with token
      res.status(201).json({
        success: true,
        data: {
          user: UserModel.sanitize(user),
          token,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error during registration',
        },
      });
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validationResult = loginSchema.safeParse(req.body);

      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: {
            message: validationResult.error.errors[0].message,
            fields: validationResult.error.errors,
          },
        });
        return;
      }

      const { email, password } = validationResult.data;

      // Find user by email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        res.status(401).json({
          success: false,
          error: {
            message: 'Invalid email or password',
          },
        });
        return;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          error: {
            message: 'Invalid email or password',
          },
        });
        return;
      }

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        jwtSecret,
        { expiresIn: '7d' }
      );

      // Update last login timestamp
      await UserModel.updateTimestamp(user.id);

      // Return sanitized user with token
      res.status(200).json({
        success: true,
        data: {
          user: UserModel.sanitize(user),
          token,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error during login',
        },
      });
    }
  }

  /**
   * Get current user (requires authentication)
   * GET /api/auth/me
   */
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      // User ID is set by auth middleware
      const userId = (req as any).userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            message: 'Unauthorized',
          },
        });
        return;
      }

      const user = await UserModel.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            message: 'User not found',
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user: UserModel.sanitize(user),
        },
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
        },
      });
    }
  }
}
