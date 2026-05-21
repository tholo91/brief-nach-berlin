# Deferred Items - 260521-tn1

Out-of-scope findings discovered during `npm run lint` while executing this quick task. None of these are caused by the changes in this task; they are pre-existing issues in untouched files. They should be addressed in a separate lint-cleanup task.

## Pre-existing Lint Errors

- `web/src/components/wizard/Step1bLengthTone.tsx:73` - `react-hooks/incompatible-library` (`useForm().watch()` cannot be memoized safely)
- `web/src/components/wizard/Step3Success.tsx:211` - `react-hooks/set-state-in-effect` (synchronous setState inside effect body)
- `web/src/lib/enrichment/fetchMdbContext.ts:119` - unused `_score` (warning)
- Additional 5+ lint problems reported in other untouched files

## Recommendation

Separate quick task to triage the lint baseline before it grows further. Could be a single batch fix-pass.
