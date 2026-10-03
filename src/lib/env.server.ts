import "server-only";
import { requireEnv } from "@/lib/env";

// Server-only secrets. Importing this file from a client component fails the build.
export const serverEnv = {
  get resendApiKey() {
    return requireEnv("RESEND_API_KEY", process.env.RESEND_API_KEY);
  },
  get resendFromEmail() {
    return requireEnv("RESEND_FROM_EMAIL", process.env.RESEND_FROM_EMAIL);
  },
  // Contact and visitor messages share the configured church-office inbox.
  get churchOfficeEmail() {
    return requireEnv("CHURCH_OFFICE_EMAIL", process.env.CHURCH_OFFICE_EMAIL);
  },
};
