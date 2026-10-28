-- Letter counter (one row per metric key)
create table counters (
  key   text primary key,
  value integer not null default 0
);

insert into counters (key, value) values ('letter_count', 0);

-- Reviews (collected only with explicit consent)
create table reviews (
  id         uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  rating     integer check (rating between 1 and 5),
  body       text,
  consent    boolean not null default true
);

-- Public can read the counter, nothing else
alter table counters enable row level security;
alter table reviews enable row level security;

create policy "public read counter"
  on counters for select
  using (true);
