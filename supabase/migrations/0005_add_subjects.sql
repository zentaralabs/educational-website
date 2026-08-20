-- Subjects — controlled vocabulary for programs.field_of_study, replacing
-- free text so subject-based filtering/faceting is actually reliable (see
-- PROJECT_STATUS.md Section 12 and the schema's own stated design principle:
-- "controlled vocabularies as lookup tables, not free text"). No real
-- program data exists yet, so this is a clean cutover, not a migration of
-- messy existing values.

create table subjects (
  id serial primary key,
  name text unique not null
);

insert into subjects (name) values
  ('Computer Science'),
  ('Business'),
  ('Engineering'),
  ('Data Science'),
  ('Biology & Life Sciences'),
  ('Psychology'),
  ('Nursing & Health Sciences'),
  ('Law'),
  ('Education'),
  ('Arts & Design'),
  ('Communications & Media'),
  ('Economics'),
  ('Mathematics'),
  ('Physics'),
  ('Political Science & International Relations'),
  ('Environmental Science'),
  ('Architecture'),
  ('Music & Performing Arts'),
  ('Agriculture'),
  ('Hospitality & Tourism');

alter table programs add column subject_id int references subjects(id);
alter table programs drop column field_of_study;

create index idx_programs_subject on programs(subject_id);

alter table subjects enable row level security;

create policy "lookups readable by everyone" on subjects for select using (true);
create policy "lookups writable by admin" on subjects for all
  using (is_staff_admin()) with check (is_staff_admin());
