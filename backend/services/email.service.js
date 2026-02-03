const SibApiV3Sdk = require('sib-api-v3-sdk');

class EmailService {
  constructor() {
    this.apiKey = process.env.BREVO_API_KEY;
    this.senderEmail = process.env.BREVO_SENDER_EMAIL;
    this.senderName = process.env.BREVO_SENDER_NAME || 'Demand Planning System';
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    // Initialize the Brevo client
    this.apiInstance = null;
    this.initializeClient();
  }

  initializeClient() {
    try {
      if (!this.apiKey) {
        console.warn('⚠️ BREVO_API_KEY not configured. Email notifications will be disabled.');
        return;
      }

      if (!this.senderEmail) {
        console.warn('⚠️ BREVO_SENDER_EMAIL not configured. Email notifications will be disabled.');
        return;
      }

      // Configure API key authorization
      const defaultClient = SibApiV3Sdk.ApiClient.instance;
      const apiKey = defaultClient.authentications['api-key'];
      apiKey.apiKey = this.apiKey;

      // Create TransactionalEmailsApi instance
      this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

      console.log('✅ Brevo email service initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Brevo email service:', error);
    }
  }

  async sendEmail(to, subject, htmlBody, recipientName = '') {
    if (!this.apiInstance) {
      console.warn('⚠️ Email service not initialized. Skipping email notification.');
      return false;
    }

    try {
      // Create email object
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      
      // Set sender
      sendSmtpEmail.sender = {
        name: this.senderName,
        email: this.senderEmail
      };

      // Set recipient
      sendSmtpEmail.to = [{
        email: to,
        name: recipientName || to.split('@')[0]
      }];

      // Set subject and content
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = htmlBody;

      // Send the email
      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);

      console.log(`✅ Email sent successfully to ${to} (Message ID: ${result.messageId})`);
      return true;
    } catch (error) {
      console.error('❌ Error sending email:', error.message);
      if (error.response) {
        console.error('Response:', error.response.text);
      }
      return false;
    }
  }

  // Email template for file assignment
  getFileAssignedEmailTemplate(data) {
    const { recipientName, fileTitle, department, level, assignedBy, fileId } = data;
    const fileUrl = `${this.frontendUrl}/files?fileId=${fileId}`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .info-box { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📄 New File Assigned for Review</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${recipientName}</strong>,</p>
            <p>A new file has been assigned to you for review in the Demand Planning system.</p>
            
            <div class="info-box">
              <h3>📋 File Details:</h3>
              <p><strong>Title:</strong> ${fileTitle}</p>
              <p><strong>Department:</strong> ${department}</p>
              <p><strong>Current Level:</strong> ${level}</p>
              <p><strong>Assigned By:</strong> ${assignedBy}</p>
            </div>

            <p>Please review this file at your earliest convenience.</p>
            
            <div style="text-align: center;">
              <a href="${fileUrl}" class="button">View File</a>
            </div>

            <p>If you have any questions, please contact the sender or your department administrator.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from Demand Planning System.</p>
            <p>Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Email template for file rejection
  getFileRejectedEmailTemplate(data) {
    const { recipientName, fileTitle, department, level, rejectedBy, reason, fileId } = data;
    const fileUrl = `${this.frontendUrl}/files?fileId=${fileId}`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .info-box { background: white; padding: 15px; border-left: 4px solid #f5576c; margin: 20px 0; }
          .reason-box { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔴 File Rejected</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${recipientName}</strong>,</p>
            <p>Your file has been rejected and requires your attention.</p>
            
            <div class="info-box">
              <h3>📋 File Details:</h3>
              <p><strong>Title:</strong> ${fileTitle}</p>
              <p><strong>Department:</strong> ${department}</p>
              <p><strong>Level:</strong> ${level}</p>
              <p><strong>Rejected By:</strong> ${rejectedBy}</p>
            </div>

            ${reason ? `
            <div class="reason-box">
              <h3>💬 Rejection Reason:</h3>
              <p>${reason}</p>
            </div>
            ` : ''}

            <p>Please review the feedback, make necessary corrections, and resubmit the file.</p>
            
            <div style="text-align: center;">
              <a href="${fileUrl}" class="button">View File</a>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated message from Demand Planning System.</p>
            <p>Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Email template for file completion
  getFileCompletedEmailTemplate(data) {
    const { recipientName, fileTitle, department, completedBy, fileId } = data;
    const fileUrl = `${this.frontendUrl}/files?fileId=${fileId}`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #11998e; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .info-box { background: white; padding: 15px; border-left: 4px solid #38ef7d; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ File Approved - Workflow Completed</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${recipientName}</strong>,</p>
            <p>Great news! Your file has been approved and the workflow is now complete.</p>
            
            <div class="info-box">
              <h3>📋 File Details:</h3>
              <p><strong>Title:</strong> ${fileTitle}</p>
              <p><strong>Department:</strong> ${department}</p>
              <p><strong>Completed By:</strong> ${completedBy}</p>
              <p><strong>Status:</strong> <span style="color: #38ef7d; font-weight: bold;">✓ COMPLETED</span></p>
            </div>

            <p>All required approvals have been received. You can view the final file using the button below.</p>
            
            <div style="text-align: center;">
              <a href="${fileUrl}" class="button">View File</a>
            </div>

            <p>Thank you for your submission!</p>
          </div>
          <div class="footer">
            <p>This is an automated message from Demand Planning System.</p>
            <p>Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send file assigned notification
  async sendFileAssignedEmail(recipient, data) {
    const subject = `New File Assigned: ${data.fileTitle}`;
    const htmlBody = this.getFileAssignedEmailTemplate({
      recipientName: recipient.name,
      ...data,
    });

    return await this.sendEmail(recipient.email, subject, htmlBody, recipient.name);
  }

  // Send file rejected notification
  async sendFileRejectedEmail(recipient, data) {
    const subject = `File Rejected: ${data.fileTitle}`;
    const htmlBody = this.getFileRejectedEmailTemplate({
      recipientName: recipient.name,
      ...data,
    });

    return await this.sendEmail(recipient.email, subject, htmlBody, recipient.name);
  }

  // Send file completed notification
  async sendFileCompletedEmail(recipient, data) {
    const subject = `File Approved: ${data.fileTitle}`;
    const htmlBody = this.getFileCompletedEmailTemplate({
      recipientName: recipient.name,
      ...data,
    });

    return await this.sendEmail(recipient.email, subject, htmlBody, recipient.name);
  }
}

// Export singleton instance
module.exports = new EmailService();
