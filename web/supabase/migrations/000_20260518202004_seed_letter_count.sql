-- Backfill: 130 letters generated before counter was instrumented
update counters set value = 130 where key = 'letter_count';
