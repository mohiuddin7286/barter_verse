import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { exportUserData, anonymizeUserData, getAuditLogs, logAuditTrail, getClientIp } from '../utils/gdpr';

const router = Router();

// Export user data (GDPR)
router.get('/export', verifyToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const data = await exportUserData(userId);

    res.json({
      success: true,
      message: 'User data exported successfully',
      data,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Request account deletion (GDPR - Right to be forgotten)
router.post('/delete-account', verifyToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password confirmation is required for account deletion',
      });
    }

    // Verify password before deletion
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const user = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      logAuditTrail({
        userId,
        action: 'DELETE_ACCOUNT_FAILED',
        resource: 'Profile',
        resourceId: userId,
        ipAddress: getClientIp(req),
        status: 'failure',
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid password',
      });
    }

    // Anonymize user data instead of hard deletion
    await anonymizeUserData(userId);

    res.json({
      success: true,
      message: 'Your account has been deleted and anonymized per GDPR regulations',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get audit logs for user
router.get('/audit-logs', verifyToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;

    const logs = getAuditLogs(userId, undefined, limit);

    res.json({
      success: true,
      data: logs,
      total: logs.length,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
