# PCG Peace Be Congregation ChMS

Public website, member area and church management system for the Presbyterian Church of Ghana, Peace Be Congregation. See `CLAUDE.md` and `docs/CHMS_BLUEPRINT.md` for the product model and operating rules.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in the values.
3. `npm run dev` and open http://localhost:3000

## Scripts

| Script | Does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Next.js production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run preview` | Build for Cloudflare and run locally in the Workers runtime |
| `npm run deploy` | Build and deploy to Cloudflare Workers |
| `npm run cf-typegen` | Generate types for Cloudflare bindings |
| `npm run db:push` | Apply the Supabase schema and starter content |
| `npm run db:test` | Run the linked database policy tests |

## Public content

The public pages read published content from Supabase. Apply the migration and
starter rows, then fill in `site_settings`, `service_times`, `page_content`,
events, sermons, announcements, groups, leaders, Almanac entries, Harvest campaigns, stories and resources. Missing content is handled
with visitor-friendly empty states; the site never invents church details.

The contact and visit forms are enabled when the Supabase and Cloudflare
Turnstile variables in `.env.example` are configured. Resend is optional: a
message is considered received after it has been stored in Supabase, while email
acts as an office notification.

The repository includes the official crest supplied for this project and approved congregation building renderings. Image information is in `public/images/CREDITS.md`.

## Church office

The staff workspace is available at `/admin`. It uses Supabase Auth and checks
the `user_roles` table on sign-in, on every protected page and inside every
publishing action.

Create the first administrator in Supabase Authentication, then assign the
role in the SQL editor using that user’s UUID:

```sql
insert into public.user_roles (user_id, role)
values ('USER_UUID_HERE', 'admin');
```

There is deliberately no public staff-registration route. The office workspace covers publishing, stories and resources, people, ministry, worship and Almanac, pastoral follow-up, finance, Session governance and communications.

## Member area

The private member area is available at `/member`. A Supabase Auth account must be linked to a verified `people` record through `people.auth_user_id`. Members can read only their own profile, ministry membership, attendance and confirmed giving records. Staff create and link accounts through an approved church process; there is no open public registration route.

## Data safety

Every operational table uses Row Level Security. Public queries cannot read people, households, attendance, giving, governance or pastoral records. Confirmed financial entries cannot be deleted or silently changed; corrections use reversals. Apply every migration and run `npm run db:test` against the linked Supabase project before production use.

## Deploying to Cloudflare

Before the first deploy, create the page cache bucket:

```bash
npx wrangler r2 bucket create pcg-peace-be-opennext-cache
```

`NEXT_PUBLIC_*` variables must be present at build time. Set server secrets with `npx wrangler secret put NAME`. For `npm run preview`, put them in `.dev.vars`.
