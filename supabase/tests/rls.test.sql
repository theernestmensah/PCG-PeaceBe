-- Row level security and constraint tests. Run with: npm run db:test
-- Everything runs in one transaction and is rolled back, so no test data is left behind.

begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

-- ---------------------------------------------------------------------------
-- Fixtures (as the table owner)
-- ---------------------------------------------------------------------------

insert into auth.users (id, email) values
  ('00000000-0000-4000-8000-00000000a001', 'admin@test.local'),
  ('00000000-0000-4000-8000-00000000b001', 'member@test.local');
insert into public.user_roles (user_id, role) values
  ('00000000-0000-4000-8000-00000000a001', 'admin');

insert into public.groups (id, name, slug) values
  ('00000000-0000-4000-8000-000000000001', 'Test Group', 'test-group');

insert into public.leaders (full_name, category, is_active) values
  ('Test Active Leader', 'minister', true),
  ('Test Inactive Leader', 'session', false);

insert into public.events (title, slug, starts_at, ends_at, status) values
  ('Published', 'ev-published', now() + interval '1 day', now() + interval '1 day 2 hours', 'published'),
  ('Past', 'ev-past', now() - interval '10 days', now() - interval '10 days' + interval '2 hours', 'published'),
  ('Cancelled', 'ev-cancelled', now() + interval '2 days', now() + interval '2 days 2 hours', 'cancelled'),
  ('Draft', 'ev-draft', now() + interval '3 days', now() + interval '3 days 2 hours', 'draft');

insert into public.sermons (title, slug, preacher_name, preached_on, youtube_url, status) values
  ('Published', 'se-published', 'Rev. Test', current_date, 'https://www.youtube.com/watch?v=x', 'published'),
  ('Draft', 'se-draft', 'Rev. Test', current_date, null, 'draft');

insert into public.announcements (title, body, publish_at, expires_at, status) values
  ('Current', 'test-fixture', now() - interval '1 day', now() + interval '1 day', 'published'),
  ('No expiry', 'test-fixture', now() - interval '1 day', null, 'published'),
  ('Future', 'test-fixture', now() + interval '1 day', null, 'published'),
  ('Expired', 'test-fixture', now() - interval '3 days', now() - interval '1 day', 'published'),
  ('Draft', 'test-fixture', now() - interval '1 day', null, 'draft');

insert into public.contact_messages (name, email, message) values
  ('Existing', 'existing@test.local', 'Hello');

insert into public.people (id, auth_user_id, first_name, last_name, status) values
  ('00000000-0000-4000-8000-00000000b002', '00000000-0000-4000-8000-00000000b001', 'Member', 'Self', 'member'),
  ('00000000-0000-4000-8000-00000000b003', null, 'Private', 'Person', 'member');

insert into public.stories (title, slug, body, status) values
  ('Public story', 'public-story', 'Visible', 'published'),
  ('Draft story', 'draft-story', 'Hidden', 'draft');

insert into public.documents (title, category, object_key, is_public) values
  ('Public form', 'Forms', 'forms/public.pdf', true),
  ('Private minutes', 'Governance', 'minutes/private.pdf', false);

-- ---------------------------------------------------------------------------
-- Constraints
-- ---------------------------------------------------------------------------

select throws_ok(
  $$ insert into public.sermons (title, slug, preacher_name, preached_on, status)
     values ('No media', 'se-no-media', 'Rev. Test', current_date, 'published') $$,
  '23514', null, 'a published sermon needs YouTube or audio'
);
select lives_ok(
  $$ insert into public.sermons (title, slug, preacher_name, preached_on, audio_key, status)
     values ('Audio only', 'se-audio', 'Rev. Test', current_date, 'sermons/a.mp3', 'draft') $$,
  'a sermon may have audio only'
);
select throws_ok(
  $$ insert into public.events (title, slug, starts_at, ends_at)
     values ('Backwards', 'ev-backwards', now(), now() - interval '1 hour') $$,
  '23514', null, 'an event cannot end before it starts'
);
select throws_ok(
  $$ insert into public.announcements (title, body, publish_at, expires_at)
     values ('Bad', 'test-fixture', now(), now() - interval '1 hour') $$,
  '23514', null, 'an announcement cannot expire before it publishes'
);
select throws_ok(
  $$ insert into public.site_settings (id) values (false) $$,
  '23514', null, 'site_settings allows only one row'
);
select throws_ok(
  $$ insert into public.groups (name, slug) values ('Bad slug', 'Bad Slug') $$,
  '23514', null, 'slugs must be lowercase with hyphens'
);
select throws_ok(
  $$ insert into public.contact_messages (name, message) values ('No reply route', 'Hi') $$,
  '23514', null, 'a contact message needs a phone or email'
);

-- ---------------------------------------------------------------------------
-- Public visitor (anon)
-- ---------------------------------------------------------------------------

set local role anon;
set local request.jwt.claims = '{"role": "anon"}';

select is((select count(*)::int from public.events where slug like 'ev-%'), 3,
  'anon sees published (upcoming and past) and cancelled events, not drafts');
select is((select count(*)::int from public.events where slug like 'ev-%' and status = 'draft'), 0,
  'anon sees no draft events');
