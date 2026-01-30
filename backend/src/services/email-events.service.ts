import { emailService } from './email.service';
import { prisma } from '../prisma/client';

/**
 * Email Event Handler Service
 * Orchestrates sending transactional emails based on application events
 */
export class EmailEventService {
  // ============ AUTH EVENTS ============

  static async onUserSignup(userId: string, email: string, username: string, firstName?: string): Promise<void> {
    try {
      await emailService.sendWelcomeEmail(email, username, firstName);
      console.log(`✉️  Welcome email sent to ${email}`);
    } catch (error) {
      console.error(`Failed to send welcome email to ${email}:`, error);
    }
  }

  static async onEmailVerification(email: string, username: string, verificationToken: string): Promise<void> {
    try {
      const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
      await emailService.sendEmailVerification(email, username, verificationLink);
      console.log(`✉️  Verification email sent to ${email}`);
    } catch (error) {
      console.error(`Failed to send verification email to ${email}:`, error);
    }
  }

  static async onPasswordResetRequest(email: string, username: string, resetToken: string): Promise<void> {
    try {
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
      await emailService.sendPasswordReset(email, username, resetLink);
      console.log(`✉️  Password reset email sent to ${email}`);
    } catch (error) {
      console.error(`Failed to send password reset email to ${email}:`, error);
    }
  }

  static async onPasswordChanged(email: string, username: string): Promise<void> {
    try {
      await emailService.sendPasswordChanged(email, username);
      console.log(`✉️  Password changed confirmation sent to ${email}`);
    } catch (error) {
      console.error(`Failed to send password changed email to ${email}:`, error);
    }
  }

  static async onAccountSuspended(userId: string, reason?: string): Promise<void> {
    try {
      const user = await prisma.profile.findUnique({ where: { id: userId } });
      if (!user || !user.email) return;

      await emailService.sendAccountSuspended(user.email, user.username, reason);
      console.log(`✉️  Account suspension email sent to ${user.email}`);
    } catch (error) {
      console.error(`Failed to send account suspension email:`, error);
    }
  }

  static async onAccountReactivated(userId: string): Promise<void> {
    try {
      const user = await prisma.profile.findUnique({ where: { id: userId } });
      if (!user || !user.email) return;

      await emailService.sendAccountReactivated(user.email, user.username);
      console.log(`✉️  Account reactivation email sent to ${user.email}`);
    } catch (error) {
      console.error(`Failed to send account reactivation email:`, error);
    }
  }

  // ============ TRADE EVENTS ============

  static async onTradeOfferCreated(tradeId: string, senderId: string, recipientId: string): Promise<void> {
    try {
      const [trade, sender, recipient] = await Promise.all([
        prisma.trade.findUnique({ where: { id: tradeId } }),
        prisma.profile.findUnique({ where: { id: senderId } }),
        prisma.profile.findUnique({ where: { id: recipientId } }),
      ]);

      if (!trade || !sender || !recipient || !recipient.email) return;

      // Get listing title
      const listing = await prisma.listing.findUnique({ where: { id: trade.listing_id } });
      const tradeTitle = listing?.title || 'Unnamed Trade';

      await emailService.sendTradeOfferNotification(
        recipient.email,
        recipient.display_name || recipient.username,
        sender.username,
        tradeTitle,
        tradeId
      );

      console.log(`✉️  Trade offer email sent to ${recipient.email}`);
    } catch (error) {
      console.error(`Failed to send trade offer email:`, error);
    }
  }

  static async onTradeAccepted(tradeId: string, acceptedBy: string): Promise<void> {
    try {
      const trade = await prisma.trade.findUnique({ where: { id: tradeId } });
      if (!trade) return;

      const [sender, receiver, listing] = await Promise.all([
        prisma.profile.findUnique({ where: { id: trade.initiator_id } }),
        prisma.profile.findUnique({ where: { id: trade.responder_id } }),
        prisma.listing.findUnique({ where: { id: trade.listing_id } }),
      ]);

      if (!sender || !sender.email || !receiver) return;

      await emailService.sendTradeAcceptedNotification(
        sender.email,
        sender.display_name || sender.username,
        receiver.username,
        listing?.title || 'Trade'
      );

      console.log(`✉️  Trade accepted email sent to ${sender.email}`);
    } catch (error) {
      console.error(`Failed to send trade accepted email:`, error);
    }
  }

  static async onTradeRejected(tradeId: string, rejectedBy: string, reason?: string): Promise<void> {
    try {
      const trade = await prisma.trade.findUnique({ where: { id: tradeId } });
      if (!trade) return;

      const [sender, receiver, listing] = await Promise.all([
        prisma.profile.findUnique({ where: { id: trade.initiator_id } }),
        prisma.profile.findUnique({ where: { id: trade.responder_id } }),
        prisma.listing.findUnique({ where: { id: trade.listing_id } }),
      ]);

      if (!sender || !sender.email || !receiver) return;

      await emailService.sendTradeRejectedNotification(
        sender.email,
        sender.display_name || sender.username,
        receiver.username,
        listing?.title || 'Trade',
        reason
      );

      console.log(`✉️  Trade rejected email sent to ${sender.email}`);
    } catch (error) {
      console.error(`Failed to send trade rejected email:`, error);
    }
  }

