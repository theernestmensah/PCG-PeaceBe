# Peace Be ChMS Blueprint

## Product vision

Peace Be should become the trusted digital home of the congregation: the place a visitor uses to plan a first visit, a member opens every morning, a group leader uses to organise ministry, and the Session uses to understand and shepherd the church.

The product has four connected surfaces:

1. **Public website** — the congregation's story, worship information, groups, events, sermons, notices, giving and contact.
2. **Today at Peace Be** — the Almanac-led daily companion with the day's readings, theme, hymn reference, prayer focus and congregation activity.
3. **Member portal** — a private space for profiles, households, groups, attendance, pastoral requests, pledges, receipts and documents.
4. **Church office** — a role-based workspace for the Minister, Session Clerk, Presbyters, Treasurer, administrators and group leaders.

The public site and member portal must feel like one church, but sensitive pastoral, financial and member data must never appear in public queries.

## Product principles

- **Presbyterian by structure.** Use PCG language and governance: Congregational Session, generational groups, intergenerational groups, shepherding, districts and presbyteries.
- **Useful every day.** The home page should answer “What is happening today?” before it promotes evergreen content.
- **One source of truth.** Events, leaders, groups, service times and notices are entered once and reused across the website, calendar and portal.
- **Mobile and low-data first.** The main journeys must be fast on an affordable Android phone and usable by older members.
- **Private by default.** Membership, counselling, attendance and giving records use explicit roles and audit logs.
- **Human publishing.** Automation may prepare content, but a named church officer approves official notices, Almanac entries and financial updates.
- **No invented church facts.** Empty states invite an authorised editor to provide information instead of showing fabricated numbers or copy.

## Information architecture

### Public website

- **Home**
  - Today's Almanac card
  - next service and livestream state
  - urgent/pinned notice
  - upcoming events
  - latest sermon
  - Harvest progress
  - stories from the congregation
- **About Peace Be**
  - history and identity
  - mission, vision and PCG theme
  - minister and ministry team
  - Congregational Session
  - location, building project and church office
- **Worship**
  - service times
  - plan a visit
  - sermons and series
  - livestream
  - Almanac calendar
  - prayer requests
- **Our Church Family**
  - generational groups: Children's Service, Junior Youth, YPG, YAF, Women's Fellowship and Men's Fellowship
  - intergenerational groups: BSPG, Church Choir, Singing Band, Youth Choir, Brigade and other approved local groups
  - shepherding groups
  - departments, committees and ministries
  - each page includes purpose, leaders, meeting details, upcoming events, notices and contact route
- **What's On**
  - calendar
  - announcements
  - congregation stories and gallery
  - downloads and forms
- **Give**
  - offertory, tithe, Harvest, welfare and approved projects
  - payment instructions and purpose/reference guidance
  - Harvest campaign page with live totals
- **Contact**
  - directions
  - first-time visitor form
  - church office details
  - pastoral contact request

### Member portal

- My household and contact details
- My groups and leaders
- My upcoming duties and events
- Attendance/check-in history visible according to policy
- Giving history and receipts visible only to the member and authorised finance roles
- Harvest pledge and fulfilment status
- Prayer/pastoral requests with carefully limited visibility
- Documents, forms and congregation directory with member-controlled privacy
- Notification preferences for email, SMS and WhatsApp links

### Church office

- Publishing: pages, notices, events, sermons, galleries and downloads
- Membership: people, households, children/guardians, lifecycle status and transfers
- Ministry: groups, leaders, terms of office, rosters and attendance
- Shepherding: assigned households, visit notes, follow-ups and care alerts
- Worship: service plans, duty roster and Almanac schedule
- Finance: funds, campaigns, pledges, payments, reconciliation and reports
- Governance: Session meetings, agenda, minutes, decisions and action owners
- Communications: audience segments, templates, delivery log and consent
- Reports: membership, attendance, ministry activity, Harvest and KPI exports
- Administration: roles, settings, audit trail, imports and backups

## The daily Almanac experience

The Almanac should become the daily heartbeat of the product.

Each date can contain:

- liturgical season and colour
- week/day label and theme
- Old Testament, Psalm, Epistle and Gospel references
- memory verse reference and permitted text
- hymn number and title in English, Twi or Ga
- prayer focus
- PCG or local observance
- a short approved reflection or link to the day's devotion

The public home page shows a compact “Today” card. The full Almanac page supports previous/next day navigation, calendar browsing and shareable links. Admins import a yearly schedule from an authorised spreadsheet and review it before publishing.

The Church should supply or authorise the Almanac data. Full hymn lyrics and non-public-domain Bible translations must only be published with the appropriate rights. Until that permission exists, store and show references, hymn numbers/titles, short permitted excerpts and links to official material.

## Real-time Harvest

Harvest should be a campaign system, not a manually edited number.

### Public experience

- campaign title, scripture/theme, purpose and closing date
- target, confirmed amount and percentage progress
- optional breakdown by approved category or generational group
- latest milestone and update time
- clear ways to pledge or pay
- privacy-preserving activity feed such as “A household contributed” only when enabled

### Office workflow

1. Treasurer creates a campaign and target.
2. Members or staff record pledges.
3. Payments enter as pending and require reconciliation/confirmation.
4. Confirmed payments update the public total through Supabase Realtime.
5. Corrections create reversal entries; financial records are never silently overwritten.
6. Every change records the actor, timestamp and reason.

