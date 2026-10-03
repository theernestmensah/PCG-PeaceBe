-- Starter data. Safe to run more than once.
-- Only confirmed facts and structure the office will fill in: no invented people, events or contact details.

-- Confirm names and order with the congregation before production import.
insert into public.groups (name, short_name, slug, sort_order) values
  ('Children''s Service', 'CS', 'childrens-service', 10),
  ('Junior Youth', 'JY', 'junior-youth', 20),
  ('Young People''s Guild', 'YPG', 'young-peoples-guild', 30),
  ('Young Adults Fellowship', 'YAF', 'young-adults-fellowship', 40),
  ('Women''s Fellowship', null, 'womens-fellowship', 50),
  ('Men''s Fellowship', null, 'mens-fellowship', 60),
  ('Church Choir', 'Choir', 'church-choir', 70),
  ('Singing Band', null, 'singing-band', 80)
on conflict (slug) do nothing;

-- The single settings row. Values are filled in by the office.
insert into public.site_settings (id) values (true)
on conflict (id) do nothing;

-- Editable page sections. Bodies are filled in by the office.
insert into public.page_content (key, title) values
  ('home.welcome', 'Welcome'),
  ('about.story', 'Our story'),
  ('about.beliefs', 'What we believe'),
  ('visit.what_to_expect', 'What to expect'),
  ('give.intro', 'Giving'),
  ('contact.intro', 'Get in touch')
on conflict (key) do nothing;

-- Confirmed by the congregation: Sunday service starts at 7:30 am (Ghana time = UTC).
insert into public.service_times (name, day_of_week, start_time, sort_order)
select 'Sunday Service', 0, '07:30', 10
where not exists (select 1 from public.service_times where name = 'Sunday Service');
