import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Create a new session
router.post('/create', verifyToken, async (req: any, res: Response) => {
  try {
    const providerId = req.user.id;
    const {
      participant_id,
      skill_title,
      description,
      scheduled_at,
      duration_minutes,
      location,
      meeting_link,
    } = req.body;

    if (!participant_id || !skill_title || !scheduled_at) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: participant_id, skill_title, scheduled_at',
      });
    }

    // Validate scheduled date is in future
    const scheduledDate = new Date(scheduled_at);
    if (scheduledDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Session must be scheduled for a future date',
      });
    }

    const session = await prisma.session.create({
      data: {
        provider_id: providerId,
        participant_id,
        skill_title,
        description,
        scheduled_at: scheduledDate,
        duration_minutes: duration_minutes || 60,
        location: location || null,
        meeting_link: meeting_link || null,
      },
      include: {
        provider: { select: { id: true, username: true, avatar_url: true } },
        participant: { select: { id: true, username: true, avatar_url: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: session,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Get available time slots (mock implementation)
router.get('/availability/:provider_id', async (req: Request, res: Response) => {
  try {
    const { provider_id } = req.params;
    const date = req.query.date as string;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required (YYYY-MM-DD)',
      });
    }

    // Get user's existing sessions for the date
    const existingSessions = await prisma.session.findMany({
      where: {
        provider_id,
        scheduled_at: {
          gte: new Date(`${date}T00:00:00`),
          lt: new Date(`${date}T23:59:59`),
        },
      },
    });

    // Generate available slots (9 AM to 6 PM, hourly)
    const slots = [];
    const workStart = 9;
    const workEnd = 18;

    for (let hour = workStart; hour < workEnd; hour++) {
      const slotTime = new Date(`${date}T${hour.toString().padStart(2, '0')}:00:00`);
      const isBooked = existingSessions.some(session => {
        const sessionHour = session.scheduled_at.getHours();
        return sessionHour === hour;
      });

      if (!isBooked) {
        slots.push({
          time: slotTime.toISOString(),
          available: true,
        });
      }
    }

    res.json({
      success: true,
      data: slots,
      date,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Get user's sessions (as provider or participant)
router.get('/my-sessions', verifyToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const role = req.query.role || 'both'; // 'provider', 'participant', or 'both'

    let where: any = {};

    if (role === 'provider') {
      where.provider_id = userId;
    } else if (role === 'participant') {
      where.participant_id = userId;
    } else {
      where = {
        OR: [{ provider_id: userId }, { participant_id: userId }],
      };
    }

    const sessions = await prisma.session.findMany({
      where,
      include: {
        provider: { select: { id: true, username: true, avatar_url: true, rating: true } },
        participant: { select: { id: true, username: true, avatar_url: true, rating: true } },
      },
      orderBy: { scheduled_at: 'asc' },
    });

    res.json({
      success: true,
      data: sessions,
      total: sessions.length,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Update session status
router.put('/:session_id/status', verifyToken, async (req: any, res: Response) => {
  try {
    const { session_id } = req.params;
    const { status, feedback, rating } = req.body;

    const validStatuses = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const session = await prisma.session.findUnique({
      where: { id: session_id },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Only provider or participant can update
    if (session.provider_id !== req.user.id && session.participant_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this session',
      });
    }

    const updatedSession = await prisma.session.update({
      where: { id: session_id },
      data: {
        status,
        feedback: feedback || undefined,
        rating: rating ? Math.min(5, Math.max(1, rating)) : undefined,
      },
      include: {
        provider: { select: { id: true, username: true, avatar_url: true } },
        participant: { select: { id: true, username: true, avatar_url: true } },
      },
    });

    res.json({
      success: true,
      message: 'Session updated successfully',
      data: updatedSession,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Cancel session
router.delete('/:session_id', verifyToken, async (req: any, res: Response) => {
  try {
    const { session_id } = req.params;

    const session = await prisma.session.findUnique({
      where: { id: session_id },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Only provider or participant can cancel
    if (session.provider_id !== req.user.id && session.participant_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to cancel this session',
      });
    }

    const deletedSession = await prisma.session.delete({
      where: { id: session_id },
    });

    res.json({
      success: true,
      message: 'Session cancelled successfully',
      data: deletedSession,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
