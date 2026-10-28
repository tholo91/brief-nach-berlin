-- Atomic increment — avoids read-modify-write race conditions
create or replace function increment_counter(key_name text)
returns void
language sql
security definer
as $$
  update counters set value = value + 1 where key = key_name;
$$;