  static async onTradeCompleted(tradeId: string): Promise<void> {
    try {
      const trade = await prisma.trade.findUnique({ where: { id: tradeId } });
      if (!trade) return;

      const [sender, receiver, listing] = await Promise.all([
        prisma.profile.findUnique({ where: { id: trade.initiator_id } }),
        prisma.profile.findUnique({ where: { id: trade.responder_id } }),
        prisma.listing.findUnique({ where: { id: trade.listing_id } }),
      ]);

      if (!listing) return;

      const tradeTitle = listing.title || 'Trade';

      // Send to both parties
      if (sender?.email) {
        await emailService.sendTradeCompletedNotification(
          sender.email,
          sender.username,
          receiver?.username || 'User',
          tradeTitle
        );
      }

      if (receiver?.email) {
        await emailService.sendTradeCompletedNotification(
          receiver.email,
          receiver.username,
          sender?.username || 'User',
          tradeTitle
        );
      }

      console.log(`✉️  Trade completed emails sent`);
    } catch (error) {
      console.error(`Failed to send trade completed email:`, error);
    }
  }

  static async onTradeCancelled(tradeId: string, reason?: string): Promise<void> {
    try {
      const trade = await prisma.trade.findUnique({ where: { id: tradeId } });
      if (!trade) return;

      const [sender, receiver, listing] = await Promise.all([
        prisma.profile.findUnique({ where: { id: trade.initiator_id } }),
        prisma.profile.findUnique({ where: { id: trade.responder_id } }),
        prisma.listing.findUnique({ where: { id: trade.listing_id } }),
      ]);

      if (!listing) return;

      const tradeTitle = listing.title || 'Trade';

      // Send to both parties
      if (sender?.email) {
        await emailService.sendTradeCancelledNotification(
          sender.email,
          sender.username,
          receiver?.username || 'User',
          tradeTitle,
          reason
        );
      }

      if (receiver?.email) {
        await emailService.sendTradeCancelledNotification(
          receiver.email,
          receiver.username,
          sender?.username || 'User',
          tradeTitle,
          reason
        );
      }

      console.log(`✉️  Trade cancelled emails sent`);
    } catch (error) {
      console.error(`Failed to send trade cancelled email:`, error);
    }
  }

  // ============ SKILLSHARE SESSION EVENTS ============
  // NOTE: These functions reference models that may not exist in current schema
  // TODO: Verify skillShare_Session model exists or update to correct model name

  /*
  static async onSessionBooked(sessionId: string, participantId: string): Promise<void> {
    try {
      const session = await prisma.skillShare_Session.findUnique({ where: { id: sessionId } });
      if (!session) return;

      const [participant, provider] = await Promise.all([
        prisma.profile.findUnique({ where: { id: participantId } }),
        prisma.profile.findUnique({ where: { id: session.provider_id } }),
      ]);

      if (!participant || !participant.email || !provider) return;

      await emailService.sendSessionBookingConfirmation(
        participant.email,
        participant.display_name || participant.username,
        provider.username,
        session.title,
        session.start_time,
        session.start_time.toLocaleTimeString()
      );

      console.log(`✉️  Session booking confirmation sent to ${participant.email}`);
    } catch (error) {
      console.error(`Failed to send session booking email:`, error);
    }
  }

  static async onSessionReminder(sessionId: string, targetUserId: string): Promise<void> {
    try {
      const session = await prisma.skillShare_Session.findUnique({ where: { id: sessionId } });
      if (!session) return;

      const [targetUser, otherParty] = await Promise.all([
        prisma.profile.findUnique({ where: { id: targetUserId } }),
        prisma.profile.findUnique({ where: { id: session.provider_id } }),
      ]);

      if (!targetUser || !targetUser.email || !otherParty) return;

      const isProvider = targetUserId === session.provider_id;
      const otherUser = isProvider
        ? await prisma.profile.findUnique({ where: { id: session.participant_id } })
        : otherParty;

      if (!otherUser) return;

      await emailService.sendSessionReminder(
        targetUser.email,
        targetUser.username,
        session.title,
        session.start_time,
        session.start_time.toLocaleTimeString(),
        otherUser.username
      );

      console.log(`✉️  Session reminder sent to ${targetUser.email}`);
    } catch (error) {
      console.error(`Failed to send session reminder email:`, error);
    }
  }

  static async onSessionCompleted(sessionId: string): Promise<void> {
    try {
      const session = await prisma.skillShare_Session.findUnique({ where: { id: sessionId } });
      if (!session) return;

      const [provider, participant] = await Promise.all([
        prisma.profile.findUnique({ where: { id: session.provider_id } }),
        prisma.profile.findUnique({ where: { id: session.participant_id } }),
      ]);

      if (!provider || !participant) return;

      // Send to both parties
      if (provider.email) {
        await emailService.sendSessionCompletionNotification(
          provider.email,
          provider.username,
          participant.username,
          session.title
        );
      }

      if (participant.email) {
        await emailService.sendSessionCompletionNotification(
          participant.email,
          participant.username,
          provider.username,
          session.title
        );
      }

      console.log(`✉️  Session completion emails sent`);
    } catch (error) {
      console.error(`Failed to send session completion email:`, error);
    }
  }
  */

