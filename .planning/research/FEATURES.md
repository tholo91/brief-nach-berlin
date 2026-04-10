# Feature Research

**Domain:** Citizen-to-politician communication platform (civic tech, Germany)
**Researched:** 2026-04-10
**Confidence:** HIGH — backed by comprehensive market research (MARKET-RESEARCH.md), direct competitor analysis (Resistbot, WriteToThem, Abgeordnetenwatch), and first-hand Bundestag knowledge

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features a user arriving at brief-nach-berlin.de will assume exist. Missing any of these = product feels broken or unfinished.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Text input for the frustration/issue | Core product mechanic — without this nothing works | LOW | Simple textarea, max ~500 chars to keep output focused |
| PLZ input with validation | Every German civic service asks for PLZ. Without it the user can't trust the politician match | LOW | 5-digit numeric validation, Deutsche Post regex pattern |
| Politician name + address output | User needs a real recipient to write to. Generic "your MdB" is useless | MEDIUM | Requires PLZ → Wahlkreis → politician lookup pipeline |
| Generated letter text | The core value delivery — if it's not here, nothing else matters | MEDIUM | AI-drafted, ~200-280 words, formal German prose |
| Clear "what to do next" instructions | Citizens don't know how to mail a formal letter. Step-by-step (print/write, envelope, stamp, post) is essential | LOW | Static content, but must be unambiguous |
| Mobile-responsive design | Majority of German web traffic is mobile; frustration often happens on the go | LOW | Standard responsive CSS — Lovable handles this by default |
| Explanation of WHY handwritten letters work | Without this, users don't trust the format and will wonder "why not just email?" | LOW | 2-3 sentence trust anchor on landing page and result page |
| Privacy statement (DSGVO) | German users are privacy-conscious. No DSGVO note = immediate trust loss | LOW | Standard minimal data collection statement, cookie-free if possible |
| Loading/processing state | AI generation takes 2-5s. Blank screen = users think it's broken | LOW | Simple spinner or progress message |

### Differentiators (Competitive Advantage)

