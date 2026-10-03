# PCG Peace Be Congregation Website

## Context

Website and church management system for the Presbyterian Church of Ghana, Peace Be Congregation, Community 25, Tema. The product includes the public website, private member area and secure church-office workspaces for publishing, membership, ministry, worship, care, finance, governance and communications.

## Stack

- Next.js (App Router), TypeScript (strict), Tailwind CSS.
- Deployed on Cloudflare Workers with the OpenNext Cloudflare adapter.
- Supabase Postgres with the Supabase SSR client. Row level security on every table.
- Cloudflare R2 for images and audio. The database stores file keys only. Public files are served from the base URL in `NEXT_PUBLIC_MEDIA_URL`.
- YouTube embeds for sermon video. Resend for email. Sentry for error monitoring.
- Secrets live in `.env.local`. Every variable name is listed in `.env.example`.

## Brand

Presbyterian Church of Ghana identity. The brand colors are red, white, blue, and green, and no others. Neutrals are used only for text and backgrounds.

Logo: the official PCG crest, `public/images/pcg-crest.png` (transparent background).

Tailwind tokens (blue, red and green sampled from the crest):

| Token    | Value     | Notes                                                   |
| -------- | --------- | ------------------------------------------------------- |
| brand    | `#2E3192` | Crest blue, primary                                     |
| navy     | `#1F2166` | Darker shade of the crest blue                          |
| red      | `#ED1B24` | Crest red. Fills and accents only, too light for text   |
| red-text | `#C8141C` | Darker crest red for red text                           |
| green    | `#215E32` | Crest green, accent, used sparingly                     |
| white    | `#FFFFFF` |                                                         |
| surface  | `#F5F7FB` | Neutral background                                      |
| ink      | `#1A1F2B` | Neutral body text                                       |
| muted    | `#5B6475` | Neutral secondary text                                  |

Feel: modern, warm, premium, reverent. Never template looking.

## Principles

- Mobile first. Most visitors use phones on mobile data.
- Server components by default. Client components only when interaction requires it.
- `next/image` for every image. No heavy animation libraries.
- Accessible to elderly members: base font at least 17px, strong contrast, tap targets at least 44px.
- All times stored in UTC.

## Routes

| Route                                         | Page          |
| --------------------------------------------- | ------------- |
| `/`                                           | Home          |
| `/about`                                      | About         |
| `/groups`, `/groups/[slug]`                   | Groups        |
| `/events`, `/events/archive`, `/events/[slug]` | Events        |
| `/sermons`, `/sermons/[slug]`                 | Sermons       |
| `/announcements`                              | Announcements |
| `/visit`                                      | Visit         |
| `/give`                                       | Give          |
| `/contact`                                    | Contact       |
| `/today`                                      | Daily Almanac |
| `/church-family`, `/session`                  | Church structure |
| `/stories`, `/stories/[slug]`                 | Congregation stories |
| `/resources`, `/privacy`                      | Resources and privacy |
| `/harvest`                                    | Live Harvest |
| `/member`, `/member/login`                    | Member area |
| `/admin/*`                                    | Church office |
| `/api/contact`                                | Contact API   |

## Database

- **user_roles**: user_id, role (enum, "admin" for now), created_at
- **groups**: id, name, short_name, slug, description, meeting_day, meeting_time, meeting_venue, cover_image_key, sort_order
- **leaders**: id, full_name, title, photo_key, bio, category (minister | session | group_leader), group_id nullable, sort_order, is_active, member_id nullable (future link to members)
- **events**: id, title, slug, description, starts_at, ends_at, venue, group_id nullable (null = whole church), flyer_key, status (draft | published | cancelled), is_featured, created_by, created_at, updated_at
- **sermon_series**: id, title, slug, description, cover_key
- **sermons**: id, title, slug, preacher_name, preacher_leader_id nullable, preached_on, bible_passage, series_id nullable, audio_key, youtube_url, summary, status, created_by, created_at
- **announcements**: id, title, body, publish_at, expires_at nullable, is_pinned, status, created_by, created_at
- **service_times**: id, name, day_of_week, start_time, language, notes, sort_order
- **site_settings**: single row with address, phone, email, office_hours, map_embed_url, momo_number, momo_name, bank_details, social_links
- **page_content**: key, title, body, updated_at
- **contact_messages**: id, type (contact | visitor), name, phone, email, message, is_handled, created_at

## Rules

- Event archive is computed from `ends_at`, never stored.
- Announcements show only between `publish_at` and `expires_at`.
- Public can read only published, current rows. Only admins can write.
- Cancelled events are also public, shown as cancelled.
- `contact_messages`: public insert only, admin read only.

## Defaults (each marked with a TODO in code for later review)

- One office administrator manages all content.
- Content publishes immediately.
- Weekly group meetings show on group pages as standing times, not weekly events.
- Sermons may have YouTube, audio, or both.
- Contact and visitor messages go to `CHURCH_OFFICE_EMAIL`.

## Current phase

All four foundational milestones are represented in the schema and interface. External delivery providers, payment gateways and production data imports remain configuration work and must be approved by the church before activation.

## Working style

- Plan before building and keep changes reviewable.
- Run the build and lint, fix errors, commit with a clear message, then report what was done, what needs production configuration, and any church decisions still required.
