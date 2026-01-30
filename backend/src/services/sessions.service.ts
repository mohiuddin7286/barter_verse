import { prisma } from "../prisma/client";
import { Session, SessionStatus } from "@prisma/client";
import { AppError } from "../middleware/error.middleware";
import { z } from "zod";
import { NotificationService } from "./notifications.service";

// Validation Schemas
export const createSessionSchema = z.object({
  participant_id: z.string().min(1, "Participant ID is required"),
  skill_title: z.string().min(3).max(255, "Skill title must be 3-255 characters"),
  description: z.string().max(1000, "Description max 1000 characters").optional(),
  scheduled_at: z.string().refine((date) => new Date(date) > new Date(), {
    message: "Session must be scheduled for a future date",
  }),
  duration_minutes: z.number().min(15).max(480).default(60),
  location: z.string().max(500).optional(),
  meeting_link: z.string().url().optional(),
});

export const updateSessionSchema = createSessionSchema.partial().omit({ participant_id: true });

export const completeSessionSchema = z.object({
  feedback: z.string().max(1000).optional(),
  rating: z.number().min(1).max(5).optional(),
  notes: z.string().max(1000).optional(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type CompleteSessionInput = z.infer<typeof completeSessionSchema>;

export class SessionsService {
  // ============ SESSION CRUD ============

  async createSession(providerId: string, data: CreateSessionInput): Promise<any> {
    const validatedData = createSessionSchema.parse(data);

    // Cannot book with yourself
    if (providerId === validatedData.participant_id) {
      throw new AppError(400, "You cannot book a session with yourself");
    }

    // Check if provider exists
    const provider = await prisma.profile.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      throw new AppError(404, "Provider profile not found");
    }

    // Check if participant exists
    const participant = await prisma.profile.findUnique({
      where: { id: validatedData.participant_id },
    });

    if (!participant) {
      throw new AppError(404, "Participant not found");
    }

    // Check for scheduling conflicts
    const conflictingSession = await prisma.session.findFirst({
      where: {
        OR: [
          {
            provider_id: providerId,
            scheduled_at: {
              gte: new Date(validatedData.scheduled_at),
              lt: new Date(new Date(validatedData.scheduled_at).getTime() + validatedData.duration_minutes * 60000),
            },
            status: { in: ["SCHEDULED", "IN_PROGRESS"] },
          },
          {
            participant_id: validatedData.participant_id,
            scheduled_at: {
              gte: new Date(validatedData.scheduled_at),
              lt: new Date(new Date(validatedData.scheduled_at).getTime() + validatedData.duration_minutes * 60000),
            },
            status: { in: ["SCHEDULED", "IN_PROGRESS"] },
          },
        ],
      },
    });

    if (conflictingSession) {
      throw new AppError(409, "Time slot is already booked");
    }

    const session = await prisma.session.create({
      data: {
        provider_id: providerId,
        participant_id: validatedData.participant_id,
        skill_title: validatedData.skill_title,
        description: validatedData.description,
        scheduled_at: new Date(validatedData.scheduled_at),
        duration_minutes: validatedData.duration_minutes,
        location: validatedData.location,
        meeting_link: validatedData.meeting_link,
      },
      include: {
        provider: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
            display_name: true,
            rating: true,
          },
        },
        participant: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
            display_name: true,
            rating: true,
          },
        },
      },
    });

    // Send notification to provider about new booking
    try {
      const participant = await prisma.profile.findUnique({
        where: { id: validatedData.participant_id },
        select: { username: true },
      });

      await NotificationService.createNotification({
        user_id: providerId,
        type: 'message',
        title: 'New Skill-Share Booking',
        message: `${participant?.username} booked your session on "${validatedData.skill_title}"`,
        related_id: session.id,
        related_type: 'session',
        action_url: `/sessions/${session.id}`,
      });
    } catch (err) {
      console.error('Failed to send session booking notification:', err);
    }

    return session;
  }

  async getSessionById(sessionId: string): Promise<any> {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        provider: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
            display_name: true,
            rating: true,
          },
        },
        participant: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
            display_name: true,
            rating: true,
          },
        },
      },
    });

    if (!session) {
      throw new AppError(404, "Session not found");
    }

    return session;
  }

  async getSessionsAsProvider(
    providerId: string,
    status?: SessionStatus,
    page: number = 1,
    limit: number = 10
  ): Promise<{ sessions: any[]; total: number }> {
    const skip = (page - 1) * limit;

    const where: any = { provider_id: providerId };
    if (status) {
      where.status = status;
    }

    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where,
        include: {
          participant: {
            select: {
              id: true,
              username: true,
              avatar_url: true,
              display_name: true,
              rating: true,
            },
          },
        },
        orderBy: { scheduled_at: "asc" },
        skip,
        take: limit,
      }),
      prisma.session.count({ where }),
    ]);

    return { sessions, total };
  }

  async getSessionsAsParticipant(
    participantId: string,
    status?: SessionStatus,
    page: number = 1,
    limit: number = 10
  ): Promise<{ sessions: any[]; total: number }> {
    const skip = (page - 1) * limit;

    const where: any = { participant_id: participantId };
    if (status) {
      where.status = status;
    }

    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where,
        include: {
          provider: {
            select: {
              id: true,
              username: true,
              avatar_url: true,
              display_name: true,
              rating: true,
            },
          },
        },
        orderBy: { scheduled_at: "asc" },
        skip,
        take: limit,
      }),
      prisma.session.count({ where }),
    ]);

    return { sessions, total };
  }

  async getUserSessions(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ sessions: any[]; total: number }> {
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where: {
          OR: [
            { provider_id: userId },
            { participant_id: userId },
          ],
        },
        include: {
          provider: {
            select: {
              id: true,
              username: true,
              avatar_url: true,
              display_name: true,
            },
          },
          participant: {
            select: {
              id: true,
              username: true,
              avatar_url: true,
              display_name: true,
            },
          },
        },
        orderBy: { scheduled_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.session.count({
        where: {
          OR: [
            { provider_id: userId },
            { participant_id: userId },
          ],
        },
      }),
    ]);

    return { sessions, total };
  }

  async updateSession(
    sessionId: string,
    providerId: string,
    data: UpdateSessionInput
  ): Promise<Session> {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new AppError(404, "Session not found");
    }

    if (session.provider_id !== providerId) {
      throw new AppError(403, "Only the provider can edit this session");
    }

    if (session.status !== "SCHEDULED") {
      throw new AppError(400, "Can only edit scheduled sessions");
    }

    const validatedData = updateSessionSchema.parse(data);

    // Check for conflicts if time is being changed
    if (validatedData.scheduled_at) {
      const conflictingSession = await prisma.session.findFirst({
        where: {
          id: { not: sessionId },
          OR: [
            {
              provider_id: providerId,
              scheduled_at: {
                gte: new Date(validatedData.scheduled_at),
                lt: new Date(
                  new Date(validatedData.scheduled_at).getTime() +
                    (validatedData.duration_minutes || session.duration_minutes) * 60000
                ),
              },
              status: { in: ["SCHEDULED", "IN_PROGRESS"] },
            },
            {
              participant_id: session.participant_id,
              scheduled_at: {
                gte: new Date(validatedData.scheduled_at),
                lt: new Date(
                  new Date(validatedData.scheduled_at).getTime() +
                    (validatedData.duration_minutes || session.duration_minutes) * 60000
                ),
              },
              status: { in: ["SCHEDULED", "IN_PROGRESS"] },
            },
          ],
        },
      });

      if (conflictingSession) {
        throw new AppError(409, "Time slot is already booked");
      }
    }

    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        ...validatedData,
        scheduled_at: validatedData.scheduled_at ? new Date(validatedData.scheduled_at) : undefined,
      },
    });

    return updatedSession;
  }

  async cancelSession(sessionId: string, userId: string, reason?: string): Promise<void> {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new AppError(404, "Session not found");
    }

    // Only provider or participant can cancel
    if (session.provider_id !== userId && session.participant_id !== userId) {
      throw new AppError(403, "You cannot cancel this session");
    }

    if (session.status !== "SCHEDULED") {
      throw new AppError(400, "Can only cancel scheduled sessions");
    }

    await prisma.session.update({
      where: { id: sessionId },
      data: {
        status: "CANCELLED",
        notes: reason ? `Cancelled: ${reason}` : undefined,
      },
    });
  }

  async startSession(sessionId: string, providerId: string): Promise<Session> {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new AppError(404, "Session not found");
    }

    if (session.provider_id !== providerId) {
      throw new AppError(403, "Only the provider can start this session");
    }

    if (session.status !== "SCHEDULED") {
      throw new AppError(400, "Can only start scheduled sessions");
    }

    return await prisma.session.update({
      where: { id: sessionId },
      data: { status: "IN_PROGRESS" },
    });
  }

  async completeSession(
    sessionId: string,
    providerId: string,
    data: CompleteSessionInput
  ): Promise<Session> {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new AppError(404, "Session not found");
    }

    if (session.provider_id !== providerId) {
      throw new AppError(403, "Only the provider can complete this session");
    }

    if (session.status !== "IN_PROGRESS") {
      throw new AppError(400, "Only in-progress sessions can be completed");
    }

    const validatedData = completeSessionSchema.parse(data);

    return await prisma.session.update({
      where: { id: sessionId },
      data: {
        status: "COMPLETED",
        feedback: validatedData.feedback,
        rating: validatedData.rating,
        notes: validatedData.notes,
      },
    });
  }

  async markNoShow(sessionId: string, providerId: string): Promise<Session> {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new AppError(404, "Session not found");
    }

    if (session.provider_id !== providerId) {
      throw new AppError(403, "Only the provider can mark no-show");
    }

    if (session.status !== "SCHEDULED" && session.status !== "IN_PROGRESS") {
      throw new AppError(400, "Can only mark active sessions as no-show");
    }

    return await prisma.session.update({
      where: { id: sessionId },
      data: { status: "NO_SHOW" },
    });
  }

  // ============ AVAILABILITY & SCHEDULING ============

  async getProviderAvailability(
    providerId: string,
    startDate: string,
    endDate: string
  ): Promise<any[]> {
    const bookedSlots = await prisma.session.findMany({
      where: {
        provider_id: providerId,
        scheduled_at: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
      },
      select: {
        scheduled_at: true,
        duration_minutes: true,
      },
    });

    return bookedSlots.map((slot) => ({
      startTime: slot.scheduled_at,
      endTime: new Date(slot.scheduled_at.getTime() + slot.duration_minutes * 60000),
    }));
  }

  async getAvailableSlots(
    providerId: string,
    date: string,
    slotDurationMinutes: number = 60
  ): Promise<{ startTime: Date; endTime: Date }[]> {
    const dayStart = new Date(date);
    dayStart.setHours(9, 0, 0, 0); // 9 AM

    const dayEnd = new Date(date);
    dayEnd.setHours(18, 0, 0, 0); // 6 PM

    const bookedSlots = await this.getProviderAvailability(
      providerId,
      dayStart.toISOString(),
      dayEnd.toISOString()
    );

    const availableSlots = [];
    let currentTime = new Date(dayStart);

    while (currentTime < dayEnd) {
      const slotEnd = new Date(currentTime.getTime() + slotDurationMinutes * 60000);

      const isBooked = bookedSlots.some(
        (slot) => currentTime < slot.endTime && slotEnd > slot.startTime
      );

      if (!isBooked && slotEnd <= dayEnd) {
        availableSlots.push({
          startTime: new Date(currentTime),
          endTime: new Date(slotEnd),
        });
      }

      currentTime = new Date(currentTime.getTime() + slotDurationMinutes * 60000);
    }

    return availableSlots;
  }

  // ============ ANALYTICS ============

  async getSessionStats(userId?: string): Promise<{
    totalSessions: number;
    completedSessions: number;
    upcomingSessions: number;
    cancelledSessions: number;
    averageRating: number;
  }> {
    const where: any = {};
    if (userId) {
      where.OR = [
        { provider_id: userId },
        { participant_id: userId },
      ];
    }

    const now = new Date();
    const sessions = await prisma.session.findMany({ where });

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter((s) => s.status === "COMPLETED").length;
    const upcomingSessions = sessions.filter(
      (s) => s.status === "SCHEDULED" && s.scheduled_at > now
    ).length;
    const cancelledSessions = sessions.filter((s) => s.status === "CANCELLED").length;

    const ratings = sessions
      .filter((s) => s.rating !== null)
      .map((s) => s.rating as number);

    const averageRating =
      ratings.length > 0
        ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2))
        : 0;

    return {
      totalSessions,
      completedSessions,
      upcomingSessions,
      cancelledSessions,
      averageRating,
    };
  }

  async getProviderStats(providerId: string): Promise<any> {
    const sessions = await prisma.session.findMany({
      where: { provider_id: providerId },
    });

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter((s) => s.status === "COMPLETED").length;
    const completionRate =
      totalSessions > 0
        ? parseFloat(((completedSessions / totalSessions) * 100).toFixed(2))
        : 0;

    const ratings = sessions
      .filter((s) => s.rating !== null)
      .map((s) => s.rating as number);

    const averageRating =
      ratings.length > 0
        ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2))
        : 0;

    const totalHours = sessions.reduce((sum, s) => sum + s.duration_minutes, 0) / 60;

    return {
      totalSessions,
      completedSessions,
      completionRate,
      averageRating,
      totalHoursTeaught: totalHours,
      totalParticipants: new Set(sessions.map((s) => s.participant_id)).size,
    };
  }

  async getUpcomingSessions(days: number = 7): Promise<any[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return await prisma.session.findMany({
      where: {
        status: "SCHEDULED",
        scheduled_at: {
          gte: now,
          lte: futureDate,
        },
      },
      include: {
        provider: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
          },
        },
        participant: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
          },
        },
      },
      orderBy: { scheduled_at: "asc" },
    });
  }
}

export const sessionsService = new SessionsService();