These are what make Brief nach Berlin the product, not just another civic tool.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Voice input (speech-to-text) | Lowers barrier further — many people can speak their frustration but feel blocked by writing. No competitor offers this | MEDIUM | Web Speech API (free, browser-native) or Whisper API (higher quality). Mobile users benefit most |
| AI determines responsible political level | Users don't know if their housing problem is a commune, Landtag, or Bundestag issue. Removing this decision is core UX. No competitor does this | MEDIUM | LLM classification step before letter generation — classify issue by level of government responsibility |
| Multi-level politician matching (Bund + Land + Kommune) | Germany has 3 tiers of government. Covering all three makes the tool genuinely useful across issue types | HIGH | Bundestag via Abgeordnetenwatch API. Landtag requires per-Bundesland data curation. Kommune is the hardest data problem |
| Letter calibrated for handwriting length | Output explicitly designed for 1 handwritten A4 page (~200-280 words). No competitor targets this format | LOW | Prompt engineering constraint — unique to BnB's handwritten-first design |
| Formal but personal tone by default | Generic civic tools output bureaucratic boilerplate. BnB outputs letters that feel genuinely authored by the citizen | LOW | Prompt engineering — include emotional hook from citizen's own words |
| "Tease Brussels" — EU Parliament in v2 | Signals ambition and European vision without building scope prematurely | LOW | Static "coming soon" mention in UI |
| Optional email capture for PDF | Sends a PDF of the letter to the user's email so they have it for reference | LOW | Simple serverless function + email provider (Resend/Sendgrid free tier). No account required |
| Result page shows politician photo + party | Makes the interaction feel real — user knows who they're writing to | LOW | Photo + party from Abgeordnetenwatch API |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| User accounts / login | "Saves previous letters", "tracks if reply received" | Pure friction for v1. The core use case is one-and-done. Accounts require password flows, email verification, DSGVO data retention decisions — none of this adds value until post-PMF | Optional email only for PDF delivery. No account, no session |
| Send letter digitally (email to politician) | Users want zero-effort delivery | Defeats the entire value proposition. The handwritten letter IS the product — it works because of the effort signal. Digital delivery commoditizes BnB into another email sender. Worse: it competes with Abgeordnetenwatch's direct messaging, which already exists | Make mailing easy: show exact postage cost, Deutsche Post link, pre-filled address to copy |
| Petition / collective letter (multi-signer) | "Sign and send as a group" | Changes the product category entirely. Petition platforms (WeAct, Change.org) already do this at scale. BnB's edge is the personal letter — collective undermines that | Position BnB as the complement to petitions: "Sign the petition, THEN write your personal letter" |
| Real-time politician data scraping | "Always up-to-date" | Self-maintaining web scraper is a maintenance burden that breaks after every Bundestag website update. Data from elections changes at known intervals, not continuously | Use Abgeordnetenwatch API (maintained externally, CC0) with periodic cache refresh after elections |
| Delivery tracking ("has my letter arrived?") | Users want confirmation | Physical letter tracking requires PostID/Einschreiben integration — significant cost and complexity. And it misunderstands the product: the act of sending is the point, not the confirmation | Encourage users to screenshot their letter before sending. Optional: link to Deutsche Post's Einschreiben service as an optional upgrade |
| Auto-pen / printed delivery (Pensaki integration) | "I don't want to handwrite it" | Removes the core effort-signal that makes handwritten letters effective. A robot-written letter is not more authentic than an email. Also adds cost, minimum order constraints, and integration complexity | Make handwriting feel achievable: "It takes 15 minutes. Here's what to write." v2 consideration only after validating demand |
| Issue categorization / topic tags | "Browse letters by topic", "see what others are writing about" | Creates a social/discovery layer that multiplies DSGVO complexity and moderations needs for v1. Not validated as user need | Keep it anonymous and stateless. No social features until there is evidence users want them |
| Real-time politician response tracking | "Did the MdB reply?" | Requires persistent user identity, politician cooperation, and ongoing data management — entirely different product category | As a v2 differentiator: capture response rate data anonymously via email follow-up survey (like WriteToThem's annual responsiveness league table) |
| Payment / donation flow | "Sustain the project" | In v1, monetization creates friction and signals distrust. Validates first, monetizes later | Free v1. Consider Prototype Fund application (up to 47.500 EUR). Add donation option only post-PMF |

---

## Feature Dependencies

```
[PLZ Input]
    └──requires──> [PLZ → Wahlkreis Mapping] (Bundeswahlleiterin data)
                       └──requires──> [Wahlkreis → Politician Lookup] (Abgeordnetenwatch API)
                                          └──enables──> [Letter Generation] (OpenAI API)
                                                            └──enables──> [Letter Display]
                                                                              └──enables──> [Email PDF Delivery] (optional)

[Text Input] ──feeds──> [Letter Generation]
[Voice Input] ──transcribes to──> [Text Input]

[Issue Text + PLZ]
    └──feeds──> [AI Level Classification] (Bund / Land / Kommune)
                    └──determines──> [Which Politician Level to Target]

[Politician Match]
    └──provides──> [Name + Address + Party + Photo]
                        └──populates──> [Letter Display] + [Instructions Page]
```

### Dependency Notes

- **PLZ input requires PLZ → Wahlkreis mapping:** The hardest engineering problem. One PLZ can span multiple Wahlkreise (confirmed by Bundeswahlleiterin). Fallback: ask user to select their Gemeinde from a short list when ambiguity exists.
- **Voice input converts to text input:** Voice is an enhancement to text — they share the same downstream pipeline. Build text first, layer voice on top.
- **AI level classification feeds politician targeting:** The LLM needs to decide if the issue is federal, state, or local before knowing which politician database to query. This is a single additional LLM call (classification) before the letter generation call.
- **Email PDF delivery requires letter generation:** Obvious dependency — only offer email capture after a letter has been generated, not upfront.
- **Multi-level matching (Land + Kommune) requires text input + PLZ:** Both needed to classify issue level AND identify politicians at non-federal tiers. Landtag data is secondary to Bundestag; Kommune is hardest and most incomplete.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept and get real user feedback.

- [x] Landing page explaining concept + WHY handwritten letters work
- [x] Text input for issue/frustration description
- [x] PLZ input with validation
- [x] PLZ → Wahlkreis → MdB (Bundestag) lookup via Abgeordnetenwatch API
- [x] AI-generated letter (~200-280 words, formal German prose, handwriting-length calibrated)
- [x] AI-determined political level (Bund / Land priority for v1)
- [x] Letter display with politician name, address, party, and photo
- [x] "What to do next" instructions (handwrite, envelope, stamp, send)
- [x] DSGVO-compliant privacy statement
- [x] Mobile-responsive design
- [x] Optional email capture for PDF copy (low friction, not required)

### Add After Validation (v1.x)

Features to add once core flow has real users giving feedback.

- [ ] Voice input (speech-to-text) — add if users report friction with text entry
- [ ] Landtag politician matching — add once Bundestag data pipeline is stable
- [ ] Politician response rate tracking — add if users ask "did it work?"
- [ ] Share button ("I wrote to my MdB") — add if social sharing emerges organically

### Future Consideration (v2+)

- [ ] Pensaki auto-pen integration — validate handwriting demand first; auto-pen is a different product for users who won't do it themselves
- [ ] EU Parliament / MEP matching — teased in v1 UI, built in v2
- [ ] Kommune politician matching — most complex data problem, lowest politician-level readership, lowest leverage for most national issues
- [ ] Campaign mode for NGOs — "Write a letter about [specific law]" with pre-filled topic; requires NGO partnerships first
- [ ] Anonymous response tracking — email follow-up survey 4 weeks after generation ("did your politician reply?"); requires email capture to be widespread

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Text input for frustration | HIGH | LOW | P1 |
| PLZ input + validation | HIGH | LOW | P1 |
| PLZ → Wahlkreis → MdB lookup (Bundestag) | HIGH | HIGH | P1 |
| AI letter generation | HIGH | MEDIUM | P1 |
| Letter display + politician info | HIGH | LOW | P1 |
| "What to do next" instructions | HIGH | LOW | P1 |
| Landing page + handwritten letter explanation | HIGH | LOW | P1 |
| DSGVO / privacy statement | HIGH | LOW | P1 |
| Mobile-responsive UI | HIGH | LOW | P1 |
| Loading state during AI generation | MEDIUM | LOW | P1 |
| AI political level classification | HIGH | MEDIUM | P1 |
| Optional email PDF delivery | MEDIUM | LOW | P2 |
| Voice input (speech-to-text) | MEDIUM | MEDIUM | P2 |
| Landtag politician matching | MEDIUM | HIGH | P2 |
| Politician photo + party display | MEDIUM | LOW | P2 |
| "Tease Brussels / v2" UI element | LOW | LOW | P2 |
| Politician response tracking | HIGH | HIGH | P3 |
| Pensaki auto-pen integration | MEDIUM | HIGH | P3 |
| NGO campaign mode | HIGH | HIGH | P3 |
| EU Parliament matching | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for v1 launch
- P2: Should have — add before or shortly after launch
- P3: Future — only after validation

---

## Competitor Feature Analysis

| Feature | Resistbot (USA) | WriteToThem (UK) | Abgeordnetenwatch (DE) | Brief nach Berlin |
|---------|:---:|:---:|:---:|:---:|
| Postcode → representative lookup | Yes | Yes | Partial | Yes (PLZ → Wahlkreis) |
| AI-assisted letter drafting | Yes (bill/article input) | No | No | Yes (frustration → letter) |
| Voice input | No | No | No | Yes (v1 target) |
| Determines political level automatically | No | No | No | Yes |
| Handwritten letter focus | No (digital/printed) | No (email) | No | Yes (core differentiator) |
| Physical mail delivery | Yes (Lob API, printed) | No | No | User does it themselves (v1) |
| Multi-level gov coverage | Yes (federal/state/city) | Yes (all UK levels) | Yes (Bundestag/Landtag/EU) | Yes (Bund/Land, v1) |
| No account required | Yes | Yes | No | Yes |
| Free | Yes | Yes | Yes | Yes |
| German language | No | No | Yes | Yes |
| DSGVO-compliant by design | No | No | Partial | Yes |
| Letter length calibrated for handwriting | No | No | No | Yes (unique) |

**Conclusion:** Brief nach Berlin has a genuinely unique feature combination. No existing tool covers AI-drafted + handwriting-format + PLZ-to-politician + no-account + German. The competitive gap is wide open.

---

## Sources

- [MARKET-RESEARCH.md](/Users/thomas/Documents/Git Repos/brief-nach-berlin/MARKET-RESEARCH.md) — primary source for competitor analysis and feature landscape
- [Resistbot](https://resist.bot/) — US model; AI drafting + multi-channel delivery
- [WriteToThem / mySociety](https://www.writetothem.com/) — UK model; postcode → representative + email
- [Abgeordnetenwatch API](https://www.abgeordnetenwatch.de/api) — German politician data source, not a direct competitor
- [Congressional Management Foundation](https://www.ncronline.org/news/politics/handwritten-letters-still-most-effective-persuasion) — 96% of staff say letters most effective
- [HanisauLand — Post an Abgeordnete](https://www.hanisauland.de/wissen/wahl/post-an-abgeordnete.html) — Bundestag endorses physical letter writing to MPs
- [Parents for Future — Entscheidern schreiben](https://www.parentsforfuture.de/de/node/2741) — NGO campaign using personal letters
- [Web Speech API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) — browser-native voice input
- [Bundeswahlleiterin Open Data 2025](https://www.bundeswahlleiterin.de/bundestagswahlen/2025/ergebnisse/opendata.html) — Wahlkreis boundary data

---

*Feature research for: citizen-to-politician letter writing platform (civic tech, Germany)*
*Researched: 2026-04-10*
