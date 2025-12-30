import { Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuditLog {
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: Record<string, any>;
  ipAddress: string;
  timestamp?: Date;
  status: 'success' | 'failure';
}

// In-memory audit logs (in production, use a database table)
const auditLogs: AuditLog[] = [];

export const logAuditTrail = (log: AuditLog): void => {
  auditLogs.push({
    ...log,
    timestamp: new Date(),
  });

  // Keep only last 10000 logs in memory
  if (auditLogs.length > 10000) {
    auditLogs.shift();
  }
};

export const getAuditLogs = (
  userId?: string,
  action?: string,
  limit: number = 100
): AuditLog[] => {
  let filtered = auditLogs;

  if (userId) {
    filtered = filtered.filter(log => log.userId === userId);
  }

  if (action) {
    filtered = filtered.filter(log => log.action === action);
  }

  return filtered.slice(-limit);
};

export const getClientIp = (req: any): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.connection.remoteAddress || 'unknown';
};

// GDPR: Right to be forgotten - anonymize user data
export const anonymizeUserData = async (userId: string): Promise<void> => {
  try {
    const anonymousEmail = `anonymous_${userId}@deleted.local`;
    const anonymousUsername = `deleted_user_${userId.substring(0, 8)}`;

    await prisma.profile.update({
      where: { id: userId },
      data: {
        email: anonymousEmail,
        username: anonymousUsername,
        password: 'DELETED',
        avatar_url: null,
        bio: 'Account deleted by user request',
        role: 'user',
      },
    });

    logAuditTrail({
      userId,
      action: 'GDPR_ANONYMIZE',
      resource: 'Profile',
      resourceId: userId,
      ipAddress: 'system',
      status: 'success',
    });
  } catch (error) {
    throw new Error(`Failed to anonymize user data: ${error}`);
  }
};

// GDPR: Data export - generate complete user data export
export const exportUserData = async (userId: string): Promise<Record<string, any>> => {
  try {
    const user = await prisma.profile.findUnique({
      where: { id: userId },
      include: {
        listings: true,
        trades_initiated: true,
        trades_received: true,
        coin_transactions: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    logAuditTrail({
      userId,
      action: 'GDPR_EXPORT',
      resource: 'Profile',
      resourceId: userId,
      ipAddress: 'system',
      status: 'success',
    });

    return {
      profile: user,
      listings: user.listings,
      trades: {
        initiated: user.trades_initiated,
        received: user.trades_received,
      },
      transactions: user.coin_transactions,
      exportDate: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Failed to export user data: ${error}`);
  }
};
