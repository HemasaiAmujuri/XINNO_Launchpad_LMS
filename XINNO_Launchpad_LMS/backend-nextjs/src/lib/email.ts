import nodemailer from 'nodemailer';

// Email configuration from environment
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'rawoof.abdul@yardglobalsolutions.com',
    pass: process.env.SMTP_PASS || 'qhbgesutekypavcl',
  },
};

// Create reusable transporter
const transporter = nodemailer.createTransport(SMTP_CONFIG);

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service error:', error);
  } else {
    console.log('✅ Email service ready to send messages');
  }
});

// Email templates
const EMAIL_TEMPLATES = {
  projectAssignment: (studentName: string, projectTitle: string, mentorName: string, startDate: string, endDate: string) => ({
    subject: `🎯 New Project Assigned: ${projectTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #667eea; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 New Project Assigned!</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${studentName}</strong>,</p>
            <p>Great news! A new project has been assigned to you.</p>
            
            <div class="details">
              <h3 style="color: #667eea; margin-top: 0;">📋 Project Details</h3>
              <div class="detail-row">
                <span class="detail-label">Project Title:</span>
                <span>${projectTitle}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Mentor:</span>
                <span>${mentorName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Start Date:</span>
                <span>${startDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">End Date:</span>
                <span>${endDate}</span>
              </div>
            </div>
            
            <p>Please login to your dashboard to view complete project details, timeline, and start working on the stages.</p>
            
            <a href="http://localhost:4200/projects" class="button">View Project →</a>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              💡 <strong>Tip:</strong> Make sure to update your progress regularly and upload documents for each stage.
            </p>
          </div>
          <div class="footer">
            <p>© 2026 XINNO Launchpad. All rights reserved.</p>
            <p>This is an automated message, please do not reply directly.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  passwordChanged: (userName: string) => ({
    subject: '🔒 Password Changed Successfully',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .security-tips { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Changed</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Your password has been successfully changed.</p>
            
            <div class="alert-box">
              <strong>⚠️ Important:</strong> If you did not make this change, please contact your administrator immediately.
            </div>
            
            <div class="security-tips">
              <h3 style="color: #f5576c; margin-top: 0;">🛡️ Security Tips</h3>
              <ul>
                <li>Never share your password with anyone</li>
                <li>Use a strong, unique password</li>
                <li>Change your password regularly</li>
                <li>Enable two-factor authentication if available</li>
              </ul>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              If you have any concerns, please contact support immediately.
            </p>
          </div>
          <div class="footer">
            <p>© 2026 XINNO Launchpad. All rights reserved.</p>
            <p>This is an automated security notification.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  adminReviewSubmitted: (studentName: string, itemType: string, itemTitle: string, reviewerName: string, isApproved: boolean, remarks: string, rating?: number) => ({
    subject: `${isApproved ? '✅' : '📝'} Review Received: ${itemTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${isApproved ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .review-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${isApproved ? '#38ef7d' : '#f5576c'}; }
          .status { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; background: ${isApproved ? '#d4edda' : '#fff3cd'}; color: ${isApproved ? '#155724' : '#856404'}; }
          .stars { color: #ffc107; font-size: 20px; }
          .remarks { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; font-style: italic; }
          .button { display: inline-block; background: ${isApproved ? '#38ef7d' : '#667eea'}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isApproved ? '✅ Approved!' : '📝 Review Received'}</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${studentName}</strong>,</p>
            <p>Your ${itemType} has been reviewed by <strong>${reviewerName}</strong>.</p>
            
            <div class="review-box">
              <h3 style="margin-top: 0;">📄 ${itemTitle}</h3>
              <p><strong>Status:</strong> <span class="status">${isApproved ? 'APPROVED' : 'NEEDS IMPROVEMENT'}</span></p>
              
              ${rating ? `
                <p><strong>Rating:</strong> <span class="stars">${'⭐'.repeat(rating)}</span> (${rating}/5)</p>
              ` : ''}
              
              ${remarks ? `
                <div class="remarks">
                  <strong>Reviewer Remarks:</strong><br>
                  ${remarks}
                </div>
              ` : ''}
            </div>
            
            ${isApproved ? `
              <p>🎉 Congratulations! Your work has been approved. Keep up the great work!</p>
            ` : `
              <p>📚 Please review the feedback carefully and make the necessary improvements. You can resubmit after addressing the comments.</p>
            `}
            
            <a href="http://localhost:4200/projects" class="button">View Details →</a>
          </div>
          <div class="footer">
            <p>© 2026 XINNO Launchpad. All rights reserved.</p>
            <p>This is an automated notification.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  assessmentReviewed: (studentName: string, assessmentTitle: string, score: number, totalMarks: number, passingMarks: number, passed: boolean, reviewerName: string, remarks?: string) => ({
    subject: `${passed ? '🎉' : '📊'} Assessment Result: ${assessmentTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${passed ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' : 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .score-box { background: white; padding: 30px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .score { font-size: 48px; font-weight: bold; color: ${passed ? '#38ef7d' : '#f45c43'}; }
          .status { display: inline-block; padding: 10px 20px; border-radius: 20px; font-weight: bold; font-size: 16px; background: ${passed ? '#d4edda' : '#f8d7da'}; color: ${passed ? '#155724' : '#721c24'}; margin: 20px 0; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .remarks { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${passed ? '🎉 Congratulations!' : '📊 Assessment Reviewed'}</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${studentName}</strong>,</p>
            <p>Your assessment <strong>"${assessmentTitle}"</strong> has been reviewed by <strong>${reviewerName}</strong>.</p>
            
            <div class="score-box">
              <div class="score">${score} / ${totalMarks}</div>
              <div style="color: #666; margin: 10px 0;">Your Score</div>
              <div class="status">${passed ? '✅ PASSED' : '❌ NOT PASSED'}</div>
            </div>
            
            <div class="details">
              <div class="detail-row">
                <span><strong>Total Marks:</strong></span>
                <span>${totalMarks}</span>
              </div>
              <div class="detail-row">
                <span><strong>Passing Marks:</strong></span>
                <span>${passingMarks}</span>
              </div>
              <div class="detail-row">
                <span><strong>Your Score:</strong></span>
                <span style="color: ${passed ? '#38ef7d' : '#f45c43'}; font-weight: bold;">${score}</span>
              </div>
              <div class="detail-row">
                <span><strong>Percentage:</strong></span>
                <span>${((score / totalMarks) * 100).toFixed(1)}%</span>
              </div>
            </div>
            
            ${remarks ? `
              <div class="remarks">
                <strong>📝 Reviewer Remarks:</strong><br>
                ${remarks}
              </div>
            ` : ''}
            
            ${passed ? `
              <p>🎊 <strong>Well done!</strong> You have successfully passed this assessment. Keep up the excellent work!</p>
            ` : `
              <p>📚 Don't worry! Review the material and you can attempt again. Study the areas mentioned in the feedback.</p>
            `}
            
            <a href="http://localhost:4200/assessments" class="button">View Assessment Details →</a>
          </div>
          <div class="footer">
            <p>© 2026 XINNO Launchpad. All rights reserved.</p>
            <p>This is an automated notification.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

// Email sending functions
export async function sendProjectAssignmentEmail(
  studentEmail: string,
  studentName: string,
  projectTitle: string,
  mentorName: string,
  startDate: string,
  endDate: string
) {
  try {
    const template = EMAIL_TEMPLATES.projectAssignment(studentName, projectTitle, mentorName, startDate, endDate);
    
    const info = await transporter.sendMail({
      from: `"Oraxinno LMS" <${SMTP_CONFIG.auth.user}>`,
      to: studentEmail,
      subject: template.subject,
      html: template.html,
    });

    console.log('✅ Project assignment email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending project assignment email:', error);
    return { success: false, error };
  }
}

export async function sendPasswordChangedEmail(userEmail: string, userName: string) {
  try {
    const template = EMAIL_TEMPLATES.passwordChanged(userName);
    
    const info = await transporter.sendMail({
      from: `"XINNO Launchpad" <${SMTP_CONFIG.auth.user}>`,
      to: userEmail,
      subject: template.subject,
      html: template.html,
    });

    console.log('✅ Password changed email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending password changed email:', error);
    return { success: false, error };
  }
}

export async function sendAdminReviewEmail(
  studentEmail: string,
  studentName: string,
  itemType: 'Project Stage' | 'Assessment' | 'Feedback',
  itemTitle: string,
  reviewerName: string,
  isApproved: boolean,
  remarks: string,
  rating?: number
) {
  try {
    const template = EMAIL_TEMPLATES.adminReviewSubmitted(
      studentName,
      itemType,
      itemTitle,
      reviewerName,
      isApproved,
      remarks,
      rating
    );
    
    const info = await transporter.sendMail({
      from: `"XINNO Launchpad" <${SMTP_CONFIG.auth.user}>`,
      to: studentEmail,
      subject: template.subject,
      html: template.html,
    });

    console.log('✅ Admin review email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending admin review email:', error);
    return { success: false, error };
  }
}

export async function sendAssessmentReviewEmail(
  studentEmail: string,
  studentName: string,
  assessmentTitle: string,
  score: number,
  totalMarks: number,
  passingMarks: number,
  passed: boolean,
  reviewerName: string,
  remarks?: string
) {
  try {
    const template = EMAIL_TEMPLATES.assessmentReviewed(
      studentName,
      assessmentTitle,
      score,
      totalMarks,
      passingMarks,
      passed,
      reviewerName,
      remarks
    );
    
    const info = await transporter.sendMail({
      from: `"XINNO Launchpad" <${SMTP_CONFIG.auth.user}>`,
      to: studentEmail,
      subject: template.subject,
      html: template.html,
    });

    console.log('✅ Assessment review email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending assessment review email:', error);
    return { success: false, error };
  }
}

// Send password reset email
export async function sendPasswordResetEmail(toEmail: string, userName: string, resetUrl: string) {
  try {
    const info = await transporter.sendMail({
      from: `"XINNO Launchpad" <${SMTP_CONFIG.auth.user}>`,
      to: toEmail,
      subject: '🔑 Reset Your Password - XINNO Launchpad',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔑 Reset Your Password</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${userName}</strong>,</p>
              <p>We received a request to reset your password for your XINNO Launchpad account.</p>
              
              <p>Click the button below to reset your password:</p>
              
              <center>
                <a href="${resetUrl}" class="button">Reset Password</a>
              </center>
              
              <p style="color: #666; font-size: 14px; margin-top: 20px;">
                Or copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
              </p>
              
              <div class="warning">
                <p style="margin: 0;"><strong>⚠️ Security Notice:</strong></p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>This link will expire in 1 hour</li>
                  <li>If you didn't request this, please ignore this email</li>
                  <li>Your password won't change until you create a new one</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <p>© 2026 XINNO Launchpad. All rights reserved.</p>
              <p>This is an automated message, please do not reply directly.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log('✅ Password reset email sent to:', toEmail);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    return { success: false, error };
  }
}

// Test email function
export async function sendTestEmail(toEmail: string) {
  try {
    const info = await transporter.sendMail({
      from: `"XINNO Launchpad" <${SMTP_CONFIG.auth.user}>`,
      to: toEmail,
      subject: '✅ Email Service Test - XINNO Launchpad',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>🎉 Email Service is Working!</h2>
          <p>This is a test email from XINNO Launchpad.</p>
          <p>If you received this, the email integration is configured correctly.</p>
        </div>
      `,
    });

    console.log('✅ Test email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending test email:', error);
    return { success: false, error };
  }
}
