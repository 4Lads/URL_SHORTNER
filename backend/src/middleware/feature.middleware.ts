import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/user.model';
import { PlanModel, Plan } from '../models/plan.model';

export const requireFeature = (feature: keyof Plan) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        next();
        return;
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        next();
        return;
      }

      const plan = await PlanModel.findById(user.plan || 'free');
      if (!plan) {
        next();
        return;
      }

      if (!plan[feature]) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FEATURE_LOCKED',
            message: 'This feature requires a Pro plan. Upgrade to unlock it.',
            feature: String(feature),
          },
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Feature check error:', error);
      next(); // Fail open
    }
  };
};
