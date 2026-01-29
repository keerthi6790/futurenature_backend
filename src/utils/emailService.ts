import nodemailer from 'nodemailer';
import type { ContactRequest } from '../routes/contact/contact.schema';

interface EmailConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
}

export class EmailService {
    private transporter: nodemailer.Transporter;
    private adminEmail: string;

    constructor() {
        const config: EmailConfig = {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER || '',
                pass: process.env.SMTP_PASS || '',
            },
        };

        this.adminEmail = process.env.ADMIN_EMAIL || '';
        this.transporter = nodemailer.createTransport(config);
    }

    async sendContactFormEmail(data: ContactRequest): Promise<void> {
        const { name, email, mobile, message } = data;

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: this.adminEmail,
            subject: `New Contact Form Submission from ${name}`,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
              border-radius: 10px;
            }
            .header {
              background-color: #fbbf24;
              color: #000;
              padding: 20px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .content {
              background-color: #fff;
              padding: 20px;
              border-radius: 0 0 10px 10px;
            }
            .field {
              margin-bottom: 15px;
            }
            .label {
              font-weight: bold;
              color: #fbbf24;
            }
            .value {
              margin-top: 5px;
              padding: 10px;
              background-color: #f5f5f5;
              border-radius: 5px;
            }
            .message-box {
              background-color: #f5f5f5;
              padding: 15px;
              border-radius: 5px;
              border-left: 4px solid #fbbf24;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Contact Form Submission</h2>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Name:</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              <div class="field">
                <div class="label">Mobile:</div>
                <div class="value"><a href="tel:${mobile}">${mobile}</a></div>
              </div>
              <div class="field">
                <div class="label">Message:</div>
                <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
            text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Mobile: ${mobile}

Message:
${message}
      `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log('Contact form email sent successfully');
        } catch (error) {
            console.error('Error sending contact form email:', error);
            throw new Error('Failed to send email');
        }
    }

    async verifyConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            console.log('Email service is ready');
            return true;
        } catch (error) {
            console.error('Email service connection failed:', error);
            return false;
        }
    }
}

export const emailService = new EmailService();
