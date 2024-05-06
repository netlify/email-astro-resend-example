import ejs from "ejs";
import fs from "fs";
import { createTestAccount, createTransport, getTestMessageUrl } from "nodemailer";
import type { Transporter } from "nodemailer";

type WelcomeEmailParams = { name: "welcome"; params: { name: string } };
type CustomEmailParams = { name: "custom"; params: { html: string } };

type TemplateParams = WelcomeEmailParams | CustomEmailParams;

type SendEmailOptions = {
  /** Email address of the recipient */
  to: string;
  /** Subject line of the email */
  subject: string;
  /** Parameters to send to the template */
  template: TemplateParams;
};

export async function sendEmail(options: SendEmailOptions): Promise<Transporter> {
  const transporter = await getEmailTransporter();
  return new Promise(async (resolve, reject) => {
    const { to, subject, template } = options;
    // Parse email template
    const html = await parseEmailTemplate(template.name, template.params);
    // Build the email message
    const from = import.meta.env.SEND_EMAIL_FROM || "MyApp <noreply@example.com>";
    const message = { to, subject, html, from };
    // Send the email
    transporter.sendMail(message, (err, info) => {
      // Log the error if one occurred
      if (err) {
        console.error(err);
        reject(err);
      }
      // Log the message ID and preview URL if available.
      console.log("Message sent:", info.messageId);
      const testUrl = getTestMessageUrl(info);
      if (testUrl) console.log("Preview URL:", testUrl);
      resolve(info);
    });
  });
}

async function getEmailTransporter(): Promise<Transporter> {
  return new Promise((resolve, reject) => {
    // Use Resend in production
    if (import.meta.env.NODE_ENV === "production") {
      if (!import.meta.env.RESEND_API_KEY) {
        throw new Error("Missing Resend configuration");
      }
      const transporter = createTransport({
        host: "smtp.resend.com",
        secure: true,
        port: 465,
        auth: { user: "resend", pass: import.meta.env.RESEND_API_KEY },
      });
      resolve(transporter);
    }

    // Create a test email account using ethereal.email when in development
    createTestAccount((err, account) => {
      const { user, pass, smtp } = account;
      const { host, port, secure } = smtp;
      const transporter = createTransport({ host, port, secure, auth: { user, pass } });
      resolve(transporter);
    });
  });
}

async function parseEmailTemplate(name: TemplateParams["name"], params: TemplateParams["params"]): Promise<string> {
  // Read the raw template file
  const rawTemplate = fs.readFileSync(`./src/utils/templates/${name}.ejs`, "utf8");
  // Run the template through EJS to replace variables with parameter values
  return ejs.render(rawTemplate, params);
}
