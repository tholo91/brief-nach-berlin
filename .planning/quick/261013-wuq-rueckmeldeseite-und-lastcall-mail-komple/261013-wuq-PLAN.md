---
quick_id: 261013-wuq
mode: quick
status: approved
---

# Rückmeldeseite und Last-Call-Mail

Source: `.planning/todos/pending/2026-10-13-rueckmeldeseite-lastcall-mail.md`. All product decisions there are locked; user approved complete local implementation and verification. Existing dirty changes must be preserved. No production migration, deployment, email or bulk send in this execution.

1. Backend and privacy: implement token, shared answer schema, initial/progress/full action, migration 033 with service-role-only RLS and monotonic completion; extend lookup/deletion and privacy notice. Verify forged/expired tokens, branching validation, concurrency safeguards, deletion and SQL constraints with focused Jest tests.
2. UI: implement mobile-first `/rueckmeldung`, extract shared SurveyChoice/SentTab from feedback, preserve existing feedback behavior, strip token and exclude analytics. Verify all three entry choices, branching, progressive saves, consent, errors, completion, keyboard/mobile/desktop layout.
3. Mail and operations: adapt HTML/plaintext, mint tokens per recipient, export review-before-Aug13 plus May cohort excluding tests and duplicates, provide local send journal/resume guard and release runbook. Update last-call skill without touching unrelated global content. Verify signed mail links and script behavior with mocked external calls; run full Jest, build and relevant lint. Document migration SQL verification, main-only deploy, phone test, single testmail, quota check and Oct14 09:30 Europe/Berlin manual send.

Commit/push, remote writes and sends remain separate from local implementation as requested. GSD artifacts capture actual results and open verification gates.
