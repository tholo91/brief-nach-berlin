ALTER TABLE reviews ADD COLUMN IF NOT EXISTS hero_featured BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS reviews_hero_featured_idx ON reviews (hero_featured) WHERE hero_featured = TRUE;
