// Maschinenlesbare Kennzeichnung KI-generierter Briefentwürfe (EU AI Act Art. 50 Abs. 2).
// Bleibt für Leser:innen unsichtbar und verändert den Brieftext nicht.

export const AI_CONTENT_EMAIL_HEADERS = {
  "X-AI-Generated": "true",
  "X-AI-Generator": "Brief-nach-Berlin (Mistral AI)",
} as const;

export const AI_CONTENT_HTML_META = `<meta name="ai-generated" content="true">
  <meta name="digital-source-type" content="http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia">`;

export const AI_CONTENT_BLOCK_ATTRIBUTES = 'data-ai-generated="true"';
