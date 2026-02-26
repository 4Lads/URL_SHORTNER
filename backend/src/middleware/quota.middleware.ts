import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/user.model';
import { PlanModel } from '../models/plan.model';
import { UsageModel } from '../models/usage.model';

export const checkUrlQuota = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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

    const usage = await UsageModel.getCurrentPeriodUsage(userId);

    if (usage.links_created >= plan.max_links_per_month) {
      res.status(403).json({
        success: false,
        error: {
          code: 'QUOTA_EXCEEDED',
          message: `You have reached your monthly limit of ${plan.max_links_per_month} links. Upgrade to Pro for more.`,
          details: {
            limit: plan.max_links_per_month,
            used: usage.links_created,
            plan: user.plan,
          },
        },
      });
      return;
    }

    req.userPlan = plan as any;
    next();
  } catch (error) {
    console.error('Quota check error:', error);
    next(); // Fail open
  }
};
