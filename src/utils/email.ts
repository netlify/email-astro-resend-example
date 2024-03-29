import {
  createTestAccount,
  createTransport,
  getTestMessageUrl,
  type Transporter,
} from "nodemailer";

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
export async function sendEmail(
  options: SendEmailOptions
): Promise<Transporter> {
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
    // Create a test email account using ethereal.email
    createTestAccount((err, account) => {
      const transporter = createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: { user: account.user, pass: account.pass },
      });
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
