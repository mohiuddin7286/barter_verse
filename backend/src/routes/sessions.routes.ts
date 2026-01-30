import { Router } from 'express';
import { authRequired } from '../middleware/auth.middleware';
import {
  createSession,
  getSessionById,
  getSessionsAsProvider,
  getSessionsAsParticipant,
  getUserSessions,
  updateSession,
  cancelSession,
  startSession,
  completeSession,
  markNoShow,
  getProviderAvailability,
  getAvailableSlots,
  getSessionStats,
  getProviderStats,
  getUpcomingSessions,
} from '../controllers/sessions.controller';

const router = Router();

// ============ SESSION CRUD ============

// Create a new session (auth required)
router.post('/', authRequired, createSession);

// Get single session (public)
router.get('/:sessionId', getSessionById);

// Get my sessions as provider (auth required)
router.get('/my-sessions/provider', authRequired, getSessionsAsProvider);

// Get my sessions as participant (auth required)
router.get('/my-sessions/participant', authRequired, getSessionsAsParticipant);

// Get all sessions for a user (public)
router.get('/user/:userId', getUserSessions);

// Update session (auth required - provider only)
router.put('/:sessionId', authRequired, updateSession);

// Cancel session (auth required - provider or participant)
router.delete('/:sessionId', authRequired, cancelSession);

// ============ SESSION LIFECYCLE ============

// Start session (auth required - provider only)
router.post('/:sessionId/start', authRequired, startSession);

// Complete session with feedback (auth required - provider only)
router.post('/:sessionId/complete', authRequired, completeSession);

// Mark as no-show (auth required - provider only)
router.post('/:sessionId/no-show', authRequired, markNoShow);

// ============ AVAILABILITY & SCHEDULING ============

// Get booked slots for provider (public)
router.get('/availability/:providerId', getProviderAvailability);

// Get available time slots for provider (public)
router.get('/slots/:providerId', getAvailableSlots);

// ============ ANALYTICS ============

// Get session statistics (public)
router.get('/stats/overview', getSessionStats);

// Get provider statistics (public)
router.get('/stats/provider/:providerId', getProviderStats);

// Get upcoming sessions (public)
router.get('/upcoming', getUpcomingSessions);

export default router;
