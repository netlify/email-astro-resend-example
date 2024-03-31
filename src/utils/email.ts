import ejs from "ejs";
import fs from "fs";
import { createTestAccount, createTransport, getTestMessageUrl, type Transporter } from "nodemailer";
import mg from "nodemailer-mailgun-transport";
import path from "path";
import { fileURLToPath } from "url";

type TemplateParams =
  | {
      name: "welcome";
      params: { name: string };
    }
  | {
      name: "custom";
      params: { html: string };
    };

type SendEmailOptions = {
  /** Email address of the recipient */
  to: string;
  /** Subject line of the email */
  subject: string;
  /** Parameters to send to the template */
  template: TemplateParams;
};

/**
 * Sends an email with Nodemailer using the provided transporter.
 */
export async function sendEmail(options: SendEmailOptions): Promise<Transporter> {
  const transporter = await getEmailAccount();
  return new Promise(async (resolve, reject) => {
    const { to, subject, template } = options;
    // Parse email template
    const html = await parseEmailTemplate(template.name, template.params);
    // Build the email message
    const message = { to, subject, html, from: "MyApp <noreply@example.com>" };
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

/**
 * Instantiates an email account and transporter for sending emails with
 * Nodemailer.
 */
async function getEmailAccount(): Promise<Transporter> {
  return new Promise((resolve, reject) => {
    // Use Mailgun in production
    if (import.meta.env.NODE_ENV === "production") {
      if (!import.meta.env.MAILGUN_API_KEY || !import.meta.env.MAILGUN_DOMAIN) {
        throw new Error("Missing Mailgun configuration");
      }
      const transporter = createTransport(
        mg({ auth: { api_key: import.meta.env.MAILGUN_API_KEY, domain: import.meta.env.MAILGUN_DOMAIN } })
      );
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

/**
 * Parses an email template with EJS, using the provided data options.
 */
async function parseEmailTemplate(name: TemplateParams["name"], params: Record<string, unknown>): Promise<string> {
  const rawTemplate = fs.readFileSync(`./src/utils/templates/${name}.ejs`, "utf8");
  return ejs.render(rawTemplate, params);
}
