import { createTestAccount, createTransport, getTestMessageUrl, type Transporter } from "nodemailer";
import mg from "nodemailer-mailgun-transport";

type SendEmailOptions = {
  /** Email address of the recipient */
  to: string;
  /** Subject line of the email */
  subject: string;
  /** Message used for the body of the email */
  html: string;
};

/**
 * Sends an email with Nodemailer using the provided transporter.
 */
export async function sendEmail(options: SendEmailOptions): Promise<Transporter> {
  const transporter = await getEmailAccount();
  return new Promise(async (resolve, reject) => {
    // Build the email message
    const { to, subject, html } = options;
    const from = "MyApp <noreply@example.com>";
    const message = { from, to, subject, html };
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
    console.log(process.env.NODE_ENV);
    if (process.env.NODE_ENV === "production") {
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
 * Reads an email template from the file system, passing through the data
 * options.
 */
// async function readEmailTemplate(options: SendEmailOptions['template']): Promise<string> {
//   const content = await parseEmailTemplate(options.name, options.data);
//   const layout = await parseEmailTemplate('__layout__', { content });
//   return layout;
// }

/**
 * Parses an email template with EJS, using the provided data options.
 */
// async function parseEmailTemplate(name: string, data: Record<string, unknown>): Promise<string> {
//   const templatePath = await getEmailTemplatePath(name);
//   const rawTemplate = fs.readFileSync(templatePath, 'utf8');
//   const template = ejs.render(rawTemplate, data);
//   return template;
// }

/**
 * Returns the absolute file path to an email template.
 */
// async function getEmailTemplatePath(name: string): Promise<string> {
//   const templatePath = path.resolve(
//     __dirname(import.meta.url),
//     '..',
//     `templates/email/${name}.ejs`,
//   );
//   if (!fs.existsSync(templatePath)) throw new Error(`Template not found: ${name}`);
//   return templatePath;
// }
