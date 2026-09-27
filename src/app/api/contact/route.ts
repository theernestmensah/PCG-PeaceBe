// TODO(step 4): validate the message, insert into contact_messages,
// and email CHURCH_OFFICE_EMAIL through Resend.
export async function POST() {
  return Response.json({ error: "The contact form is not available yet." }, { status: 501 });
}
