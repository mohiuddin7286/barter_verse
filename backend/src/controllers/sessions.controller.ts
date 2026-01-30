import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { sessionsService } from '../services/sessions.service';

// ============ SESSION CRUD ============

export const createSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const session = await sessionsService.createSession(req.user.id, req.body);

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

export const getSessionById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sessionId } = req.params;
    const session = await sessionsService.getSessionById(sessionId);

    res.json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

export const getSessionsAsProvider = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const status = (req.query.status as string) || undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { sessions, total } = await sessionsService.getSessionsAsProvider(
      req.user.id,
      status as any,
      page,
      limit
    );

    res.json({
      success: true,
      data: sessions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSessionsAsParticipant = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const status = (req.query.status as string) || undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { sessions, total } = await sessionsService.getSessionsAsParticipant(
      req.user.id,
      status as any,
      page,
      limit
    );

    res.json({
      success: true,
      data: sessions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserSessions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { sessions, total } = await sessionsService.getUserSessions(userId, page, limit);

    res.json({
      success: true,
      data: sessions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const { sessionId } = req.params;
    const updatedSession = await sessionsService.updateSession(sessionId, req.user.id, req.body);

    res.json({ success: true, data: updatedSession });
  } catch (error) {
    next(error);
  }
};

export const cancelSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const { sessionId } = req.params;
    const { reason } = req.body;

    await sessionsService.cancelSession(sessionId, req.user.id, reason);

    res.json({ success: true, message: 'Session cancelled successfully' });
  } catch (error) {
    next(error);
  }
};

export const startSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const { sessionId } = req.params;
    const session = await sessionsService.startSession(sessionId, req.user.id);

    res.json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

export const completeSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const { sessionId } = req.params;
    const session = await sessionsService.completeSession(sessionId, req.user.id, req.body);

    res.json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

export const markNoShow = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const { sessionId } = req.params;
    const session = await sessionsService.markNoShow(sessionId, req.user.id);

    res.json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

// ============ AVAILABILITY & SCHEDULING ============

export const getProviderAvailability = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { providerId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required',
      });
    }

    const bookedSlots = await sessionsService.getProviderAvailability(
      providerId,
      startDate as string,
      endDate as string
    );

    res.json({ success: true, data: bookedSlots });
  } catch (error) {
    next(error);
  }
};

export const getAvailableSlots = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { providerId } = req.params;
    const { date } = req.query;
    const slotDuration = parseInt(req.query.slotDuration as string) || 60;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'date is required',
      });
    }

    const availableSlots = await sessionsService.getAvailableSlots(
      providerId,
      date as string,
      slotDuration
    );

    res.json({ success: true, data: availableSlots });
  } catch (error) {
    next(error);
  }
};

// ============ ANALYTICS ============

export const getSessionStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.query;

    const stats = await sessionsService.getSessionStats(userId as string | undefined);

    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

export const getProviderStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { providerId } = req.params;

    const stats = await sessionsService.getProviderStats(providerId);

    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingSessions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const days = parseInt(req.query.days as string) || 7;

    const sessions = await sessionsService.getUpcomingSessions(days);

    res.json({ success: true, data: sessions });
  } catch (error) {
    next(error);
  }
};
