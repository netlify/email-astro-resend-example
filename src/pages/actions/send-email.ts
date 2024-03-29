import type { APIRoute } from "astro";
import { sendEmail } from "../../utils/email";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const to = formData.get("recipient") as string | null;
  const subject = formData.get("subject") as string | null;
  const message = formData.get("message") as string | null;

  if (!to || !subject || !message) {
    throw new Error("Missing required fields");
  }

  try {
    const html = `<div>${message}</div>`;
    await sendEmail({ to, subject, html });
  } catch (error) {
    throw new Error("Failed to send email");
  }

  return redirect("/success");
};
