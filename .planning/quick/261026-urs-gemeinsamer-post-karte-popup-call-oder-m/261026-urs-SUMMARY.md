---
status: complete
---
# 261026-urs: Gemeinsamer Post: Popup Call oder Mail, Social-Icons

- Button "Gemeinsamen Post planen" öffnet Menü (nach oben): "Kurzen Call buchen" (Calendly, neuer Tab) oder "Mail schreiben".
- Mail: Betreff `Gemeinsamer Post: <slug>`, Body mit 2 Lücken (Netzwerk, Account). Builder `campaignJointPostHref` in `web/src/lib/contact.ts`.
- `FOUNDER_CALENDLY` in `web/src/lib/config.ts` (öffentliche URL, keine Env-Var).
- Instagram/LinkedIn-Icons (`SocialFollowIcons`) unter dem Kartentext.
- Outside-Click/Escape-Logik aus `SocialFollow` in `useDismissableMenu` gezogen, von beiden genutzt.
- Checks: `npx jest` 1430/1430 grün, `tsc` ohne Fehler in `src/`, Browser Desktop + 375 px geprüft (temporäre Testseite, wieder gelöscht).
- Nicht committet (auf Wunsch von Thomas).
