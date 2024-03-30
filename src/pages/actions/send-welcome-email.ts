import type { APIRoute } from "astro";
import { sendEmail } from "../../utils/email";

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const to = formData.get("recipient") as string | null;
  const subject = "Welcome to MyApp!";
  const name = formData.get("name") as string | null;

  if (!to || !name) {
    throw new Error("Missing required fields");
  }

  try {
    await sendEmail({ to, subject, template: { name: "welcome", params: { name } } });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to send email");
  }

  return redirect("/success");
};