The public total must use confirmed transactions only. Anonymous giving is supported. Individual amounts and names remain private unless a donor explicitly opts into recognition and church policy allows it.

## Core data model to add

The existing content tables remain. The ChMS expansion adds these bounded modules:

- `people`, `households`, `household_members`, `member_status_history`
- `ministries`, `ministry_memberships`, `leadership_terms`
- `shepherding_groups`, `shepherd_assignments`, `pastoral_followups`
- `services`, `attendance_sessions`, `attendance_records`
- `almanac_entries`, `daily_reflections`
- `campaigns`, `pledges`, `funds`, `contributions`, `reconciliations`
- `session_meetings`, `session_documents`, `session_decisions`, `action_items`
- `documents`, `media_assets`, `notification_preferences`, `message_deliveries`
- `audit_events`

Financial transactions should be append-only. Pastoral notes need their own restricted access policy. Children require guardian relationships and tighter directory visibility. Public site queries should read curated public views rather than member tables.

## Roles

- **Super admin** — system configuration and role assignment
- **Minister** — congregation oversight, pastoral workflows and approved reporting
- **Session clerk** — governance records, membership administration and publishing
- **Presbyter** — assigned district/shepherding work and limited member access
- **Treasurer/finance officer** — funds, contributions, reconciliation and finance reports
- **Content editor** — public content without access to membership or finance
- **Group leader** — only their group, roster, events and attendance
- **Member** — their own household, groups, giving and preferences

Roles should grant capabilities, not blanket database access. Every sensitive read and write should be enforced by Supabase Row Level Security and recorded in the audit trail.

## Visual direction

The experience should feel rooted in Presbyterian heritage and contemporary Ghana rather than like a generic church template.

- Use the PCG blue as the strong institutional colour, with white reading surfaces and restrained red/green accents.
- Pair generous editorial typography with structured rule lines and calm spacing inspired by an Almanac or service book.
- Lead with real Peace Be photography, the building, people in worship and ministry life. Avoid generic stock worship imagery.
- Give every group a recognisable colour accent while keeping the same page system.
- Use a prominent date treatment for “Today,” seasonal liturgical colour, and clear scripture typography.
- Use progress animation sparingly for Harvest milestones and live status; respect reduced-motion preferences.
- Keep primary text at 17px or larger, controls at least 44px, and all essential actions keyboard accessible.
- Build strong empty, loading, offline and expired-content states so the site remains trustworthy.

## Recommended stack

Keep **Next.js + Supabase + Cloudflare**.

Supabase is the best fit for this stage because the system is relational: people belong to households and groups; leaders have terms; services have attendance; campaigns have pledges and confirmed transactions. Supabase provides Postgres, Auth, Row Level Security and Realtime in one platform, and it remains portable SQL.

Use the free tier while launching:

- Supabase for structured data, authentication, permissions and selected realtime channels
- Cloudflare R2 for sermon audio, photos, documents and other large media
- Cloudflare Pages/OpenNext for the web application
- scheduled encrypted database exports to protect against the free tier's lack of automatic backups

Free-tier limits are appropriate for initial congregation use, but the church should budget for Supabase Pro once the system becomes operationally critical. The most relevant free-tier constraints are project pausing after inactivity, 500 MB database storage, 1 GB Supabase file storage, limited logs and no automatic backups.

## Delivery plan

### Milestone 1 — the go-to public site

- Restructure navigation around Today, Worship, Church Family and What's On
- Add Session, ministry and department page types
- Expand groups to all approved generational/intergenerational groups
- Add congregation stories, gallery and searchable calendar
- Add Almanac data model, import tool and daily experience
- Add Harvest campaign page and realtime confirmed total

### Milestone 2 — membership and ministry

- People and household records
- Member sign-in and profile/privacy controls
- Group rosters, leadership terms and attendance
- Shepherding assignments and safe follow-up workflow
- Imports, deduplication, audit log and role matrix

### Milestone 3 — finance and governance

- Funds, pledges, contributions and receipts
- Reconciliation and Harvest reporting
- Session meeting pack, decisions and actions
- PCG KPI and annual report exports

### Milestone 4 — communication and care

- Audience segments and notification preferences
- Email/SMS provider integration when approved and funded
- Pastoral requests, follow-ups and care dashboards
- PWA installation, offline daily Almanac and optional push notifications

## Immediate build slice

The next implementation should deliver one visible, testable vertical slice:

1. Add `ministries`, `almanac_entries`, `campaigns`, `pledges` and `contributions` with strict RLS.
2. Create public `/today`, `/church-family`, `/session`, `/ministries/[slug]` and `/harvest` routes.
3. Create admin screens for Almanac entries, ministries and Harvest reconciliation.
4. Seed only verified Peace Be information; show clear content-needed states for missing details.
5. Test public/private boundaries and realtime Harvest updates before inviting members.

## Decisions the church must supply

Implementation can continue with safe placeholders, but publication requires:

- official Peace Be group/department list and current leaders
- current Session members and permitted public details
- authorised 2026 Almanac source and languages
- Harvest name, target, dates, categories and public-display policy
- finance approval/reconciliation process
- member-data privacy, retention and child-safeguarding rules
- official payment channels and receipt requirements

