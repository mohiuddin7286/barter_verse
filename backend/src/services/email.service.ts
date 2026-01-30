import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import { emailTemplates } from '../utils/email-templates';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured = false;

  constructor() {
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter based on environment
   */
  private initializeTransporter(): void {
    const emailProvider = process.env.EMAIL_PROVIDER || 'smtp';
    const appEmail = process.env.EMAIL_FROM || 'noreply@barterverse.com';

    try {
      if (emailProvider === 'smtp') {
        // SMTP Configuration (Gmail, SendGrid, etc.)
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        });

        this.isConfigured = true;
        console.log('✅ Email service configured with SMTP');
      } else if (emailProvider === 'sendgrid') {
        // SendGrid Configuration
        this.transporter = nodemailer.createTransport({
          host: 'smtp.sendgrid.net',
          port: 587,
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY,
          },
        });

        this.isConfigured = true;
        console.log('✅ Email service configured with SendGrid');
      } else if (emailProvider === 'dev') {
        // Development mode - just log emails
        console.log('⚠️  Email service in development mode (emails will be logged only)');
        this.isConfigured = true;
      }
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
      this.isConfigured = false;
    }
  }

  /**
   * Send a generic email
   */
  async sendEmail(options: EmailOptions): Promise<SendEmailResult> {
    if (!this.isConfigured) {
      console.warn('Email service not configured. Email not sent:', options.to);
      return { success: false, error: 'Email service not configured' };
    }

    if (process.env.EMAIL_PROVIDER === 'dev') {
      // Development mode - just log
      console.log('📧 [DEV] Email to:', options.to);
      console.log('📧 [DEV] Subject:', options.subject);
      console.log('📧 [DEV] Preview:', options.html.substring(0, 100));
      return { success: true, messageId: 'dev-' + Date.now() };
    }

    try {
      const mailOptions: SendMailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@barterverse.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const info = await this.transporter!.sendMail(mailOptions);
      console.log('✅ Email sent to:', options.to, '- ID:', info.messageId);

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ============ WELCOME & ACCOUNT EMAILS ============

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(email: string, username: string, firstName?: string): Promise<SendEmailResult> {
    const html = emailTemplates.welcome(username, firstName);
    return this.sendEmail({
      to: email,
      subject: `Welcome to BarterVerse, ${firstName || username}!`,
      html,
    });
  }

  /**
   * Send email verification/confirmation
   */
  async sendEmailVerification(email: string, username: string, verificationLink: string): Promise<SendEmailResult> {
    const html = emailTemplates.emailVerification(username, verificationLink);
    return this.sendEmail({
      to: email,
      subject: 'Verify Your BarterVerse Email',
      html,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string, username: string, resetLink: string): Promise<SendEmailResult> {
    const html = emailTemplates.passwordReset(username, resetLink);
    return this.sendEmail({
      to: email,
      subject: 'Reset Your BarterVerse Password',
      html,
    });
  }

  /**
   * Send password changed confirmation
   */
  async sendPasswordChanged(email: string, username: string): Promise<SendEmailResult> {
    const html = emailTemplates.passwordChanged(username);
    return this.sendEmail({
      to: email,
      subject: 'Your BarterVerse Password Has Been Changed',
      html,
    });
  }

  /**
   * Send account suspended notification
   */
  async sendAccountSuspended(email: string, username: string, reason?: string): Promise<SendEmailResult> {
    const html = emailTemplates.accountSuspended(username, reason);
    return this.sendEmail({
      to: email,
      subject: 'Your BarterVerse Account Has Been Suspended',
      html,
    });
  }

  /**
   * Send account reactivation confirmation
   */
  async sendAccountReactivated(email: string, username: string): Promise<SendEmailResult> {
    const html = emailTemplates.accountReactivated(username);
    return this.sendEmail({
      to: email,
      subject: 'Your BarterVerse Account Has Been Reactivated',
      html,
    });
  }

  // ============ TRADE NOTIFICATIONS ============

  /**
   * Send trade offer notification
   */
  async sendTradeOfferNotification(
    email: string,
    recipientName: string,
    offerFromUsername: string,
    tradeTitle: string,
    tradeId: string
  ): Promise<SendEmailResult> {
    const html = emailTemplates.tradeOffer(recipientName, offerFromUsername, tradeTitle);
    return this.sendEmail({
      to: email,
      subject: `${offerFromUsername} sent you a trade offer`,
      html,
    });
  }

  /**
   * Send trade offer accepted notification
   */
  async sendTradeAcceptedNotification(
    email: string,
    senderName: string,
    recipientUsername: string,
    tradeTitle: string
  ): Promise<SendEmailResult> {
    const html = emailTemplates.tradeAccepted(senderName, recipientUsername, tradeTitle);
    return this.sendEmail({
      to: email,
      subject: `${recipientUsername} accepted your trade offer`,
      html,
    });
  }

  /**
   * Send trade offer rejected notification
   */
  async sendTradeRejectedNotification(
    email: string,
    senderName: string,
    recipientUsername: string,
    tradeTitle: string,
    reason?: string
  ): Promise<SendEmailResult> {
    const html = emailTemplates.tradeRejected(senderName, recipientUsername, tradeTitle, reason);
    return this.sendEmail({
      to: email,
      subject: `${recipientUsername} rejected your trade offer`,
      html,
    });
  }

  /**
   * Send trade completed notification
   */
  async sendTradeCompletedNotification(
    email: string,
    username: string,
    otherPartyUsername: string,
    tradeTitle: string
  ): Promise<SendEmailResult> {
    const html = emailTemplates.tradeCompleted(username, otherPartyUsername, tradeTitle);
    return this.sendEmail({
      to: email,
      subject: `Trade "${tradeTitle}" has been completed`,
      html,
    });
  }

  /**
   * Send trade cancelled notification
   */
  async sendTradeCancelledNotification(
    email: string,
    username: string,
    otherPartyUsername: string,
    tradeTitle: string,
    reason?: string
  ): Promise<SendEmailResult> {
    const html = emailTemplates.tradeCancelled(username, otherPartyUsername, tradeTitle, reason);
    return this.sendEmail({
      to: email,
      subject: `Trade "${tradeTitle}" has been cancelled`,
      html,
    });
  }

  // ============ SKILLSHARE SESSION NOTIFICATIONS ============

  /**
   * Send session booking confirmation
   */
  async sendSessionBookingConfirmation(
    email: string,
    participantName: string,
    providerUsername: string,
    sessionTitle: string,
    sessionDate: Date,
    sessionTime: string
  ): Promise<SendEmailResult> {
    const html = emailTemplates.sessionBookingConfirmation(
      participantName,
      providerUsername,
      sessionTitle,
      sessionDate,
      sessionTime
    );
    return this.sendEmail({
      to: email,
      subject: `Session Booking Confirmed - "${sessionTitle}"`,
      html,
    });
  }

  /**
   * Send session reminder
   */
  async sendSessionReminder(
    email: string,
    username: string,
    sessionTitle: string,
    sessionDate: Date,
    sessionTime: string,
    otherPartyUsername: string
  ): Promise<SendEmailResult> {
    const html = emailTemplates.sessionReminder(
      username,
      sessionTitle,
      sessionDate,
      sessionTime,
      otherPartyUsername
    );
    return this.sendEmail({
      to: email,
      subject: `Reminder: "${sessionTitle}" scheduled for ${sessionDate.toLocaleDateString()}`,
      html,
    });
  }

  /**
   * Send session completion notification
   */
  async sendSessionCompletionNotification(
    email: string,
    username: string,
    otherPartyUsername: string,
    sessionTitle: string
  ): Promise<SendEmailResult> {
    const html = emailTemplates.sessionCompletion(username, otherPartyUsername, sessionTitle);
    return this.sendEmail({
      to: email,
      subject: `Session "${sessionTitle}" has been completed`,
      html,
    });
  }

  /**
   * Send session cancellation notification
   */
  async sendSessionCancellationNotification(
    email: string,
    username: string,
    sessionTitle: string,
    reason?: string
  ): Promise<SendEmailResult> {
    const html = emailTemplates.sessionCancellation(username, sessionTitle, reason);
    return this.sendEmail({
      to: email,
      subject: `Session "${sessionTitle}" has been cancelled`,
      html,
    });
  }

  // ============ REVIEW NOTIFICATIONS ============

  /**
   * Send new review notification
   */
  async sendReviewNotification(
    email: string,
    revieweeUsername: string,
    reviewerUsername: string,
    rating: number,
    reviewText: string
  ): Promise<SendEmailResult> {
    const html = emailTemplates.reviewNotification(revieweeUsername, reviewerUsername, rating, reviewText);
    return this.sendEmail({
      to: email,
      subject: `${reviewerUsername} left you a ${rating}-star review`,
      html,
    });
  }

  // ============ MESSAGE NOTIFICATIONS ============

  /**
   * Send new message notification
   */
  async sendNewMessageNotification(
    email: string,
    recipientName: string,
    senderUsername: string,
    messagePreview: string
  ): Promise<SendEmailResult> {
    const html = emailTemplates.newMessageNotification(recipientName, senderUsername, messagePreview);
    return this.sendEmail({
      to: email,
      subject: `New message from ${senderUsername}`,
      html,
    });
  }

  // ============ COMMUNITY NOTIFICATIONS ============

  /**
   * Send community post comment notification
   */
  async sendPostCommentNotification(
    email: string,
    authorName: string,
    commenterUsername: string,
    postTitle: string,
    commentPreview: string
  ): Promise<SendEmailResult> {
    const html = emailTemplates.postCommentNotification(authorName, commenterUsername, postTitle, commentPreview);
    return this.sendEmail({
      to: email,
      subject: `${commenterUsername} commented on your post`,
      html,
    });
  }

  // ============ ADMIN NOTIFICATIONS ============

  /**
   * Send admin notification for suspicious activity
   */
  async sendAdminSuspiciousActivityAlert(
    adminEmail: string,
    username: string,
    activityDescription: string,
    severity: 'low' | 'medium' | 'high'
  ): Promise<SendEmailResult> {
    const html = emailTemplates.adminAlert(username, activityDescription, severity);
    return this.sendEmail({
      to: adminEmail,
      subject: `[${severity.toUpperCase()}] Suspicious activity detected from ${username}`,
      html,
    });
  }

  /**
   * Send admin daily digest
   */
  async sendAdminDailyDigest(
    adminEmail: string,
    stats: {
      newUsers: number;
      newTrades: number;
      completedTrades: number;
      reportedIssues: number;
      suspendedUsers: number;
    }
  ): Promise<SendEmailResult> {
    const html = emailTemplates.adminDailyDigest(stats);
    return this.sendEmail({
      to: adminEmail,
      subject: 'BarterVerse Daily Admin Digest',
      html,
    });
  }

  // ============ BATCH OPERATIONS ============

  /**
   * Send bulk emails
   */
  async sendBulkEmails(
    recipients: Array<{ email: string; name: string }>,
    subject: string,
    htmlTemplate: (name: string) => string
  ): Promise<{ successful: number; failed: number; errors: string[] }> {
    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const recipient of recipients) {
      try {
        const result = await this.sendEmail({
          to: recipient.email,
          subject,
          html: htmlTemplate(recipient.name),
        });

        if (result.success) {
          results.successful++;
        } else {
          results.failed++;
          results.errors.push(`${recipient.email}: ${result.error}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`${recipient.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return results;
  }

  // ============ UTILITY METHODS ============

  /**
   * Test email configuration
   */
  async testEmail(testEmail: string): Promise<SendEmailResult> {
    const html = emailTemplates.test();
    return this.sendEmail({
      to: testEmail,
      subject: 'BarterVerse Email Test',
      html,
    });
  }

  /**
   * Check if email service is properly configured
   */
  isReady(): boolean {
    return this.isConfigured;
  }
}

export const emailService = new EmailService();
