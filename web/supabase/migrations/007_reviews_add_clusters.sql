-- Operator-seitige Cluster-Zuordnung pro Review.
-- Ein Review kann mehreren Clustern angehören (Array).
-- Befüllung manuell oder per Script, nicht durch den User.
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS review_clusters text[] DEFAULT NULL;