select is((select count(*)::int from public.sermons where slug like 'se-%'), 1, 'anon sees only published sermons');
select results_eq(
  $$ select title from public.announcements where body = 'test-fixture' order by title $$,
  $$ values ('Current'), ('No expiry') $$,
  'anon sees only published announcements inside their window'
);
select results_eq(
  $$ select full_name from public.leaders where full_name like 'Test %' $$,
  $$ values ('Test Active Leader') $$,
  'anon sees only active leaders'
);
select is((select count(*)::int from public.groups where slug = 'test-group'), 1, 'anon can read groups');
select is((select count(*)::int from public.stories), 1, 'anon sees only published stories');
select is((select count(*)::int from public.documents), 1, 'anon sees only public documents');

select throws_ok($$ select * from public.contact_messages $$, '42501', null,
  'anon cannot read contact messages');
select throws_ok($$ select * from public.people $$, '42501', null,
  'anon cannot read member records');
select throws_ok($$ select * from public.user_roles $$, '42501', null,
  'anon cannot read user roles');
select lives_ok(
  $$ insert into public.contact_messages (type, name, phone, message)
     values ('visitor', 'New Visitor', '0240000000', 'Planning to visit') $$,
  'anon can send a contact message'
);
select throws_ok(
  $$ insert into public.contact_messages (name, email, is_handled)
     values ('Sneaky', 's@test.local', true) $$,
  '42501', null, 'anon cannot set is_handled'
);
select throws_ok($$ insert into public.groups (name, slug) values ('X', 'x') $$, '42501', null,
  'anon cannot insert groups');
select throws_ok($$ update public.events set title = 'Hacked' $$, '42501', null,
  'anon cannot update events');
select throws_ok($$ delete from public.announcements $$, '42501', null,
  'anon cannot delete announcements');
select throws_ok($$ update public.site_settings set phone = '1' $$, '42501', null,
  'anon cannot update site settings');

reset role;

-- ---------------------------------------------------------------------------
-- Signed-in, non-admin user
-- ---------------------------------------------------------------------------

set local role authenticated;
set local request.jwt.claims =
  '{"sub": "00000000-0000-4000-8000-00000000b001", "role": "authenticated"}';

select is((select public.is_admin()), false, 'non-admin is not admin');
select is((select count(*)::int from public.events where slug like 'ev-%'), 3, 'non-admin sees the public events only');
select is((select count(*)::int from public.contact_messages), 0,
  'non-admin cannot see contact messages');
select is((select count(*)::int from public.user_roles), 0,
  'non-admin sees no roles (has none)');
select results_eq(
  $$ select first_name from public.people order by first_name $$,
  $$ values ('Member') $$,
  'member sees only their own person record'
);
select is((select count(*)::int from public.documents), 1, 'member sees only public documents');
select throws_ok(
  $$ insert into public.user_roles (user_id, role)
     values ('00000000-0000-4000-8000-00000000b001', 'admin') $$,
  '42501', null, 'non-admin cannot make themselves admin'
);
select throws_ok($$ insert into public.groups (name, slug) values ('X', 'x') $$, '42501', null,
  'non-admin cannot insert groups');
select is_empty(
  $$ update public.events set title = 'Hacked' where slug like 'ev-%' returning id $$,
  'non-admin updates change no events'
);
select is_empty(
  $$ delete from public.sermons where slug like 'se-%' returning id $$,
  'non-admin deletes remove no sermons'
);

reset role;

-- ---------------------------------------------------------------------------
-- Admin
-- ---------------------------------------------------------------------------

set local role authenticated;
set local request.jwt.claims =
  '{"sub": "00000000-0000-4000-8000-00000000a001", "role": "authenticated"}';

select is((select public.is_admin()), true, 'admin is admin');
select is((select count(*)::int from public.events where slug like 'ev-%'), 4, 'admin sees all events including drafts');
select is((select count(*)::int from public.sermons where slug like 'se-%'), 3, 'admin sees all sermons');
select is((select count(*)::int from public.announcements where body = 'test-fixture'), 5, 'admin sees all announcements');
select is((select count(*)::int from public.leaders where full_name like 'Test %'), 2, 'admin sees inactive leaders');
select is((select count(*)::int from public.contact_messages where name in ('Existing', 'New Visitor')), 2, 'admin reads contact messages');
select is((select count(*)::int from public.people), 2, 'admin reads all people records');
select is((select count(*)::int from public.documents), 2, 'admin reads public and private documents');
select lives_ok($$ insert into public.groups (name, slug) values ('New', 'test-new-group') $$,
  'admin can insert groups');
select lives_ok($$ update public.contact_messages set is_handled = true where name = 'Existing' $$,
  'admin can mark messages handled');
select lives_ok($$ update public.site_settings set phone = phone $$,
  'admin can update site settings');
select isnt_empty(
  $$ insert into public.events (title, slug, starts_at, ends_at)
     values ('By admin', 'ev-by-admin', now(), now() + interval '1 hour')
     returning created_by $$,
  'admin can create events'
);
select is(
  (select created_by from public.events where slug = 'ev-by-admin'),
  '00000000-0000-4000-8000-00000000a001'::uuid,
  'created_by defaults to the signed-in admin'
);

reset role;

select * from finish();
rollback;
