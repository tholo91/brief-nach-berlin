# Market Research: Brief nach Berlin

**Date:** 2026-03-27
**Status:** Comprehensive research covering competitors, infrastructure, data sources, and strategic recommendations.

---

## Table of Contents

1. [Direct Competitors in Germany/EU](#1-direct-competitors-in-germanyeu)
2. [International Equivalents](#2-international-equivalents)
3. [NGOs and Organizations for Potential Partnerships](#3-ngos-and-organizations-for-potential-partnerships)
4. [Petition Platforms — Comparison](#4-petition-platforms--comparison)
5. [Key APIs and Data Sources](#5-key-apis-and-data-sources)
6. [The "Handwritten Letter" Angle — Evidence](#6-the-handwritten-letter-angle--evidence)
7. [Auto-Pen / Handwritten Letter Services](#7-auto-pen--handwritten-letter-services)
8. [Strategic Recommendation](#8-strategic-recommendation)

---

## 1. Direct Competitors in Germany/EU

### No direct competitor exists.

There is currently **no tool in Germany** that combines all three elements of Brief nach Berlin: (1) AI-assisted letter drafting, (2) PLZ-to-politician matching, and (3) a focus on handwritten physical letters. This is the key finding.

### Closest Players in Germany

#### Abgeordnetenwatch.de
- **What it does:** Independent platform for transparency and public questioning of politicians. Citizens can publicly ask questions to their representatives. Stores data on German political candidates and MPs at regional, national, and EU level, plus voting records, committee memberships, and side jobs.
- **API:** Free, CC0-licensed REST API (v2) with endpoints for `parliaments`, `parliament-periods`, `politicians`, and `candidacies-mandates`. Includes electoral district data, voting behavior, and party affiliations. JSON format with filtering, pagination, and sorting.
- **What it does NOT do:** No letter writing, no AI assistance, no physical mail. It is a transparency/Q&A platform, not a communication tool.
- **Relevance to BnB:** Their API is the single best structured data source for politician information in Germany. A natural data partner, not a competitor.
- **URL:** https://www.abgeordnetenwatch.de / https://www.abgeordnetenwatch.de/api

#### Briefe an die Politik (briefe-an-die-politik.org)
- **What it does:** A simple website that provides letter templates for contacting Bundestag members, with links to Abgeordnetenwatch contact forms and the Bundestag email pattern (vorname.nachname@bundestag.de).
- **Status:** Appears **inactive/archived** — content references April 2021 pandemic conditions. No AI, no PLZ matching, no personalization.
- **Relevance to BnB:** Validates the concept that people search for "how to write to politicians." Shows the space is underserved — this abandoned project is the closest thing that exists.
- **URL:** https://www.briefe-an-die-politik.org/

#### FragDenStaat (Open Knowledge Foundation)
- **What it does:** Freedom of Information (FOI) request platform. Helps citizens submit questions to government authorities under FOI laws and publishes responses publicly. Responsible for over a third of all FOI requests in Germany.
- **What it does NOT do:** Not for contacting elected politicians about personal concerns. Focused on government transparency, not constituent communication.
- **Relevance to BnB:** Potential ally in the open-data/civic-tech ecosystem. Not a competitor.
- **URL:** https://fragdenstaat.de/

#### Liquid Democracy / Adhocracy+
- **What it does:** Non-profit from Berlin building digital participation tools. Adhocracy+ is a SaaS platform for participatory budgeting, consultation, and collaborative decision-making. Used by ~280 German municipalities.
- **What it does NOT do:** No citizen-to-politician letter writing. Focused on institutional participation processes.
- **Relevance to BnB:** Different space entirely. No overlap.
- **URL:** https://liqd.net / https://adhocracy.plus/

#### Parents for Future / NGO Letter Campaigns
- **What it does:** Various NGOs (Parents for Future, BDO e.V., VGSD) occasionally publish template letters for their supporters to send to politicians on specific issues.
- **What it does NOT do:** One-off campaigns, not a platform. No AI, no PLZ matching, no ongoing service.
- **Relevance to BnB:** Validates demand. These orgs could be users/promoters of Brief nach Berlin.

### Summary: Germany Competitive Landscape

| Tool | Letter Writing | AI-Assisted | PLZ Matching | Physical Mail Focus | Active |
|------|:---:|:---:|:---:|:---:|:---:|
| **Brief nach Berlin** | Yes | Yes | Yes | Yes | Building |
| Abgeordnetenwatch | No (Q&A only) | No | Partial | No | Yes |
| Briefe an die Politik | Templates only | No | No | No | Inactive |
| FragDenStaat | FOI requests | No | No | No | Yes |
| Adhocracy+ | No | No | No | No | Yes |
| NGO campaigns | Templates | No | No | Sometimes | Ad hoc |

**The competitive gap is wide open.**

---

## 2. International Equivalents

### Resistbot (USA) — The Closest Model
- **What it does:** Text "RESIST" to 50409 to compose and send letters to elected officials via SMS, Facebook Messenger, Twitter, or Telegram. Identifies federal, state, and city officials. Delivers via email (primary), fax, postal mail, and hand delivery.
- **Scale:** 10 million Americans, 50 million letters sent since 2017.
- **Physical mail:** Uses **Lob API** (direct mail automation) for physical letter delivery when needed. Not handwritten — printed.
- **Revenue model:** Non-profit (Resistbot Action Fund). Donation-funded.
- **Key insight:** Started as a simple bot in 2017 and scaled massively. Proves the demand exists. However, Resistbot does NOT focus on handwritten letters — it optimizes for speed and digital delivery.
- **URL:** https://resist.bot/

### WriteToThem (UK) — The Infrastructure Model
- **What it does:** Enter your postcode, see all your representatives (councillors to MPs to MEPs), compose and send an email. 15,000 users/month.
- **Built by:** mySociety, a UK non-profit that builds civic tech infrastructure.
- **Key infrastructure:** mySociety's **MapIt API** maps geographic points to legislative boundaries. **TheyWorkForYou** tracks parliamentary activity with a full API going back to the 1930s. All open source.
- **Revenue model:** Non-profit, grant-funded.
- **Key insight:** mySociety proves that the **infrastructure layer** (postcode-to-representative mapping) is the hardest and most valuable part. Their MapIt approach could inspire the PLZ-to-Wahlkreis solution.
- **Open source:** WriteToThem code is on GitHub: https://github.com/mysociety/writetothem
- **URL:** https://www.writetothem.com/

### Letters to Congress (US) — AI Letter Writing
- **What it does:** AI-powered tool that drafts letters to US senators in the style of famous authors. Identifies senators by state and adapts tone to regional/political context.
- **Relevance:** Proves the AI-letter-to-politician concept works. Appears to be a smaller tool, not at Resistbot scale.
- **URL:** https://www.yeschat.ai/gpts-2OToOD8tia-Letters-to-Congress

### EveryAction / VoterVoice (US) — Advocacy Platforms
- **What it does:** Enterprise advocacy software used by large NGOs. Supporters can send emails, calls, tweets, and form submissions to elected officials at all levels. Includes local official lookup by address.
- **Relevance:** B2B model, not consumer-facing. Shows how large orgs facilitate constituent contact at scale.
- **URL:** https://www.everyaction.com/

### PopVox (US)
- **What it does:** Connects citizens with government through publications, events, and technical assistance. Helps elected officials better serve constituents.
- **Relevance:** More of a policy/transparency tool than a direct communication channel.
- **URL:** https://www.popvox.org/

### Summary: International Landscape

| Tool | Country | AI | Physical Mail | Scale | Model |
|------|---------|:---:|:---:|-------|-------|
| Resistbot | USA | No (template) | Yes (Lob API) | 50M letters | Non-profit |
| WriteToThem | UK | No | No (email only) | 15K/month | Non-profit |
| Letters to Congress | USA | Yes | No | Small | Free tool |
| EveryAction | USA | No | No | Enterprise | B2B SaaS |

**No international tool combines AI + handwritten letter focus.** Brief nach Berlin's angle is genuinely novel.

---

## 3. NGOs and Organizations for Potential Partnerships

### Tier 1: Data Partners (essential infrastructure)

#### Abgeordnetenwatch.de
- **Why:** Best structured politician database in Germany. CC0-licensed API with politicians, mandates, constituencies, and voting data.
- **Partnership angle:** Use their API as the data backbone. In return, drive traffic to their profiles. They benefit from more engaged citizens.
- **Contact:** Via their website or API documentation page.

#### Open Knowledge Foundation Deutschland (OKF DE)
- **Why:** Runs FragDenStaat, the Prototype Fund, Code for Germany, and OffenesParlament.de. Deep connections in German civic tech.
- **Partnership angle:** Technical guidance, potential Prototype Fund application, network access.
- **URL:** https://okfn.de/

#### Bundeswahlleiterin (Federal Returning Officer)
- **Why:** Official source for Wahlkreis boundaries, election data, and geographic mapping.
- **Partnership angle:** Not a "partnership" per se — just use their open data. Free CSV/shapefile downloads.
- **URL:** https://www.bundeswahlleiterin.de/

### Tier 2: Distribution Partners (reach citizens)

#### Campact / WeAct
- **Why:** 4.25 million-strong progressive community. Already mobilizes citizens for political action.
- **Partnership angle:** "After you sign this petition, write a personal letter for even more impact" — funnel from petition to personal letter.
- **URL:** https://www.campact.de/ / https://weact.campact.de/

#### Mehr Demokratie e.V.
- **Why:** Germany's leading direct democracy NGO. Campaigns for citizen participation.
- **Partnership angle:** They could promote BnB to their base as a concrete participation tool.

#### Parents for Future / Fridays for Future Germany
- **Why:** Already encourages supporters to write to politicians. Has published template letters.
- **Partnership angle:** Provide BnB as the tool their supporters use instead of templates.

### Tier 3: Technical/Ecosystem Partners

#### Democracy Technologies (democracy-technologies.org)
- **Why:** Maintains a database of all civic tech tools. Could list and promote BnB.
- **URL:** https://democracy-technologies.org/

#### Prototype Fund (BMBF-funded via OKF DE)
- **Why:** Funds open-source civic tech projects in Germany. Up to 47,500 EUR per project for 6 months.
- **Partnership angle:** Apply for funding. BnB fits their criteria perfectly.
- **URL:** https://prototypefund.de/

---

## 4. Petition Platforms — Comparison

### Platform Overview

| Platform | Type | Scale (DE) | Political Binding | Personal Impact |
|----------|------|-----------|:---:|:---:|
| **Bundestag Petitionsausschuss** | Official | Varies | Yes (legally required review) | Low (bureaucratic) |
| **OpenPetition** | Non-profit | Large | No | Low |
| **WeAct (Campact)** | Non-profit, progressive | 4.25M community | No | Low |
| **Change.org** | For-profit (US) | Large | No | Low |
| **Brief nach Berlin** | Planned | — | No | **High** |

### Key Differences

**Petitions** are mass-action tools: many signatures on one demand. They work through volume and media pressure. But:
- 90% of communications legislators receive are template/mass-produced
- Staff members give **less weight** to mass-produced communications
- Petitions on WeAct/Change.org are **not legally binding**
- Even official Bundestag petitions state "all petitions are treated with equal care regardless of number of signatures" — which diplomatically means: signatures alone don't determine outcome

**Personal letters** work through a fundamentally different mechanism:
- They demonstrate **individual effort** and genuine concern
- Congressional/Bundestag staff use the **amount of effort required** as a proxy for how strongly a constituent cares
- Just **5-7 individual letters** on a topic can trigger an office to open a tracking folder
- Fewer than **100 personalized messages** can be enough for an office to consider action

**The strategic framing:** Brief nach Berlin is not a petition alternative. It is a **petition complement**. The ideal flow:
1. Sign a petition on WeAct/OpenPetition (low effort, shows numbers)
2. Write a personal letter via Brief nach Berlin (high effort signal, gets read)

This positions BnB as the "next step" after signing a petition — not a replacement.

---

## 5. Key APIs and Data Sources

### Politician Data

| Source | Coverage | Format | License | Quality |
|--------|----------|--------|---------|---------|
| **Abgeordnetenwatch API v2** | Bundestag, Landtage, EU Parliament | JSON REST API | CC0 (free) | Excellent |
| **Bundestag DIP API** | Bundestag only (since 1949) | JSON REST API | Open (API key required) | Good |
| **Bundestag Open Data** | Bundestag biographical data (since 1949) | XML, JSON | Open | Good |
| **EU Parliament Open Data** | All MEPs | REST API (Swagger) | Open | Good |
| **OpenSanctions** | Cross-referenced politician data | JSON, CSV | Open | Good (aggregated) |

### Geographic / Electoral Mapping

| Source | What it provides | Format | Notes |
|--------|-----------------|--------|-------|
| **Bundeswahlleiterin** | Wahlkreis boundaries, election results | CSV, Shapefile | Official source. Updated per election. |
| **OpenPLZ API** | PLZ to city/Bundesland mapping | REST API | Free, open source. Does NOT map to Wahlkreis. |
| **OpenDataSoft** | Wahlkreis geographic data (GeoJSON) | API + export | Community-maintained. |
| **okfde/wahldaten (GitHub)** | Various election datasets | CSV, JSON | Community-curated by OKF DE. |

### The PLZ-to-Wahlkreis Challenge

This is the single hardest data problem for Brief nach Berlin:

- **PLZ areas do NOT align with Wahlkreis boundaries.** A single PLZ can span multiple electoral districts, and a single Wahlkreis can contain dozens of PLZ areas.
- **The Bundeswahlleiterin has confirmed** that the smallest unit in their electoral division is the municipality, and municipalities split across Wahlkreise are not further broken down.
- **Solution approaches:**
  1. **Approximate mapping:** Use municipality-level data (Gemeindeschlüssel) as intermediary. PLZ -> Gemeinde -> Wahlkreis. This works for ~90% of cases.
  2. **Geocoding:** Convert PLZ to coordinates, then point-in-polygon against Wahlkreis shapefiles. More accurate but requires GIS processing.
  3. **User disambiguation:** When a PLZ maps to multiple Wahlkreise, ask the user to pick their municipality from a short list.
  4. **Use Abgeordnetenwatch:** Their system already handles this mapping internally. If their API exposes constituency lookup by location, leverage it.

### Recommended Data Architecture for v1

```
Primary:     Abgeordnetenwatch API (politicians, mandates, parties)
Supplement:  Bundestag DIP API (parliamentary activity, context)
Geographic:  Bundeswahlleiterin shapefiles + OpenPLZ API
EU:          EU Parliament Open Data Portal
Fallback:    Manual curation for Landtag and Kommune data
```

---

## 6. The "Handwritten Letter" Angle — Evidence

### US Congress (well-documented)

- **96% of Capitol Hill staff** say letters are the most effective way to influence politicians (Congressional Management Foundation survey).
- Handwritten letters are rated **second only to face-to-face meetings** in effectiveness.
- Staff give **less weight to mass-produced communications** — personal, handwritten letters stand out.
- Just **5-7 letters** on a topic trigger offices to start tracking the issue.
- Fewer than **100 personalized emails** can prompt an office to consider action.
- The key variable is **perceived effort**: legislators use the effort required to communicate as a proxy for how strongly a constituent feels.

### German Bundestag (anecdotal but consistent)

- Thomas's own observation from a Bundestag internship: **handwritten letters are read and internally discussed** in Abgeordneten offices.
- The Bundestag's own children's education portal (HanisauLand.de) actively encourages children to write physical letters to their Abgeordnete — implying the institution considers this a legitimate and valued form of communication.
- Multiple German advocacy organizations (Parents for Future, BDO e.V., VGSD) specifically instruct supporters to write **personal letters to their Wahlkreis MdB** as the most effective action.
- The website wissenleben.de notes that letters are most effective "wenn man ihnen etwas beifuegt" (when you add something personal), reinforcing the personalization thesis.

### Academic Context

- Political science research on **legislative responsiveness** consistently shows that individual constituent contact is more impactful than mass communication.
- The effort-as-signal theory: a handwritten letter costs the sender time and materials, which signals genuine concern in a way that a one-click petition signature cannot.

### Gap in Evidence

- **No formal German study** specifically comparing handwritten vs. digital communication effectiveness with Bundestag members was found. This is itself an opportunity: Brief nach Berlin could commission or conduct such research as part of its launch PR strategy.

### EU Parliament

- The effectiveness of handwritten letters to MEPs in Brussels is **unresearched and uncertain.** EU Parliament offices operate differently from national parliaments. The EU Petitions Committee (PETI) handles formal petitions, but individual constituent letters are less established as a channel.
- **Recommendation:** For v1, focus on Bundestag and Landtag. Add EU as a secondary option with appropriate caveats.

---

## 7. Auto-Pen / Handwritten Letter Services

### Pensaki (Germany) — The Leading Option
- **What:** Robot-handwritten letters using real pens and ink on paper. Based in Germany.
- **How:** Robots write in realistic human handwriting, then letters are enveloped with handwritten addresses, stamped, and mailed via Deutsche Post.
- **Integration:** RESTful API and Zapier app for CRM integration. Campaigns via web interface, CSV upload, or API.
- **Pricing:** No fixed price list (custom per format). All-inclusive pricing covers stationery, handwriting, enveloping, postage, and delivery. Minimum order: 10 letters.
- **Delivery:** Worldwide via Deutsche Post Global Mail within 3 working days.
- **Response rates:** Claims 10-40% response rates for B2B use cases.
- **URL:** https://shop.pensaki.com/

### Lob (USA) — Resistbot's Choice
- **What:** Direct mail API for automating printed (not handwritten) letters.
- **How:** REST API accepts recipient address, mail type, and content/template. Prints and mails physical letters.
- **Scale:** Powers Resistbot's 50M+ letters.
- **Limitation:** US-focused. Printed, not handwritten.
- **URL:** https://www.lob.com/

### Implications for Brief nach Berlin

**v1 (MVP):** Users write the letter themselves by hand. BnB generates the text, user copies it. No auto-pen needed. This is actually a feature, not a limitation — the act of handwriting is part of the impact.

**v2 (Auto-pen):** Partner with Pensaki for automated handwritten delivery. Their API integration makes this technically feasible. Key questions:
- Cost per letter (need to negotiate B2C/civic pricing vs. their B2B rates)
- Whether Pensaki would offer discounted rates for a civic/democratic use case
- Volume thresholds for pricing tiers

---

## 8. Strategic Recommendation

### Build Independently, on Top of Existing Infrastructure

The recommendation is clear: **build Brief nach Berlin as an independent product** that leverages existing open data infrastructure. Here is why:

#### Why NOT partner/merge with an existing org:
- **No existing org does what BnB does.** Abgeordnetenwatch is transparency, not communication. FragDenStaat is FOI, not constituent letters. Campact is petitions, not personal letters.
- Joining an existing org would dilute the unique value proposition (handwritten letters).
- The bureaucratic overhead of embedding in an NGO would slow shipping.

#### Why NOT build everything from scratch:
- The politician data layer is already solved (Abgeordnetenwatch API, CC0 license).
- The geographic mapping layer is partially solved (Bundeswahlleiterin + OpenPLZ).
- Building your own politician database would be wasted effort.

#### The Right Approach: Independent Build, Open Data Stack

```
Brief nach Berlin (your product)
├── Frontend: Landing page + letter generation UI
├── AI Layer: Letter drafting (Claude/GPT with prompt engineering)
├── Data Layer: Consumes existing APIs
│   ├── Abgeordnetenwatch API (politicians, mandates, constituencies)
│   ├── Bundeswahlleiterin data (Wahlkreis boundaries)
│   ├── OpenPLZ API (PLZ resolution)
│   └── EU Parliament Open Data (MEPs)
└── Distribution: Partnerships with NGOs for reach
    ├── Campact/WeAct ("write a letter after signing")
    ├── Parents for Future ("use this tool")
    └── Mehr Demokratie e.V. (promotion)
```

### Immediate Next Steps (Prioritized)

1. **Validate the PLZ-to-Wahlkreis mapping** — this is the hardest unsolved technical problem. Prototype it with Abgeordnetenwatch API + Bundeswahlleiterin data. If this works reliably, the rest is straightforward.

2. **Build the AI letter engine** — prompt-engineer a system that takes (frustration text + politician + level) and outputs a one-page, handwriting-ready letter. This is your core differentiator.

3. **Ship a v0.1 landing page** — even before the full product works, a page that explains the concept and collects email signups validates demand. You can do this today.

4. **Talk to Abgeordnetenwatch** — introduce the project, confirm API usage plans, explore whether they'd link to BnB from politician profiles.

5. **Apply to the Prototype Fund** — BnB fits their criteria (open source, civic tech, German-based). Up to 47,500 EUR for 6 months of development. Next application round: check https://prototypefund.de/.

### Moat and Differentiation

Brief nach Berlin's moat is NOT the data (it's open) or the AI (anyone can prompt-engineer). The moat is:

1. **The handwritten letter framing** — a unique behavioral insight that no one else is building around.
2. **The brand** — "Brief nach Berlin" is memorable and explains itself.
3. **The experience** — making the path from frustration to addressed letter feel effortless.
4. **Network effects** — if successful, politician response data ("this MdB actually replied") becomes a unique dataset.

---

## Sources

### German Platforms
- [Abgeordnetenwatch.de](https://www.abgeordnetenwatch.de/)
- [Abgeordnetenwatch API](https://www.abgeordnetenwatch.de/api)
- [Briefe an die Politik](https://www.briefe-an-die-politik.org/)
- [FragDenStaat](https://fragdenstaat.de/)
- [OffenesParlament.de](https://offenesparlament.de/)
- [Liquid Democracy / Adhocracy+](https://liqd.net/)
- [OpenPetition](https://www.openpetition.de/)
- [WeAct / Campact](https://weact.campact.de/)
- [Democracy Technologies Database](https://democracy-technologies.org/database/)
- [Code for Germany](https://codefor.de/)
- [Prototype Fund](https://prototypefund.de/)

### International Tools
- [Resistbot](https://resist.bot/)
- [WriteToThem / mySociety](https://www.writetothem.com/)
- [mySociety APIs for Campaigns](https://www.mysociety.org/democracy/apis-for-campaigners/)
- [Letters to Congress (AI)](https://www.yeschat.ai/gpts-2OToOD8tia-Letters-to-Congress)
- [EveryAction Advocacy](https://www.everyaction.com/)
- [PopVox Foundation](https://www.popvox.org/)
- [Lob Direct Mail API](https://www.lob.com/)

### Data Sources
- [Bundeswahlleiterin Open Data (2025)](https://www.bundeswahlleiterin.de/bundestagswahlen/2025/ergebnisse/opendata.html)
- [Bundeswahlleiterin Wahlkreis Downloads](https://www.bundeswahlleiterin.de/en/bundestagswahlen/2025/wahlkreiseinteilung/downloads.html)
- [Bundestag Open Data](https://www.bundestag.de/services/opendata)
- [Bundestag DIP API](https://dip.bundestag.de/%C3%BCber-dip/hilfe/api)
- [EU Parliament Open Data Portal](https://data.europarl.europa.eu/en/home)
- [OpenPLZ API](https://www.openplzapi.org/en/)
- [OpenDataSoft Wahlkreis Data](https://data.opendatasoft.com/explore/dataset/georef-germany-wahlkreis-millesime@public/export/)
- [okfde/wahldaten (GitHub)](https://github.com/okfde/wahldaten)
- [OpenSanctions German Legislators](https://www.opensanctions.org/datasets/de_abgeordnetenwatch/)
- [Bundestag Petitionsportal](https://epetitionen.bundestag.de/)

### Auto-Pen / Handwritten Letter Services
- [Pensaki (Germany)](https://shop.pensaki.com/)
- [Pensaki API](https://shop.pensaki.com/en/api-for-handwritten-notes/)

### Evidence on Letter Effectiveness
- [Congressional Management Foundation — Handwritten letters most effective](https://www.ncronline.org/news/politics/handwritten-letters-still-most-effective-persuasion)
- [Citizens' Climate Lobby — Write Your Member of Congress](https://community.citizensclimate.org/resources/item/19/309)
- [Duke University — Why Write a Handwritten Letter to Your Legislator](https://blogs.nicholas.duke.edu/outdoordevil/why-you-should-write-a-handwritten-letter-to-your-legislator/)
- [AFCPE — Tips for Writing Effective Letters to Elected Representatives](https://www.afcpe.org/wp-content/uploads/2024/06/Tips-for-Writing-Effective-Letters-to-Congress.pdf)
- [EA Forum — Talking to Congress: Constituent Contact and Policy](https://forum.effectivealtruism.org/posts/5oStggnYLGzomhvvn/talking-to-congress-can-constituents-contacting-their)
- [Resistbot + Lob Case Study](https://www.lob.com/case-studies/resistbot)
- [HanisauLand — Post an Abgeordnete](https://www.hanisauland.de/wissen/spezial/politik/abgeordnete-spezial/post-an-abgeordneten)
- [Parents for Future — Entscheidern schreiben](https://www.parentsforfuture.de/de/node/2741)

### Civic Tech Ecosystem
- [Political Tech Summit Berlin](https://www.politicaltech.eu/)
- [Civic Tech Field Guide](https://civictech.guide/)
- [OECD — AI in Civic Participation](https://www.oecd.org/en/publications/2025/06/governing-with-artificial-intelligence_398fa287/full-report/ai-in-civic-participation-and-open-government_51227ce7.html)
- [Global Democracy Coalition — Best Digital Participation Tools 2025](https://globaldemocracycoalition.org/library/best-digital-participation-tools-of-2025-a-new-era-of-civic-tech/)
