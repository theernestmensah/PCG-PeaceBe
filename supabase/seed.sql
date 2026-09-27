-- Starter data. Safe to run more than once.
-- Only structure the office will fill in: no invented people, events, times or contact details.

-- TODO(review): confirm groups, names and order with the congregation.
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
