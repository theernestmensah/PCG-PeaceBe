// Public environment variables, safe for server and client code.
// NEXT_PUBLIC_* values must be referenced literally so Next.js can inline them.
// Values are checked when first read, so a missing one fails loudly with its name.

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing environment variable ${name}. See .env.example.`);
  }
  return value;
}

export const publicEnv = {
  get siteUrl() {
    return required("NEXT_PUBLIC_SITE_URL", process.env.NEXT_PUBLIC_SITE_URL);
  },
  get supabaseUrl() {
    return required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
  },
  get supabasePublishableKey() {
    return required(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    );
  },
  get mediaUrl() {
    return required("NEXT_PUBLIC_MEDIA_URL", process.env.NEXT_PUBLIC_MEDIA_URL);
  },
};

export { required as requireEnv };
