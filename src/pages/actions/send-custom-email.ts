import type { APIRoute } from "astro";
import { sendEmail } from "../../utils/email";

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const to = formData.get("recipient") as string | null;
  const subject = formData.get("subject") as string | null;
  const html = formData.get("message") as string | null;

  if (!to || !subject || !html) {
    throw new Error("Missing required fields");
  }

  try {
    await sendEmail({ to, subject, template: { name: "custom", params: { html } } });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to send email");
  }

  return redirect("/success");
};
