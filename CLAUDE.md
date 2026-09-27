# PCG Peace Be Congregation Website

## Context

Public website for the Presbyterian Church of Ghana, Peace Be Congregation, [Community 25, Tema]. Phase 1 of a church management system for this one congregation. Later phases add an admin panel, member records, member registration with approval, a member portal, finance, online giving, SMS, and attendance. Everything built now must allow those to be added without rewriting.

## Stack

- Next.js (App Router), TypeScript (strict), Tailwind CSS.
- Deployed on Cloudflare Workers with the OpenNext Cloudflare adapter.
- Supabase Postgres with the Supabase SSR client. Row level security on every table.
- Cloudflare R2 for images and audio. The database stores file keys only. Public files are served from the base URL in `NEXT_PUBLIC_MEDIA_URL`.
- YouTube embeds for sermon video. Resend for email. Sentry for error monitoring.
- Secrets live in `.env.local`. Every variable name is listed in `.env.example`.

## Brand

Presbyterian Church of Ghana identity. The brand colors are red, white, blue, and green, and no others. Neutrals are used only for text and backgrounds.

Tailwind tokens (hex values are placeholders until sampled from the official crest):

| Token   | Value     | Notes                                   |
| ------- | --------- | --------------------------------------- |
| brand   | `#0B3D91` | Blue, primary                           |
| navy    | `#072A63` | Darker shade of the brand blue          |
| red     | `#C8102E` | Accent, used sparingly                  |
| green   | `#1E7B34` | Accent, used sparingly                  |
| white   | `#FFFFFF` |                                         |
| surface | `#F5F7FB` | Neutral background                      |
| ink     | `#1A1F2B` | Neutral body text                       |
| muted   | `#5B6475` | Neutral secondary text                  |

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
- `contact_messages`: public insert only, admin read only.

## Defaults (each marked with a TODO in code for later review)

- One office administrator manages all content.
- Content publishes immediately.
- Weekly group meetings show on group pages as standing times, not weekly events.
- Sermons may have YouTube, audio, or both.
- Contact and visitor messages go to `CHURCH_OFFICE_EMAIL`.

## Out of scope for this phase

Admin panel, member features, payments, SMS, attendance. If a request belongs to a later phase, say so instead of building it.

## Working style

- Plan before building. Wait for approval.
- After each step: run the build and lint, fix all errors, commit with a clear message, then report what was done, what is placeholder, and any questions.
- Never start the next step without being asked.
