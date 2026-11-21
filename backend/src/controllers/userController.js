import { User, UsageLog } from '../models/index.js';

export async function updateProfile(req, res, next) {
  try {
    const { name } = req.body;
    const user = req.user;

    if (name) user.name = name;
    await user.save();

    return res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function upgradePlan(req, res, next) {
  try {
    const { plan } = req.body;
    if (!['free', 'pro'].includes(plan)) {
      return res.status(400).json({ error: 'Valid plan is required ("free" or "pro").' });
    }

    const user = req.user;
    user.plan = plan;
    user.aiRequestsLimit = plan === 'pro' ? 1000 : 50;
    await user.save();

    return res.json({
      message: `Successfully updated to ${plan.toUpperCase()} plan.`,
      user: {
        id: user.id,
        plan: user.plan,
        aiRequestsLimit: user.aiRequestsLimit,
        aiRequestsUsed: user.aiRequestsUsed,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getUsageHistory(req, res, next) {
  try {
    const logs = await UsageLog.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    return res.json({ usage: logs });
  } catch (err) {
    next(err);
  }
}