  // ============ REVIEW EVENTS ============

  static async onReviewCreated(reviewId: string): Promise<void> {
    try {
      const review = await prisma.review.findUnique({ where: { id: reviewId } });
      if (!review) return;

      const [reviewer, reviewee] = await Promise.all([
        prisma.profile.findUnique({ where: { id: review.author_id } }),
        prisma.profile.findUnique({ where: { id: review.target_user_id } }),
      ]);

      if (!reviewer || !reviewee || !reviewee.email) return;

      await emailService.sendReviewNotification(
        reviewee.email,
        reviewee.username,
        reviewer?.username || 'Someone',
        review.rating,
        review.comment
      );

      console.log(`✉️  Review notification sent to ${reviewee.email}`);
    } catch (error) {
      console.error(`Failed to send review notification:`, error);
    }
  }

  // ============ MESSAGE EVENTS ============

  static async onNewMessage(messageId: string): Promise<void> {
    try {
      const message = await prisma.message.findUnique({ where: { id: messageId } });
      if (!message) return;

      const [sender, receiver] = await Promise.all([
        prisma.profile.findUnique({ where: { id: message.sender_id } }),
        prisma.profile.findUnique({ where: { id: message.receiver_id } }),
      ]);

      if (!sender || !receiver || !receiver.email) return;

      // Only send if user has notifications enabled (optional check)
      // TODO: verify userPreferences model exists
      // const userPreferences = await prisma.userPreferences.findUnique({ where: { user_id: receiver.id } }).catch(() => null);
      // if (userPreferences && !userPreferences.email_on_message) return;

      await emailService.sendNewMessageNotification(
        receiver.email,
        receiver.display_name || receiver.username,
        sender.username,
        message.content
      );

      console.log(`✉️  New message notification sent to ${receiver.email}`);
    } catch (error) {
      console.error(`Failed to send message notification:`, error);
    }
  }

  // ============ COMMUNITY EVENTS ============

  static async onPostCommented(commentId: string): Promise<void> {
    try {
      const comment = await prisma.comment.findUnique({ where: { id: commentId } });
      if (!comment) return;

      const [post, commenter] = await Promise.all([
        prisma.post.findUnique({ where: { id: comment.postId } }),
        prisma.profile.findUnique({ where: { id: comment.authorId } }),
      ]);

      if (!post || !commenter) return;

      const postAuthor = await prisma.profile.findUnique({
        where: { id: post.authorId },
      });

      if (!postAuthor || !postAuthor.email) return;

      // TODO: Add userPreferences check if model is created
      // const userPreferences = await prisma.userPreferences.findUnique({ where: { user_id: postAuthor.id } }).catch(() => null);
      // if (userPreferences && !userPreferences.email_on_comment) return;

      await emailService.sendPostCommentNotification(
        postAuthor.email,
        postAuthor.display_name || postAuthor.username,
        commenter.username,
        post.title || 'Post',
        comment.content
      );

      console.log(`✉️  Post comment notification sent to ${postAuthor.email}`);
    } catch (error) {
      console.error(`Failed to send comment notification:`, error);
    }
  }

  // ============ ADMIN EVENTS ============

  static async onSuspiciousActivity(username: string, activityDescription: string, severity: 'low' | 'medium' | 'high'): Promise<void> {
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail) return;

      await emailService.sendAdminSuspiciousActivityAlert(adminEmail, username, activityDescription, severity);
      console.log(`✉️  Admin alert sent for suspicious activity`);
    } catch (error) {
      console.error(`Failed to send admin alert:`, error);
    }
  }

  static async sendAdminDailyDigest(): Promise<void> {
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail) return;

      const stats = {
        newUsers: await prisma.profile.count({ where: { created_at: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
        newTrades: await prisma.trade.count({ where: { created_at: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
        completedTrades: await prisma.trade.count({
          where: {
            status: 'COMPLETED',
            created_at: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        }),
        reportedIssues: 0, // TODO: Verify 'report' model exists
        suspendedUsers: 0, // TODO: Add suspension tracking to Profile model if needed
      };

      await emailService.sendAdminDailyDigest(adminEmail, stats);
      console.log(`✉️  Admin daily digest sent`);
    } catch (error) {
      console.error(`Failed to send admin daily digest:`, error);
    }
  }
}
