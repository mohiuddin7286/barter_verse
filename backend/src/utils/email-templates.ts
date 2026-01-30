/**
 * Email template builder with HTML templates for all transactional emails
 */

const baseTemplate = (content: string, heading?: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 10px 0 0 0; opacity: 0.9; }
    .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px; }
    .content h2 { color: #667eea; margin-top: 0; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin: 20px 0; font-weight: 600; }
    .button:hover { background: #764ba2; }
    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; border-top: 1px solid #e0e0e0; margin-top: 20px; }
    .alert { padding: 15px; border-left: 4px solid #ff9800; background: #fff3e0; margin: 15px 0; border-radius: 4px; }
    .success { padding: 15px; border-left: 4px solid #4caf50; background: #f1f8e9; margin: 15px 0; border-radius: 4px; }
    .info { padding: 15px; border-left: 4px solid #2196f3; background: #e3f2fd; margin: 15px 0; border-radius: 4px; }
    .highlight { background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0; }
    .divider { border-top: 1px solid #e0e0e0; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    ${heading ? `<div class="header"><h1>BarterVerse</h1><p>${heading}</p></div>` : ''}
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© 2025 BarterVerse. All rights reserved.</p>
      <p>If you have questions, please contact us at support@barterverse.com</p>
    </div>
  </div>
</body>
</html>
`;

export const emailTemplates = {
  // ============ WELCOME & ACCOUNT EMAILS ============

  welcome: (username: string, firstName?: string): string => {
    const name = firstName || username;
    return baseTemplate(
      `
      <h2>Welcome to BarterVerse, ${name}! 🎉</h2>
      <p>Thank you for joining our peer-to-peer trading and skill-sharing community. We're excited to have you on board!</p>
      <div class="success">
        <p><strong>What can you do now?</strong></p>
        <ul>
          <li>Create listings for items you want to trade</li>
          <li>Browse community posts and engage with other traders</li>
          <li>Schedule SkillShare sessions to teach or learn new skills</li>
          <li>Connect with traders in your area</li>
        </ul>
      </div>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="button">Get Started</a></p>
      <p>Questions? Check out our <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/help">Help Center</a> or contact support@barterverse.com</p>
      `,
      'Welcome to BarterVerse!'
    );
  },

  emailVerification: (username: string, verificationLink: string): string => {
    return baseTemplate(
      `
      <h2>Verify Your Email</h2>
      <p>Hi ${username},</p>
      <p>Please verify your email address to activate your BarterVerse account.</p>
      <p><a href="${verificationLink}" class="button">Verify Email</a></p>
      <p style="color: #999; font-size: 12px;">If you didn't create this account, you can safely ignore this email.</p>
      `,
      'Email Verification'
    );
  },

  passwordReset: (username: string, resetLink: string): string => {
    return baseTemplate(
      `
      <h2>Reset Your Password</h2>
      <p>Hi ${username},</p>
      <p>We received a request to reset your BarterVerse password. Click the button below to set a new password.</p>
      <p><a href="${resetLink}" class="button">Reset Password</a></p>
      <div class="alert">
        <p><strong>This link expires in 24 hours.</strong></p>
      </div>
      <p style="color: #999; font-size: 12px;">If you didn't request this, you can safely ignore this email. Your password won't change until you create a new one.</p>
      `,
      'Password Reset'
    );
  },

  passwordChanged: (username: string): string => {
    return baseTemplate(
      `
      <h2>Password Changed</h2>
      <p>Hi ${username},</p>
      <p>Your BarterVerse password was successfully changed.</p>
      <div class="success">
        <p>If you didn't make this change, please <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/account/security">update your password immediately</a> or contact support.</p>
      </div>
      `,
      'Password Update'
    );
  },

  accountSuspended: (username: string, reason?: string): string => {
    return baseTemplate(
      `
      <h2>Account Suspended</h2>
      <p>Hi ${username},</p>
      <p>Your BarterVerse account has been suspended due to a violation of our community guidelines.</p>
      ${reason ? `<div class="alert"><p><strong>Reason:</strong> ${reason}</p></div>` : ''}
      <p>If you believe this is a mistake, please contact our support team at support@barterverse.com to appeal.</p>
      `,
      'Account Suspended'
    );
  },

  accountReactivated: (username: string): string => {
    return baseTemplate(
      `
      <h2>Account Reactivated</h2>
      <p>Hi ${username},</p>
      <p>Your BarterVerse account has been reactivated and is now ready to use.</p>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="button">Back to Dashboard</a></p>
      `,
      'Account Reactivated'
    );
  },

  // ============ TRADE NOTIFICATIONS ============

  tradeOffer: (recipientName: string, offerFromUsername: string, tradeTitle: string): string => {
    return baseTemplate(
      `
      <h2>New Trade Offer</h2>
      <p>Hi ${recipientName},</p>
      <p><strong>${offerFromUsername}</strong> has sent you a trade offer for:</p>
      <div class="highlight">
        <p><strong>${tradeTitle}</strong></p>
      </div>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/trades" class="button">View Trade Offer</a></p>
      `,
      'New Trade Offer'
    );
  },

  tradeAccepted: (senderName: string, recipientUsername: string, tradeTitle: string): string => {
    return baseTemplate(
      `
      <h2>Trade Offer Accepted! 🎉</h2>
      <p>Hi ${senderName},</p>
      <p><strong>${recipientUsername}</strong> has accepted your trade offer for:</p>
      <div class="highlight">
        <p><strong>${tradeTitle}</strong></p>
      </div>
      <p>Next steps:</p>
      <ul>
        <li>Confirm the trade details in your dashboard</li>
        <li>Arrange pickup/delivery with ${recipientUsername}</li>
        <li>Complete the trade and leave a review</li>
      </ul>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/trades" class="button">View Trade</a></p>
      `,
      'Trade Offer Accepted'
    );
  },

  tradeRejected: (senderName: string, recipientUsername: string, tradeTitle: string, reason?: string): string => {
    return baseTemplate(
      `
      <h2>Trade Offer Declined</h2>
      <p>Hi ${senderName},</p>
      <p><strong>${recipientUsername}</strong> has declined your trade offer for:</p>
      <div class="highlight">
        <p><strong>${tradeTitle}</strong></p>
      </div>
      ${reason ? `<div class="alert"><p><strong>Reason:</strong> ${reason}</p></div>` : ''}
      <p>Don't worry! Keep exploring the community to find other trading opportunities.</p>
      `,
      'Trade Offer Declined'
    );
  },

  tradeCompleted: (username: string, otherPartyUsername: string, tradeTitle: string): string => {
    return baseTemplate(
      `
      <h2>Trade Completed! ✅</h2>
      <p>Hi ${username},</p>
      <p>Your trade with <strong>${otherPartyUsername}</strong> has been marked as completed:</p>
      <div class="highlight">
        <p><strong>${tradeTitle}</strong></p>
      </div>
      <p>We'd love to hear about your experience! Please leave a review for ${otherPartyUsername}.</p>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/reviews/new" class="button">Leave a Review</a></p>
      `,
      'Trade Completed'
    );
  },

  tradeCancelled: (username: string, otherPartyUsername: string, tradeTitle: string, reason?: string): string => {
    return baseTemplate(
      `
      <h2>Trade Cancelled</h2>
      <p>Hi ${username},</p>
      <p>Your trade with <strong>${otherPartyUsername}</strong> has been cancelled:</p>
      <div class="highlight">
        <p><strong>${tradeTitle}</strong></p>
      </div>
      ${reason ? `<div class="alert"><p><strong>Reason:</strong> ${reason}</p></div>` : ''}
      <p>Feel free to create a new trade offer or explore other listings.</p>
      `,
      'Trade Cancelled'
    );
  },

  // ============ SKILLSHARE SESSION NOTIFICATIONS ============

  sessionBookingConfirmation: (
    participantName: string,
    providerUsername: string,
    sessionTitle: string,
    sessionDate: Date,
    sessionTime: string
  ): string => {
    const formattedDate = sessionDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return baseTemplate(
      `
      <h2>Session Booking Confirmed! ✅</h2>
      <p>Hi ${participantName},</p>
      <p>Your SkillShare session with <strong>${providerUsername}</strong> has been confirmed:</p>
      <div class="highlight">
        <p><strong>${sessionTitle}</strong></p>
        <p>📅 ${formattedDate}</p>
        <p>🕐 ${sessionTime}</p>
      </div>
      <p>Get ready to learn something new! Make sure to prepare any materials you might need.</p>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/sessions" class="button">View Session Details</a></p>
      `,
      'Session Booking Confirmed'
    );
  },

  sessionReminder: (
    username: string,
    sessionTitle: string,
    sessionDate: Date,
    sessionTime: string,
    otherPartyUsername: string
  ): string => {
    const formattedDate = sessionDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });

    return baseTemplate(
      `
      <h2>Upcoming Session Reminder</h2>
      <p>Hi ${username},</p>
      <p>You have an upcoming SkillShare session coming up:</p>
      <div class="highlight">
        <p><strong>${sessionTitle}</strong></p>
        <p>📅 ${formattedDate} at ${sessionTime}</p>
        <p>👤 With <strong>${otherPartyUsername}</strong></p>
      </div>
      <p>Don't forget to prepare and join on time!</p>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/sessions" class="button">View Session</a></p>
      `,
      'Session Reminder'
    );
  },

  sessionCompletion: (username: string, otherPartyUsername: string, sessionTitle: string): string => {
    return baseTemplate(
      `
      <h2>Session Completed! 🎓</h2>
      <p>Hi ${username},</p>
      <p>Your SkillShare session with <strong>${otherPartyUsername}</strong> has been marked as completed:</p>
      <div class="highlight">
        <p><strong>${sessionTitle}</strong></p>
      </div>
      <p>Thanks for participating! Please rate your experience and leave feedback.</p>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/reviews/new" class="button">Rate & Review</a></p>
      `,
      'Session Completed'
    );
  },

  sessionCancellation: (username: string, sessionTitle: string, reason?: string): string => {
    return baseTemplate(
      `
      <h2>Session Cancelled</h2>
      <p>Hi ${username},</p>
      <p>The following SkillShare session has been cancelled:</p>
      <div class="highlight">
        <p><strong>${sessionTitle}</strong></p>
      </div>
      ${reason ? `<div class="alert"><p><strong>Reason:</strong> ${reason}</p></div>` : ''}
      <p>You can book another session with this provider or explore other available sessions.</p>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/sessions" class="button">Browse Sessions</a></p>
      `,
      'Session Cancelled'
    );
  },

  // ============ REVIEW NOTIFICATIONS ============

  reviewNotification: (revieweeUsername: string, reviewerUsername: string, rating: number, reviewText: string): string => {
    const stars = '⭐'.repeat(rating);
    return baseTemplate(
      `
      <h2>New Review Received</h2>
      <p>Hi ${revieweeUsername},</p>
      <p><strong>${reviewerUsername}</strong> left you a review:</p>
      <div class="highlight">
        <p>${stars} (${rating}/5)</p>
        <p>"${reviewText.substring(0, 200)}${reviewText.length > 200 ? '...' : ''}"</p>
      </div>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile/${revieweeUsername}/reviews" class="button">View All Reviews</a></p>
      `,
      'New Review'
    );
  },

  // ============ MESSAGE NOTIFICATIONS ============

  newMessageNotification: (recipientName: string, senderUsername: string, messagePreview: string): string => {
    return baseTemplate(
      `
      <h2>New Message</h2>
      <p>Hi ${recipientName},</p>
      <p><strong>${senderUsername}</strong> sent you a message:</p>
      <div class="highlight">
        <p>"${messagePreview.substring(0, 200)}${messagePreview.length > 200 ? '...' : ''}"</p>
      </div>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/chat/${senderUsername}" class="button">Reply</a></p>
      `,
      'New Message'
    );
  },

  // ============ COMMUNITY NOTIFICATIONS ============

  postCommentNotification: (
    authorName: string,
    commenterUsername: string,
    postTitle: string,
    commentPreview: string
  ): string => {
    return baseTemplate(
      `
      <h2>New Comment on Your Post</h2>
      <p>Hi ${authorName},</p>
      <p><strong>${commenterUsername}</strong> commented on your post <strong>"${postTitle}"</strong>:</p>
      <div class="highlight">
        <p>"${commentPreview.substring(0, 200)}${commentPreview.length > 200 ? '...' : ''}"</p>
      </div>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/community/posts/${postTitle}" class="button">View Discussion</a></p>
      `,
      'New Comment'
    );
  },

  // ============ ADMIN NOTIFICATIONS ============

  adminAlert: (username: string, activityDescription: string, severity: 'low' | 'medium' | 'high'): string => {
    const severityColor = severity === 'high' ? '#d32f2f' : severity === 'medium' ? '#ff9800' : '#1976d2';
    const alertClass = severity === 'high' ? 'alert' : 'info';

    return baseTemplate(
      `
      <h2>Suspicious Activity Alert</h2>
      <div class="${alertClass}">
        <p><strong>Severity:</strong> ${severity.toUpperCase()}</p>
        <p><strong>User:</strong> ${username}</p>
        <p><strong>Activity:</strong> ${activityDescription}</p>
      </div>
      <p>Please review this activity and take appropriate action if necessary.</p>
      <p><a href="${process.env.ADMIN_URL || 'http://localhost:5173/admin'}/users/${username}" class="button">View User</a></p>
      `,
      'Security Alert'
    );
  },

  adminDailyDigest: (stats: {
    newUsers: number;
    newTrades: number;
    completedTrades: number;
    reportedIssues: number;
    suspendedUsers: number;
  }): string => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return baseTemplate(
      `
      <h2>Daily Admin Digest</h2>
      <p>${today}</p>
      <div class="highlight">
        <p><strong>📊 Daily Stats:</strong></p>
        <ul>
          <li>New Users: ${stats.newUsers}</li>
          <li>New Trades: ${stats.newTrades}</li>
          <li>Completed Trades: ${stats.completedTrades}</li>
          <li>Reported Issues: ${stats.reportedIssues}</li>
          <li>Suspended Users: ${stats.suspendedUsers}</li>
        </ul>
      </div>
      <p><a href="${process.env.ADMIN_URL || 'http://localhost:5173/admin'}/dashboard" class="button">View Dashboard</a></p>
      `,
      'Daily Digest'
    );
  },

  // ============ TEST EMAIL ============

  test: (): string => {
    return baseTemplate(
      `
      <h2>Email Test Successful! ✅</h2>
      <p>This is a test email from BarterVerse.</p>
      <p>Your email configuration is working properly.</p>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button">Go to BarterVerse</a></p>
      `,
      'Email Test'
    );
  },
};
