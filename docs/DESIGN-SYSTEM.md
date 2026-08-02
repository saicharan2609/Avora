# Avora — Design System & UX Specification

**Document type:** Design System and UX Specification
**Canonical path:** `docs/DESIGN-SYSTEM.md`
**Version:** 1.0
**Status:** Draft
**Owner:** Founding Product Designer / Design Systems Lead
**Audience:** Product Designers, UX Designers, UI Designers, Frontend Engineers, AI coding agents (Claude Code, Cursor, GitHub Copilot), QA, future employees

**Dependencies (immutable upstream sources):**

| Source | Role | Precedence |
| --- | --- | --- |
| `docs/PRD.md` — Avora Product Requirements Document v1.0 | Defines *what* Avora is and must do. Normative vocabulary and requirement identifiers. | 1 — never contradicted |
| `docs/architecture.md` — Avora Engineering Architecture | Defines *how* the system is built, including the component layering this document specifies against. | 2 — never contradicted |
| Live production interfaces (Authentication, Onboarding, Dashboard, Study Dashboard, AI Tutor) | Define the canonical visual and interaction language. | 3 — never redesigned |
| This document | Defines the reusable rules that make surfaces 6 through 600 look like surfaces 1 through 5. | 4 |

---

## Contents

**Part 0 — About this document**
0. About This Document · 0.5 Verification Backlog

**Part 1 — Identity**
1. Executive Summary · 2. Design Vision · 3. The Existing Visual Identity · 4. Brand Personality and Values · 5. Design Principles · 6. Voice and Tone

**Part 2 — Structure**
7. Information Hierarchy · 8. Information Architecture and Navigation · 9. Layout Philosophy and Grid · 10. Responsive Strategy

**Part 3 — Tokens**
11. Design Token Architecture · 12. Colour · 13. Typography · 14. Spacing and Sizing · 15. Border Radius · 16. Elevation, Shadow, and Glass · 17. Motion

**Part 4 — Components**
18. Component Philosophy (incl. Iconography, Illustration) · 19. Navigation System · 20. Buttons · 21. Cards · 22. Forms and Inputs · 23. Search Experience · 24. Lists, Tables, and Trees · 25. Overlays · 26. Feedback Components · 27. Progress and Data Display

**Part 5 — States and AI**
28. State System · 29. AI Interaction Patterns · 30. AI Chat Experience · 31. AI Response Presentation · 32. AI Suggestions

**Part 6 — Surfaces**
33. File Upload Experience · 34. Authentication · 35. Onboarding · 36. Dashboard (Home) · 37. Subject and Study Dashboard · 38. AI Tutor Surface Rules · 39. Planner · 40. Attendance

**Part 7 — Quality**
41. Accessibility Standards · 42. Design Consistency Rules · 43. Design Do's and Don'ts

**Part 8 — Governance**
44. Theme Switching, Handoff, and Token Distribution · 45. Future Scalability · 46. Glossary and Vocabulary Alignment · 47. Recommendation Register · 48. Open Questions · 49. Changelog

**Appendices**
A. Requirement Traceability · B. New Surface Checklist

---

## 0. About This Document

### 0.1 Purpose

Avora already has a visual identity. Five production-quality interfaces exist, are approved, and are shipping. What Avora does not yet have is the *layer above* those interfaces: the written rules that let a designer who has never seen them, or an AI coding agent with no visual memory, produce a sixth screen that is indistinguishable in quality and character from the first five.

That is the only job of this document.

It does not redesign. It does not propose an alternative direction. It does not restate the PRD or the architecture. It reverse-engineers what has already been built, names the patterns, explains why they work, converts them into reusable rules, and fills the specifications that were never written down.

**The test of success:** a new feature built from this document alone, by someone who has never opened the live application, should look like it shipped on the same day as the Dashboard.

### 0.2 Relationship to upstream documents

This document sits downstream of the PRD and the Architecture and is bound by both.

- Where the PRD defines a **behaviour** (for example, FR-039: classification confidence must be visible with one-action correction), this document defines the **form** that behaviour takes on screen.
- Where the Architecture defines an **enforcement point** (for example, `CitationChip` cannot render an unresolved citation), this document defines the **anatomy, states, and copy** of that component.
- Where the PRD defines **vocabulary** (§14.1 Entity definitions), that vocabulary is binding on every label, every component name, and every string in the product. Section 46 records where production currently diverges.

Nothing in this document may weaken a `PR-##`, `FR-###`, `NFR-###`, `AIR-###`, or `RAI-##`. Where a visual convention and a requirement conflict, the requirement wins and the convention is amended. Section 47 lists every instance found.

### 0.3 Evidence method — how to read the confidence markers

This document was written by studying the five approved production interfaces and both upstream documents. Some things could be observed directly. Some had to be inferred from repetition. Some are simply not written down anywhere yet.

Conflating those three would be the fastest way to make this document untrustworthy, so every non-obvious statement carries one of three markers:

| Marker | Meaning | How to treat it |
| --- | --- | --- |
| **`[OBSERVED]`** | Directly verifiable in the live application or in an upstream document. | Canon. Do not change without a design review. |
| **`[DERIVED]`** | A rule inferred from a pattern that recurs consistently across surfaces. The pattern is real; the *rule* is this document's formalisation of it. | Treat as canon. Challenge only with evidence of a counter-example. |
| **`[RECOMMENDED]`** | A gap. Nothing upstream specifies it. This document proposes an answer consistent with everything observed. | Requires design sign-off before it becomes canon. Not yet binding. |

Where a recommendation would change something already in production, it is written as a paired **Current Standard → Recommended Evolution**, never as a correction. The production interfaces are the foundation; evolution is additive.

### 0.4 A stated limitation, and what to do about it

The live interfaces were studied through their rendered output. Exact numeric values held in the stylesheet — the precise accent hex, the type ramp in pixels, radius values, shadow definitions, easing curves — were not extractable without access to the source repository or a running inspector.

This matters, and it is handled as follows:

- Values that **were** confirmed are marked `[OBSERVED]` and treated as canon.
- Values that were **not** confirmed are marked `[RECOMMENDED — VERIFY]`, and a candidate value is proposed that is consistent with the confirmed evidence and with the product's stated character.
- Every such value is listed in the **Verification Backlog** (§0.5). Clearing that backlog is a half-day task for one engineer with the repository open, and it should be done before this document is promoted from Draft to Approved.

**The binding instruction:** where a `[RECOMMENDED — VERIFY]` value differs from the value in `packages/design-tokens/`, **the source wins and this document is corrected**. The *roles*, *ratios*, *relationships*, and *rules* attached to each token remain binding regardless, because those are the parts that were derived from what is actually on screen.

This is deliberate. A design system whose numbers are provisional but whose rules are sound is useful immediately. One that invents numbers and presents them as fact is worse than no document at all.

### 0.5 Verification backlog

To be completed against `packages/design-tokens/` and the web build before Status moves to Approved.

| ID | Item | Section |
| --- | --- | --- |
| VB-01 | Confirm the canonical background hex. Two values are in production: `#080D11` (Authentication, Onboarding, Study Dashboard, AI Tutor) and `#0A0D10` (Dashboard). One must win. | §12.3 |
| VB-02 | Extract the full surface ramp (base, raised, overlay, sunken) and border values. | §12.3 |
| VB-03 | Extract the primary accent hue and its full state ramp. | §12.4 |
| VB-04 | Extract semantic colours for success, warning, danger, info, and the AI-provenance accent. | §12.5 |
| VB-05 | Confirm the typeface families for display, body, and numeric roles. | §13.2 |
| VB-06 | Extract the type scale, line heights, letter-spacing, and weights actually in use. | §13.3 |
| VB-07 | Extract the radius scale. | §15 |
| VB-08 | Extract shadow definitions and any backdrop-blur values in use. | §16 |
| VB-09 | Extract transition durations and easing curves. | §17 |
| VB-10 | Confirm whether a light theme exists in any form, or whether dark is currently the only theme. | §12.7 |
| VB-11 | Confirm the icon library and stroke weight. | §18.5 |
| VB-12 | Confirm the base spacing unit and the spacing steps actually used. | §14 |

---
## 1. Executive Summary

Avora's interface has a clear and unusual point of view, and it was arrived at correctly: it was designed around a student's actual emotional state during a semester rather than around a feature list.

Four characteristics define it, and all four are visible in every approved screen.

**It is dark by default, not dark as an option.** Every production surface declares a dark colour scheme and a near-black background in the blue-black family (`#080D11`). This is not a stylistic preference. The beachhead student studies at night, on a phone, often in bed, frequently on an OLED display where a near-black background costs almost no battery. A dark, low-luminance canvas is the correct calm surface for long-session academic work, and it makes the single accent colour — used for the one thing that matters on each screen — carry enormous weight with very little ink.

**It answers a question before the student asks one.** The Dashboard does not open with a file browser or a menu. It opens with a named exam, a days-remaining count, a readiness percentage, and a single sentence telling the student what to do today. This is PRD §22.2 rendered literally: *home must answer "what should I do now" without requiring navigation.* Every subsequent screen inherits the posture — the Study Dashboard leads with the unit in progress, the AI Tutor leads with where the student left off.

**It never asserts without evidence.** "Weakest topic in your last quiz · appears in Mid 1." "142 of 180 classes · 75% required." "Based on Unit 3." Every claim the interface makes about the student carries its basis in the adjacent line of text. This is the visual expression of PR-06 (Grounded intelligence) and FR-122, and it is the single most important trust behaviour in the product. An academic system that tells a student they are weak at something, without saying how it knows, is a system the student will stop believing.

**It is dense without being busy.** The Dashboard carries eight distinct modules on one mobile scroll. It does not feel crowded because the modules are strictly consistent: each is a titled section, each contains cards with the same anatomy, each card has exactly one action, and metadata is compressed into a single middot-separated line rather than expanded into labelled fields. Consistency is what buys density.

The work of this document is to take those four characteristics — which currently live in the muscle memory of whoever built the screens — and make them mechanical, teachable, and enforceable.

Alongside that, this document records eleven specific inconsistencies and requirement conflicts found in the production interfaces. None require redesign. Two are material and should be treated as priority fixes: the phrase **"AI trained on your uploaded resources"** on the AI Tutor surface, which contradicts the PRD's public trust commitment that student content is never used to train models (NFR-043, §19.3), and the **viewport zoom lock** present on all five surfaces, which fails WCAG 2.1 AA and therefore NFR-051. Both are one-line changes. Both are in §47.

---

## 2. Design Vision

> **Avora should feel like a quiet, competent room that has already read everything you brought it.**

Unpacking that, because it governs decisions this document cannot anticipate:

**Quiet.** The interface does not compete for attention with the material. Colour is scarce. Motion is small. Nothing pulses, badges, or celebrates without cause. A student opening Avora at 11pm during exam week is already at maximum arousal; the product's job is to lower the temperature, not raise it. When in doubt, take something out.

**Competent.** Precision signals capability. Aligned numerals, exact counts, honest percentages, real dates. Avora never rounds a fact into vagueness ("a few files") when it knows the number ("24 files"). Specificity is how software earns the word *operating system*.

**Has already read everything.** The interface is never a blank container waiting for input. It arrives having done work. Every surface opens on a conclusion — a next action, a readiness figure, a resumption point — with the raw material available underneath. This is the visual consequence of PR-09 (Proactive over reactive), and it is the difference between a folder and an operating system.

**A room, not a machine.** The student owns this space. Their name is the largest word on the home screen. Their structure, their labels, their material. Avora is furniture and staff, never landlord. Any pattern that makes the student feel they are configuring themselves to suit the software violates PR-04 and is wrong regardless of how well it tests.

---

## 3. The Existing Visual Identity

This section is the observational record. It is what was found, not what is proposed. Everything downstream in this document traces back to it.

### 3.1 Confirmed global characteristics `[OBSERVED]`

| Characteristic | Evidence | Consistency |
| --- | --- | --- |
| Dark colour scheme declared at document level | `color-scheme: dark` on all five surfaces | 5 / 5 |
| Near-black blue-cast background | Theme colour `#080D11` on Authentication, Onboarding, Study Dashboard, AI Tutor; `#0A0D10` on Dashboard | 5 / 5 dark; 4 / 5 identical value |
| Mobile-first viewport, width-locked | `width=device-width, initial-scale=1` on all five | 5 / 5 |
| Zoom disabled | `user-scalable=no` on all five; `maximum-scale=1` additionally on Dashboard, Study Dashboard, AI Tutor | 5 / 5 — **see §47, RE-02** |
| Installable-app posture | `mobile-web-app-capable`, `apple-mobile-web-app-title: Avora`, `apple-mobile-web-app-status-bar-style: black-translucent` | 1 / 5 — Dashboard only, **see §47, RE-04** |
| Product naming in title | `Avora — <benefit phrase>` or `<Surface> · Avora` | 5 / 5 |

The `black-translucent` status bar style on the Dashboard is a meaningful signal: it means the interface was designed to run edge-to-edge under the device status bar, with the background colour continuing behind it. This is a full-bleed, app-like posture rather than a document posture, and it is correct for the product. §10.3 makes it a rule.

### 3.2 Surface-by-surface observations

#### Authentication — Welcome, Sign Up, Log In `[OBSERVED]`

- **Welcome** opens with a wordmark and a positioning line ("Avora / AI Semester Companion"), then a two-line headline set as a broken pair — *"Study Smarter. / Stress Less."* — then a single explanatory paragraph, then four benefit blocks each with a title and one supporting sentence, then two actions of clearly different weight: **Get Started** (primary) and *I already have an account* (secondary, sentence-case, low emphasis).
- The four benefit blocks are the product's promise in the student's own vocabulary: *Upload Notes*, *AI Study Assistant*, *Smart Quizzes*, *Exam Readiness*. Not features — outcomes.
- **Sign Up** and **Log In** share one skeleton: a back affordance, an H1, one subtitle sentence that states a *benefit* rather than an instruction ("Set up Avora once and your notes, exams and attendance stay in sync all semester" / "Log in to pick up exactly where you left off this semester"), the field stack, the primary action, an `or` divider, the federated option, and legal or cross-navigation microcopy last.
- Password fields carry an inline **Show password** control. Sign Up carries a persistent requirement hint ("Use 8+ characters with a number or symbol") placed *before* the error can occur, not after.
- Log In offers **Forgot Password?** inline at the field, not buried in the footer.

#### Onboarding `[OBSERVED]`

- A monogram mark ("A"), a broken two-line headline — *"Let's personalize / your semester."* — a duration promise ("We'll set everything up in just a couple of minutes"), three benefit bullets, one action (**Get Started**), and a closing reassurance: **"You can change any of this later."**
- The three bullets are all reversibility-and-fit promises rather than feature claims: *Your timetable, always current* / *Units, labs or programs — your way* / *AI that knows what to study next*. The middle bullet is PR-04 (Adapt, never impose) written as marketing copy, and it is doing real work: it pre-answers the anxiety of the Meera persona before she can feel it.

#### Dashboard (Home) `[OBSERVED]`

Module order, top to bottom: Identity header → Exam readiness → Today's goal → Next best action → Quick actions → Continue learning → Subjects → Today's classes → Attendance → Assignments → persistent AI entry → bottom navigation.

- **Identity header:** time-aware greeting ("Good evening"), the student's first name as the dominant type on the screen, an academic context line ("Semester 5 · Computer Science"), and two right-aligned affordances (notifications, profile avatar).
- **Exam readiness:** eyebrow *Upcoming exam* → title *Mid 1* → scope *4 subjects · Units 1–3* → urgency pair *7 days left · Starts Aug 6* → a readiness figure *68% Ready* against a target *81% goal* → a conditional forecast sentence *"Complete Unit 3 Part A today to reach 81% readiness."* → one action *Continue preparing*.
- **Today's goal:** a progress fraction *1/3* and three checkable items, each with a task line and a context line (*Finish Unit 3 Part A* / *Operating Systems*), closing with *Estimated time: 45 min*.
- **Next best action:** eyebrow → title → **evidence line** *Weakest topic in your last quiz · appears in Mid 1* → cost and value chips *12 min* / *High impact* → action *Start*.
- **Quick actions:** six equal-weight entries — Upload Notes, Ask AI, Generate Quiz, Flashcards, Study Session, Attendance. Upload is first.
- **Subjects:** a count (*5*), a filter (*All*), then per subject: a two-letter monogram, a numeric readiness figure, the subject name, the next class time, and a metadata pair (*24 files · 2 due*).
- **Today's classes:** a session count, a link to the full *Timetable*, then a time-ordered list with live status labels — **Now** with remaining time, **Next** with time-until.
- **Attendance:** an overall percentage, the underlying fraction and the threshold (*142 of 180 classes · 75% required*), a headroom statement (*"You can skip 5 more classes safely"*), then per-subject exceptions.
- **Assignments:** a due count, a filter, then title / subject / due date per row.
- A persistent **Ask Avora AI** entry sits above the bottom navigation.

#### Study Dashboard `[OBSERVED]`

- Renders client-side behind an explicit loading state: the words *"Loading subject dashboard"*.
- Bottom navigation: **Home · Subjects · AI · Planner · Profile**.

#### AI Tutor `[OBSERVED]`

- Header: *AI Tutor* → the scoped subject *Database Management Systems* → a grounding claim *"AI trained on your uploaded resources"* → academic context *Semester 5 · Computer Science*.
- A returning-user greeting naming the instructor: *"You're currently studying Database Management Systems with Dr. Meera Iyer."*
- Four stat tiles, each a label / figure / qualifier triad: *Current Progress · Unit 3 of 5 · Normalization & Functional Dependency*; *Study Streak · 7 Days · Keep it alive today*; *Resources · 12 · PDFs, PPTs & notes*; *Quiz Accuracy · 64% · +12% this week*.
- A resumption strip: *Unit 3 · 45% complete · last session Yesterday · 9:42 PM* → *Continue where you left off* → *3NF & BCNF decomposition*.
- **Suggested for you** — *Based on Unit 3* — seven suggestion cards, each a two-line pair of action and scope: *Explain Unit 3 / Normalization · 3NF & BCNF*; *Summarize today's lecture / Lecture 5 · 24 pages*; *Prepare for tomorrow's class / Lab 6 · Nested Queries*; *Generate Flashcards / From your Unit 3 notes*; *Create Practice Quiz / 10 MCQs · exam pattern*; *Explain uploaded PDF / normalization-notes.pdf*; *Ask from lecture notes / 25 notes indexed*.
- A persistent scope strip immediately above the composer: *Studying: CS3402 · Unit 3 · using 3 resources*.
- Composer placeholder: *"Ask anything about this subject"*, with a grounding reassurance beneath: *"Answers stay inside your semester syllabus"*.

### 3.3 The five signature devices `[DERIVED]`

Across all five surfaces, the same five devices recur. They *are* the Avora visual language. Any new screen that uses all five will look native; a screen that uses none will look foreign no matter how well its colours match.

| # | Device | What it is | Why it works |
| --- | --- | --- | --- |
| **D1** | **The middot metadata line** | Facts compressed onto one line, separated by `·` — *"Block C · 112 · 50m"*, *"Semester 5 · Computer Science"*, *"Unit 3 · 45% complete · last session Yesterday"* | Buys density without adding structure. Reading one line of four facts costs less than reading four labelled fields. |
| **D2** | **The eyebrow → title → evidence → action stack** | Every card names its *category* above its *subject*, states its *basis*, then offers exactly one action | The student can triage the whole screen by reading only eyebrows, and can trust any card by reading only its evidence line. |
| **D3** | **The evidence line** | A short clause stating why this card exists — *"Weakest topic in your last quiz · appears in Mid 1"*, *"Based on Unit 3"*, *"142 of 180 classes · 75% required"* | Direct expression of PR-06 and FR-122. The product never asserts without showing its working. |
| **D4** | **The figure-with-qualifier** | A large number paired with a small interpreting phrase — *68% Ready · 81% goal*, *64% · +12% this week*, *79% · 75% required* | A raw percentage is anxiety. A percentage with a reference point is information. Every number in Avora must carry its frame. |
| **D5** | **The reassurance line** | A closing sentence that removes commitment fear — *"You can change any of this later."*, *"You can skip 5 more classes safely"*, *"Answers stay inside your semester syllabus"* | This is the product's ethical signature. It serves the Rohit persona, satisfies RAI-06/FR-125, and is the reason the interface feels calm rather than merely dark. |

**Rule DS-01 `[DERIVED]`.** Every new Avora surface must use D1 and D2. Every surface that makes a claim about the student must use D3. Every surface that displays a number about the student must use D4. Every surface that asks for a commitment, or reports a shortfall, must use D5.

---

## 4. Brand Personality and Values

### 4.1 Personality

Avora is the friend in the class who is quietly two weeks ahead — and who tells you what to do without ever making you feel behind.

| Avora is | Avora is not |
| --- | --- |
| Calm | Sedate |
| Precise | Clinical |
| Direct | Blunt |
| Confident | Certain about things it cannot know |
| Encouraging | Cheerful |
| Efficient | Rushed |
| Present | Demanding |

The distinctions in the right column are the operative ones. *Calm* without *sedate* means the interface is quiet but the copy is active. *Confident* without *false certainty* means Avora says "68% ready" and also says "we don't have that in your materials." *Encouraging* without *cheerful* means Avora never congratulates a student for opening the app.

### 4.2 Values, and their visual consequence

| Value | Traces to | Visual consequence |
| --- | --- | --- |
| **The student's structure is the truth** | PR-04, PRD §14.2 | Structure labels are always rendered from data, never from a fixed vocabulary. No screen hard-codes "Unit". §8.4. |
| **Show the working** | PR-06, AIR-002, FR-122 | The evidence line (D3) is mandatory on any derived claim. Citations are visible artefacts, never footnotes. §31. |
| **Honesty over comfort** | NFR-014, AIR-003 | Failure, partial extraction, and insufficiency are first-class visual states with their own designs, not error toasts. §28. |
| **No pressure, ever** | RAI-06, RAI-07, FR-125 | Deadlines are shown because they are real. Streaks, guilt, and countdowns to nothing are prohibited. §6.4. |
| **The phone is the product** | PR-07, NFR-050 | Every pattern in this document is specified at 360 dp first and widened afterwards. §10. |
| **Usable by everyone, on anything** | PR-11, NFR-051, NFR-052 | Accessibility is a token-level and primitive-level property, not a per-screen effort. §41. |

---

## 5. Design Principles

Fifteen product principles govern Avora (PRD §13). Seven of them have direct, testable design consequences. These are the design principles — they are not new, they are the PRD's principles expressed as things a designer can check.

| ID | Design principle | Derived from | The test |
| --- | --- | --- | --- |
| **DP-01** | **Answer first, browse second.** Every surface opens on a conclusion, not on a container. | PR-09, PRD §22.2 | Can the student act without scrolling or tapping? |
| **DP-02** | **One primary action per view; one per card.** Everything else is secondary or tertiary. | PR-08, NFR-055 | Count the filled buttons. More than one on screen is a defect. |
| **DP-03** | **Every claim carries its evidence.** | PR-06, FR-122, AIR-002 | Point at any number or assertion. Is its basis within one line? |
| **DP-04** | **Structure is data.** No hierarchy, label, or depth is assumed by any component. | PR-04, FR-014–FR-020 | Would this screen still work for a subject with zero units? With three nested levels? Called "Experiments"? |
| **DP-05** | **Thumb-first.** Primary actions live in the lower third. Destructive actions never do. | PR-07, NFR-050 | Can it be completed one-handed on a 360 dp screen? |
| **DP-06** | **Honest states are designed states.** Loading, empty, partial, offline, failed, and limit-reached each have a specification. | NFR-013, NFR-014, PRD §22.2 | Does this feature have all six? |
| **DP-07** | **Calm under load.** Density is achieved through consistency, never through shrinking type or tightening contrast. | PR-08, PR-11 | Did anything drop below the minimums in §13.4 and §41.2? |

**Precedence.** When two principles conflict, the lower ID wins, except that **DP-06 and §41 (Accessibility) always win**, because they encode `NFR-051` and `NFR-014`, which are release gates rather than preferences.

---

## 6. Voice and Tone

Copy is a design material in Avora, and the architecture treats it as one: per `architecture.md` §7.4, progress and insight components accept copy only from a reviewed content catalogue, and ad-hoc strings are rejected in review. This section is the editorial standard that catalogue is reviewed against.

### 6.1 Voice rules `[DERIVED]`

| Rule | Do | Don't |
| --- | --- | --- |
| Speak in the student's vocabulary, not the system's | "24 files", "Notes", "Units" | "Resources ingested", "artifacts", "structure_unit" |
| Sentence case everywhere except the wordmark | "Continue preparing" | "Continue Preparing" |
| Actions are verbs that describe the result | "Generate Quiz", "Continue preparing", "Start" | "Submit", "OK", "Proceed" |
| The same action keeps its name through the whole flow | "Upload Notes" → uploading → "3 notes uploaded" | "Upload" → "Ingestion complete" |
| Numbers carry their frame (D4) | "142 of 180 classes · 75% required" | "79%" |
| Claims carry their basis (D3) | "Weakest topic in your last quiz" | "You should revise this" |
| Time is relative first, absolute second | "Tomorrow · 11:59 PM", "Yesterday · 9:42 PM" | "01/08/2026 23:59" |
| Never apologise; explain and offer the next step | "Couldn't read 4 pages. Retake those pages?" | "Sorry! Something went wrong." |

### 6.2 The tone floor — non-negotiable `[OBSERVED from PRD]`

`FR-125` and `RAI-06` prohibit shaming, loss-framing, and manufactured urgency in insight and progress language. `RAI-07` prohibits engagement mechanics that exploit anxiety. The Rohit persona is the PRD's declared ethical centre of gravity, and every string must be evaluated against him.

**Prohibited constructions:**

| Prohibited | Why | Write instead |
| --- | --- | --- |
| "You're falling behind" | Shaming | "3 units are still uncovered before Mid 1" |
| "Don't lose your streak!" | Loss-framing | "You've reviewed on 7 of the last 7 days" |
| "Only 2 hours left!" (when nothing happens at the deadline) | Manufactured urgency | Omit entirely |
| "You skipped yesterday's plan" | Reprimand | "Today's plan is updated for the time you have" |
| "You're in the bottom 20%" | Punitive comparison | No peer comparison in V0/V1 at all |
| "Great job! 🎉 You opened the app!" | Hollow celebration | Say nothing |

**Permitted urgency** is urgency that is *true and consequential*: "7 days left · Starts Aug 6" is a real exam on a real date. Avora shows real deadlines plainly and never dramatises them.

### 6.3 Copy patterns to reuse `[DERIVED]`

| Pattern | Shape | Live example |
| --- | --- | --- |
| **Benefit subtitle** | One sentence stating what the student gets, not what the screen does | "Log in to pick up exactly where you left off this semester." |
| **Conditional forecast** | *Do X to reach Y* | "Complete Unit 3 Part A today to reach 81% readiness." |
| **Headroom statement** | Converts a constraint into remaining freedom | "You can skip 5 more classes safely" |
| **Scope declaration** | States exactly what the AI can see | "Studying: CS3402 · Unit 3 · using 3 resources" |
| **Reversibility promise** | Removes commitment fear at a decision point | "You can change any of this later." |
| **Duration promise** | Sets an honest expectation before effort | "We'll set everything up in just a couple of minutes." |

### 6.4 Two production strings requiring change `[OBSERVED]`

Recorded here because they are copy defects, not design defects, and both are single-line fixes. Full detail in §47.

1. **"AI trained on your uploaded resources"** (AI Tutor header) directly contradicts `NFR-043` and the public trust commitment in PRD §19.3 that student content is never used to train models. The mechanism being described is retrieval grounding, not training. **Recommended replacement: "Answers grounded in your uploaded resources."** This is also the more accurate and more differentiating claim.
2. **"Keep it alive today"** (Study Streak tile) is loss-framing under `RAI-06`, and a streak is an engagement mechanic under `RAI-07`. **Recommended replacement: retain the count as a neutral fact — "7 days · reviewed this week" — and remove the imperative.** The number is honest; the pressure is not.

---
## 7. Information Hierarchy

### 7.1 The four-tier model `[DERIVED]`

Every Avora surface organises content into exactly four tiers. The Dashboard demonstrates all four; every future screen should be expressible in them.

```
TIER 1  CONTEXT        Who and where          Identity header, scope strip
        ─────────────────────────────────────────────────────────────────
TIER 2  CONCLUSION     What matters now       Exam readiness, next best action
        ─────────────────────────────────────────────────────────────────
TIER 3  COMMITMENT     What I chose to do     Today's goal, continue learning
        ─────────────────────────────────────────────────────────────────
TIER 4  CORPUS         Everything I have      Subjects, classes, attendance, assignments
```

| Tier | Purpose | Type weight | Position | Density |
| --- | --- | --- | --- | --- |
| **1 — Context** | Orient without instructing | Largest type on the screen is the student's own name | Always first, always sticky where a scope can change | Minimal |
| **2 — Conclusion** | Give the answer to "what now" | Emphasis carried by figure size and the single accent | Immediately after Tier 1, above the fold | One card, one action |
| **3 — Commitment** | Show what is already in motion | Body weight, progress fractions | After Tier 2 | Lists of 3–5 |
| **4 — Corpus** | Make everything reachable | Uniform, scannable | Lower scroll | High, but strictly patterned |

**Rule IH-01 `[DERIVED]`.** Tier 2 is mandatory on every top-level surface and must be visible without scrolling on a 360 × 640 dp viewport. A surface with no conclusion to offer must render a Tier-2 *empty conclusion* (§28.3), never skip the tier. This is how `PRD §22.2` — "Home MUST answer *what should I do now* without requiring navigation" — is generalised beyond home.

**Rule IH-02 `[DERIVED]`.** Tiers never interleave. Once the surface has descended to Tier 4, it does not return to Tier 2. A second conclusion placed halfway down the scroll destroys the triage value of the whole model.

### 7.2 Within-tier ordering `[DERIVED]`

Tier 4 modules on the Dashboard are ordered: Subjects → Today's classes → Attendance → Assignments. The ordering principle is **decreasing agency**: things the student navigates into, then things happening to them today, then standing obligations, then dated obligations.

**Rule IH-03 `[RECOMMENDED]`.** Tier 4 modules order by: *navigable structure* → *time-bound today* → *standing state* → *dated obligations*. New modules find their place by that test rather than by recency of construction.

---

## 8. Information Architecture and Navigation

### 8.1 The state of play — an honest reconciliation `[OBSERVED]`

Three definitions of Avora's navigation currently exist, and they do not agree.

| PRD §22.1 primary surfaces | Dashboard (production) | Study Dashboard (production) |
| --- | --- | --- |
| Today | Home | Home |
| Subjects | Subjects | Subjects |
| Tutor | AI | AI |
| Study | — | — |
| Library | — | — |
| *(Planner is a feature of Today)* | Calendar | Planner |
| *(Profile is settings)* | Profile | Profile |

Three findings follow, and all three matter:

1. **Slot 4 is named differently in two production builds** — *Calendar* on the Dashboard, *Planner* on the Study Dashboard. This is straightforward token drift between two apps built at different times and must be resolved.
2. **The PRD's Study and Library surfaces have no tab.** Study functionality is reachable through Quick Actions (Flashcards, Generate Quiz, Study Session) and from within a subject. Library — unified search, `FR-110`–`FR-114` — has **no observable entry point at all** in the production Dashboard. Search is a V1 capability, so this is a sequencing gap rather than a defect, but it must be planned for now, because adding a sixth tab later is a far more disruptive change than reserving space for it today.
3. **Profile occupies a primary tab** although the PRD treats account and settings as secondary.

### 8.2 The resolution `[RECOMMENDED]`

The production navigation is approved and shipping, and it is not wrong — it is a five-slot mobile bar, which is the correct maximum for a thumb-reachable tab bar. The PRD's five surfaces are a *conceptual* model, not a mandate that all five appear as tabs. The resolution is therefore a mapping, not a redesign.

**Canonical navigation model — Avora Primary Navigation v1**

| Slot | Label | PRD surface served | Contents |
| --- | --- | --- | --- |
| 1 | **Home** | Today | Conclusion, plan, next action, today's classes, standing state |
| 2 | **Subjects** | Subjects | Subject list → structure tree → resources, notes, artefacts |
| 3 | **AI** | Tutor | Scoped conversation, history, scope switching |
| 4 | **Planner** | Today (planning half) + Academic Events | Calendar, timetable, plan, deadlines |
| 5 | **Profile** | *(Account)* | Account, privacy controls, storage, entitlements, AI settings |

**Recommendation N-01.** Standardise slot 4 as **Planner**, not Calendar. *Reasoning:* `FR-103`–`FR-107` define an adaptive Study Plan of which the calendar is one view; naming the tab after the view rather than the capability under-sells it and will read as inaccurate the moment planning ships. "Planner" also expresses agency ("something that plans for me") where "Calendar" expresses storage. This preserves both live implementations' visual design and changes one word in one of them.

**Recommendation N-02 — where Study lives.** Study (`FR-080`–`FR-098`) remains a *destination reached from context*, not a tab. Review and quiz are always scoped to a subject or unit; a global "Study" tab would force the student to re-declare scope they have already established. Entry points, all of which exist or are trivially added: Quick Actions on Home; the readiness figure on any Subject card; the Next Best Action card; and a due-review count on Home. **This is a deliberate architectural choice and should be recorded as such, not left as an accident of the current build.**

**Recommendation N-03 — where Library lives.** Search is the retrieval surface and must not be nested. Rather than a sixth tab, **search becomes a persistent affordance in the Home identity header and in every Subject header**, opening a full-screen search surface. *Reasoning:* search is invoked, not browsed; it has no resting state worth a tab; and a persistent header affordance costs zero navigation slots while satisfying `FR-110`'s promise of unified reach. This mirrors the treatment already given to Upload, which `PRD §22.1` requires to be globally available and never nested.

**Rule N-04 `[DERIVED from PRD §22.1]`.** **Upload is never a navigation destination.** It is a globally available action, present on every surface, and architecturally a persistent client service that survives navigation, backgrounding, and restart (`architecture.md` §7.1). Any design that places Upload inside a menu, a tab, or a subject-scoped screen is rejected.

### 8.3 Depth budget `[DERIVED from NFR-055, PRD §22.2]`

`NFR-055` caps any core workflow at three steps from home; `PRD §22.2` caps reaching any Resource at three interactions.

| Destination | Maximum interactions from Home | Canonical path |
| --- | --- | --- |
| Any Resource | 3 | Subjects → Subject → Resource |
| Start a scoped tutor conversation | 2 | AI → send (scope inherited) |
| Upload | 1 | Global upload action |
| Begin a review session | 2 | Home → Flashcards |
| Any Academic Event | 2 | Planner → Event |
| Search result | 2 | Search → result |

**Rule N-05.** Any new feature must declare its depth in this table before build. A feature that cannot fit the budget requires either a Home entry point or a redesign of its path — not an exception.

### 8.4 Structure rendering — the adaptivity rule `[OBSERVED from PRD §14.2]`

This is the most important interface constraint in Avora and the one most likely to be violated by a coding agent working from a screenshot.

The live Dashboard shows "Unit 3 · Part A". A naive reading is that Avora's hierarchy is Subject → Unit → Part. **It is not.** `FR-014` requires student-chosen type labels including Unit, Module, Chapter, Topic, Week, Experiment, Practical, Lab, Project and Program; `FR-020` requires fully custom labels; `FR-015` requires zero structure to be a valid state; `FR-016` requires at least three levels of nesting; `FR-017` requires different subjects to use different structure types simultaneously.

**Rule N-06 `[DERIVED]` — the structure-agnostic contract.** Every component that displays or navigates academic structure must satisfy all five:

| Requirement | Consequence for design |
| --- | --- |
| The label is data | No string literal "Unit" may appear in any component, illustration, empty state, or placeholder. The Meera persona's subject reads "Experiment 7" through the identical component. |
| Zero depth is valid | A subject with no structure renders resources directly under the subject header with no empty container, no "add your first unit" nag, and no visual implication that something is missing. |
| Depth is variable | Levels beyond the second use progressive disclosure (§24.3), never additional nested visual chrome. Indentation is capped; the breadcrumb carries depth instead. |
| Depth is mixed within a workspace | The Subjects list may not visually imply uniform structure. Subject cards show counts, not tree shapes. |
| Structure is mutable without loss | Rename, re-type, re-nest, split, and merge are first-class operations with their own confirmed states (`FR-018`). Each must state what is preserved: *"All 24 files, notes and flashcards move with it."* |

**The verification prompt for any structure-touching design or generated code:** *Does this still work for a Mechanical student whose subject contains Experiments 1–12 and no units at all?* If not, it is wrong.

---

## 9. Layout Philosophy and Grid

### 9.1 Philosophy `[DERIVED]`

Avora's layout is **a single vertical column of self-contained modules**. It is not a dashboard grid, and this is correct: a grid implies simultaneous comparison, whereas a student's semester is a priority-ordered list. The column reads as a sequence of decreasing urgency, which is exactly the mental model of an exam week.

Three consequences:

- **Modules are atomic.** A module is a titled section containing cards of one type. Modules never nest. A module either fits the column or is truncated with an "All" affordance — which is precisely what the live Subjects and Assignments modules do.
- **Horizontal scroll is permitted only inside a module, never for the page**, and only for peer items where order is not a ranking (Quick Actions, Suggested for you). A horizontally scrolling list must show a partial next item as a scroll affordance.
- **The column widens; it does not re-flow into a grid until the desktop breakpoint.** Preserving one column at tablet keeps the reading order identical across devices, which keeps the design system's cost linear rather than multiplicative.

### 9.2 The grid `[RECOMMENDED — VERIFY]`

| Property | Mobile (< 600 dp) | Tablet (600–1023 dp) | Desktop (≥ 1024 dp) |
| --- | --- | --- | --- |
| Columns | 4 | 8 | 12 |
| Gutter | 16 | 20 | 24 |
| Page margin | 16 | 24 | 32 |
| Content max-width | 100% | 720 | 1200 (shell), 760 (reading column) |
| Module vertical rhythm | 24 between modules | 28 | 32 |
| Card internal padding | 16 | 16 | 20 |

**Rule L-01.** The **reading column never exceeds 760 px** regardless of viewport. Notes, summaries, and tutor responses are long-form academic text; line length is a comprehension variable, and `NFR-054`'s plain-language requirement is undermined by 1,400 px lines. Chrome may span the viewport; prose may not.

**Rule L-02.** A card's internal padding never falls below 16 dp on mobile. Density is bought through consistency and typography (§7), never by compressing padding — compressed padding is the first thing that makes an interface feel cheap and the first thing that breaks the 44 dp touch minimum (§41.4).

### 9.3 Full-bleed posture `[DERIVED from OBSERVED]`

The Dashboard declares `apple-mobile-web-app-status-bar-style: black-translucent`, meaning the background runs edge-to-edge behind the system status bar.

**Rule L-03.** All Avora surfaces are full-bleed. The base background extends under the status bar and the home indicator. Content respects safe-area insets; background colour does not. Sticky headers and the bottom navigation must add the safe-area inset to their padding rather than to their height, so that the bar's *visual* height is constant across devices.

---

## 10. Responsive Strategy

### 10.1 Breakpoints `[RECOMMENDED — VERIFY]`

| Token | Range | Primary device | Design posture |
| --- | --- | --- | --- |
| `bp.compact` | 320–599 dp | Phone (design target: **360 × 640**) | Canonical. Everything is designed here first. |
| `bp.medium` | 600–1023 dp | Large phone landscape, small tablet | Same single column, wider margins, larger figures |
| `bp.expanded` | 1024–1439 dp | Tablet landscape, laptop | Persistent left rail replaces bottom bar; two-pane where a parent/child relationship exists |
| `bp.wide` | ≥ 1440 dp | Desktop | Three-pane maximum; content column still capped |

**360 × 640 dp is the canonical design surface.** Not 390. Not 393. The beachhead is mid-range Android in India (`PRD §5.2`, `NFR-052`), and a layout that only works at 390 will break for a meaningful share of the target market on their first session. Every component in §19–§27 is specified at 360 first.

### 10.2 Mobile-first guidelines `[DERIVED]`

1. **Thumb zones govern placement.** Primary actions sit in the lower third. Destructive actions never sit in the lower third and never sit adjacent to a primary action.
2. **The bottom navigation is fixed and always visible** except in three modes: an open bottom sheet, a full-screen focus mode (review session, quiz in progress, camera capture), and the tutor composer when the keyboard is raised.
3. **The tutor composer docks above the keyboard** and the scope strip stays attached to it. A student must never lose sight of what the AI can see while typing (§30.3).
4. **Sticky headers collapse rather than disappear.** On scroll, the identity header reduces to a single line carrying the surface name and any active scope. Losing the scope on scroll is a correctness problem in an AI product, not a polish problem.
5. **Nothing depends on hover.** Every hover affordance has a tap equivalent and a persistent visual state.
6. **Long lists paginate or virtualise.** `NFR-020` requires 500 resources and `NFR-052` requires low-end devices; a fully rendered 500-row list satisfies neither.

### 10.3 Tablet guidelines `[RECOMMENDED]`

- Single column is retained through `bp.medium`. Widening the margin is the entire responsive change. Resist two-column temptation: it doubles the layout surface area for a device class that is a minority of the beachhead.
- At `bp.expanded`, adopt **two-pane master/detail** where and only where a genuine parent/child relationship exists: Subjects ↔ Subject detail; Library results ↔ result preview; Planner ↔ day detail.
- The AI Tutor does **not** become two-pane. Conversation is a focus surface; a persistent sidebar next to it invites context-switching during the one activity that most requires attention. History opens as an overlay.

### 10.4 Desktop guidelines `[RECOMMENDED]`

Desktop is an enhancement (`PR-07`), and it earns its existence through three jobs the phone does badly: long-form note editing, bulk upload and re-filing, and side-by-side reading of a resource with the tutor.

| Change | Detail |
| --- | --- |
| Navigation | Bottom bar → persistent left rail, same five destinations, same order, same icons, labels always visible |
| Upload | Becomes a page-level drop target in addition to the global action; drag-and-drop with a full-surface drop overlay |
| Tutor | Optional split view: resource on the left, conversation on the right, citations cross-highlighting between them |
| Notes | Full editing surface with the 760 px reading column centred |
| Keyboard | Full command surface (§41.5) — this is where the Karthik persona's bulk-organisation work happens |

**Rule R-01.** No capability may be desktop-only. `NFR-050` requires every core workflow to be completable on mobile. Desktop may make a workflow *faster*; it may never be the only place it exists.

---
## 11. Design Token Architecture

### 11.1 Why tokens are the centre of this system

`architecture.md` §6 and §32 establish that Avora ships **two UI implementations** — shadcn/ui + Tailwind on web, NativeWind primitives on mobile — both driven from a single `packages/design-tokens/`. That is not an implementation detail; it is the single most important constraint on this design system.

Two consequences are binding:

1. **No design decision may be expressible only in one platform's idiom.** Anything specified as a raw CSS technique that has no React Native equivalent will silently diverge between web and mobile. Every token in this document is a value, not a technique.
2. **Tokens are the only legal source of visual values.** A component that hard-codes a colour, a radius, a duration, or a font size is a defect regardless of whether it looks correct. This is also the mechanism by which `NFR-051` is satisfied structurally: per `architecture.md` §7.5, *contrast ratios are properties of the token set, not per-component decisions*.

### 11.2 The three token tiers `[RECOMMENDED]`

| Tier | Name | Example | Who may reference it |
| --- | --- | --- | --- |
| **1 — Primitive** | Raw values, theme-agnostic, no meaning | `blue.400`, `space.4`, `radius.lg` | Semantic tokens only. **Never referenced by a component.** |
| **2 — Semantic** | Role-bearing, theme-aware | `surface.raised`, `text.secondary`, `accent.default`, `border.subtle` | Primitives and components |
| **3 — Component** | Bound to one component's part and state | `button.primary.bg.hover`, `nav.item.active.fg` | That component only |

**Rule T-01.** A component never references a Tier 1 token. This is what makes a light theme (§12.7) a token-file change rather than a codebase change, and it is the reason Avora can afford to ship dark-only today without foreclosing light tomorrow.

### 11.3 Naming convention `[RECOMMENDED]`

`category.role.variant.state` — lowercase, dot-delimited, singular nouns.

| Correct | Incorrect | Why |
| --- | --- | --- |
| `surface.raised` | `bg-gray-900` | Names the role, not the value |
| `text.secondary` | `text.muted-2` | Roles are ordinal and meaningful |
| `accent.default` | `brand.blue` | Survives a hue change |
| `feedback.danger.fg` | `red.text` | Semantic, not chromatic |
| `ai.provenance.accent` | `purple.500` | Names the meaning that must never drift |

**Rule T-02.** Token names must survive a rebrand. If changing the accent hue would make the token name a lie, the name is wrong.

---

## 12. Colour

### 12.1 Colour philosophy `[DERIVED]`

Avora's colour strategy is **near-monochrome with one accent, plus a strictly rationed semantic set.**

This is not minimalism for its own sake. Three arguments support it, and any future proposal to broaden the palette must answer all three:

1. **On a dark canvas, colour is loud.** Against `#080D11`, a saturated hue at 40 dp² carries more attentional weight than the same swatch would across an entire light-themed screen. Scarcity is what makes the accent function as an instruction.
2. **The Dashboard carries eight modules on one scroll.** If modules were colour-coded, the screen would become a legend to be learned. Uniform surfaces with a single accent mean the student's eye goes to the one thing Avora is recommending — which is the entire proposition of `PR-09`.
3. **Colour must never be the only carrier of meaning** (`NFR-051`, WCAG 1.4.1). A rationed palette makes that discipline cheap to maintain; a rich one makes it a constant fight.

**Rule C-01 — the accent budget.** At most **one accent-filled element per viewport**. The accent marks: the single primary action, the active navigation item, the live progress indicator, and focus. Nothing else. If two things on screen are accented, one of them is wrong.

**Rule C-02 — colour is never the sole signal.** Every state distinguished by colour must also be distinguished by icon, text, weight, or position. Verify by rendering greyscale.

### 12.2 Confirmed values `[OBSERVED]`

| Token | Value | Evidence |
| --- | --- | --- |
| `surface.base` | `#080D11` | Theme colour on Authentication, Onboarding, Study Dashboard, AI Tutor |
| *(variant in production)* | `#0A0D10` | Theme colour on Dashboard — **drift, see VB-01 / §47 RE-03** |
| Colour scheme | `dark` | Declared on all five surfaces |

### 12.3 Surface ramp `[RECOMMENDED — VERIFY]`

Elevation on a dark canvas is communicated by **lightness and hairline borders, not by shadow** (§16.1). The ramp must therefore be legible at small steps.

| Token | Proposed | Role |
| --- | --- | --- |
| `surface.sunken` | `#05090C` | Inset wells: input fields at rest, code blocks, track behind a progress bar |
| `surface.base` | `#080D11` | The page. Extends under status bar and home indicator. |
| `surface.raised` | `#0E151B` | Cards, list rows, modules — the default container |
| `surface.overlay` | `#151E26` | Bottom sheets, dialogs, popovers, menus, tooltips |
| `surface.inverse` | `#E9EFF5` | Rare. Inverse chips and dark-on-light labels. |
| `border.subtle` | `#1B2630` | Card edges, dividers between list rows |
| `border.default` | `#24313D` | Input borders at rest, chip outlines |
| `border.strong` | `#35485A` | Hover and selected borders, active outlines |

**Rule C-03.** Never stack more than three surface levels. `base → raised → overlay` is the whole system. A card inside a card inside a sheet is a hierarchy failure, not a depth opportunity.

### 12.4 Text ramp `[RECOMMENDED — VERIFY]`

Contrast ratios below are computed against `surface.base` `#080D11` for the proposed values.

| Token | Proposed | Contrast on base | Role |
| --- | --- | --- | --- |
| `text.primary` | `#E9EFF5` | **16.9 : 1** | Titles, figures, body copy, the student's name |
| `text.secondary` | `#9EB0C0` | **8.8 : 1** | Metadata lines (D1), subtitles, supporting copy |
| `text.tertiary` | `#6B7E8F` | **4.7 : 1** | Eyebrows, timestamps, captions, placeholder text |
| `text.disabled` | `#4A5A68` | 2.8 : 1 | Disabled control labels only — **never** for content |

**Rule C-04.** `text.tertiary` is the floor for any text a student must read. It passes AA at 4.7:1 with almost no margin, so it may not be used below `type.body-sm` (14 sp) and may not be used on `surface.raised` or `surface.overlay` without re-verification — a lighter background reduces its ratio.

**Rule C-05.** `text.disabled` is exempt from contrast minimums under WCAG only because it marks inactive controls. It must never carry information. A disabled state that hides information is a design failure; explain *why* it is disabled in `text.secondary` adjacent to it (§28.7).

### 12.5 Accent and semantic colours `[RECOMMENDED — VERIFY]`

| Token | Proposed | Contrast on base | Role and rules |
| --- | --- | --- | --- |
| `accent.default` | `#4DA3FF` | 7.4 : 1 | The one accent. Primary action fill, active nav, live progress, focus ring. |
| `accent.fg` | `#060B0F` | 7.4 : 1 on accent | **Label colour on an accent fill is near-black, not white.** White on `accent.default` measures ~2.6 : 1 and fails. |
| `accent.subtle` | `accent` @ 12% over base | — | Selected-row wash, active chip background |
| `accent.border` | `accent` @ 40% | — | Selected borders |
| `feedback.success` | `#3ECF8E` | 9.8 : 1 | Completed, correct, synced, all clear |
| `feedback.warning` | `#F5B546` | 10.8 : 1 | Partial extraction, below threshold, approaching a limit |
| `feedback.danger` | `#FF6B6B` | 7.3 : 1 | Failed, overdue, destructive confirmation |
| `feedback.info` | `accent.default` | 7.4 : 1 | Deliberately shares the accent — Avora has no separate "info" identity |
| `ai.provenance` | `#A98BFF` | 7.3 : 1 | **Reserved exclusively for AI-generated provenance.** See rule C-06. |

**Rule C-06 — the AI provenance colour is reserved.** `FR-143`, `AIR-010` and `RAI-01` require AI-generated content to be identified *wherever it appears, including on export*. A dedicated, never-reused hue makes that identification learnable in one exposure and unambiguous thereafter. `ai.provenance` may not be used for decoration, for a second accent, for a chart series, or for any non-AI state. This is the strictest colour rule in the system.

**Rule C-07 — semantic colours are for states, not categories.** Subjects, structure units, and tags are **not** colour-coded. They are identified by their monogram (§27.2) and their name. Colour-coding categories does not scale past about seven items, collides with the semantic set, and breaks for colour-blind students. `NFR-020` requires ten subjects; the system must not fail at eight.

### 12.6 Dark theme — the canonical theme `[OBSERVED]`

Dark is not a mode in Avora; it is the identity. All five production surfaces declare it, and the `black-translucent` status bar confirms the design assumes it.

| Rule | Detail |
| --- | --- |
| **Pure black is prohibited** | `#000000` on OLED produces smearing on scroll and a harsh boundary against raised surfaces. `#080D11` is correct and must not be "simplified" to black. |
| **Pure white is prohibited** | `#FFFFFF` at 21:1 against near-black causes halation and afterimage in the low-light conditions this theme targets. `text.primary` at 16.9:1 is the ceiling. |
| **Saturation falls as lightness falls** | Dark surfaces carry the blue cast at low saturation. Vivid dark surfaces read as coloured chrome and destroy the calm. |
| **Elevation lightens** | Higher surfaces are lighter, never darker. This is the only elevation cue on mobile (§16.1). |
| **Imagery needs a scrim** | Any student-supplied thumbnail placed under text carries a bottom-up gradient scrim to `surface.base` at 80%. Uploaded material is unpredictable; contrast may not be. |

### 12.7 Light theme `[RECOMMENDED]`

**Current standard:** no light theme is observable in production, and `color-scheme: dark` is declared unconditionally. Avora is dark-only today.

**Recommended evolution:** ship light as a *token file*, not as a redesign, and only when a real need is evidenced. The need is real but not urgent: students read printed material under bright light and study in daylight libraries, and `PR-11` (accessibility) includes students for whom dark-on-light is more readable, including some with astigmatism.

**Preconditions before a light theme may ship:**

| # | Precondition |
| --- | --- |
| 1 | Every component references only Tier 2 semantic tokens (Rule T-01). Verified by lint. |
| 2 | Light theme mirrors the *roles*, and inverts the *ramp direction*: `surface.base` becomes the lightest, `surface.raised` slightly darker or separated by a stronger border — because on light backgrounds elevation reads as shadow, not as lightness (§16.1). |
| 3 | The accent is **re-derived, not reused.** `#4DA3FF` at 7.4:1 on near-black will measure ~2.3:1 on near-white and fail everywhere. A darker accent variant is required for light. |
| 4 | `ai.provenance` is re-derived under the same constraint and remains exclusive. |
| 5 | All contrast pairs re-verified in CI, not assumed. |
| 6 | Theme switching (§44.1) follows system preference by default with a manual override, persists per account, and applies without a reload or a flash of the wrong theme. |

**Recommendation:** do not build light for V0 or V1. Build the *token discipline* that makes it a two-day task, and revisit when accessibility feedback or daylight-usage data justifies it.

---
## 13. Typography

### 13.1 Typographic philosophy `[DERIVED]`

Avora's screens are almost entirely type. There is very little imagery, no illustration in the production interfaces, and one accent colour. Typography is therefore carrying the whole hierarchy, and it does so through **three devices only**: size, weight, and colour role. Not through italics, not through decorative faces, not through case (except the eyebrow), and not through borders.

Two observations from production drive the whole system:

- **The student's own name is the largest text on the Dashboard** — larger than the exam name, larger than any figure. That is a deliberate and correct statement of ownership (§2, "a room, not a machine").
- **Data is the second-largest** — `68%`, `72`, `79%`, `64%`. Figures are display elements in Avora, not body text, and they need their own scale steps and tabular alignment.

### 13.2 Typefaces `[RECOMMENDED — VERIFY]`

The production stack (Next.js + shadcn/ui, per `architecture.md` §6) makes a modern geometric-humanist grotesque overwhelmingly likely, but the specific family was not verifiable. **VB-05 must confirm it.** The *role structure* below is binding regardless of which family is confirmed.

| Role | Requirement | Used for |
| --- | --- | --- |
| **UI / Display** | One geometric-humanist sans, weights 400–700, with genuine tabular-lining numerals and a distinguishable `1 / l / I` and `0 / O` | Everything. Headlines, body, labels. |
| **Numeric** | The same family, **tabular figures enabled** | Every figure, percentage, count, duration, and time. Non-negotiable — see Rule TY-01. |
| **Mono** | One monospace with clear zero and unambiguous brackets | Code (`FR-058`), file names, structure codes such as `CS3402` |
| **Math** | A math-capable renderer with a serif math face | Mathematical notation (`FR-058`). The beachhead is engineering; formulae are the highest-value content in the corpus. |

**Rule TY-01 — tabular figures everywhere numbers change.** Readiness percentages, countdowns, durations, attendance fractions, and quiz scores all update in place. Proportional figures cause horizontal jitter on every tick, which reads as instability in a product whose core claim is competence. Tabular figures are mandatory in every context where a number can change or where numbers stack vertically in a list.

**Rule TY-02 — one family.** Avora does not pair a display face with a body face. A second family would add personality the brand does not want (§4.1: *calm, not sedate*) and would double the font payload on the mid-range Android devices `NFR-052` protects.

### 13.3 Type scale `[RECOMMENDED — VERIFY]`

Specified at `bp.compact` (360 dp). Sizes in sp/px; line heights absolute; tracking in em.

| Token | Size / Line | Weight | Tracking | Role |
| --- | --- | --- | --- | --- |
| `type.display-lg` | 32 / 38 | 600 | −0.02 | Welcome and onboarding headlines only |
| `type.display` | 28 / 34 | 600 | −0.02 | The student's name in the identity header |
| `type.title-lg` | 22 / 28 | 600 | −0.01 | Card titles that are the subject of the card (*Mid 1*) |
| `type.title` | 18 / 24 | 600 | −0.01 | Module headings (*Subjects*, *Today's classes*) |
| `type.title-sm` | 16 / 22 | 600 | 0 | List row titles, subject names |
| `type.body-lg` | 16 / 24 | 400 | 0 | Long-form reading: notes, summaries, tutor responses |
| `type.body` | 15 / 22 | 400 | 0 | Default interface copy |
| `type.body-sm` | 14 / 20 | 400 | 0 | Supporting copy, secondary lines in list rows |
| `type.label` | 13 / 18 | 500 | +0.01 | Buttons, chips, tabs, form labels |
| `type.caption` | 12 / 16 | 400 | +0.02 | Metadata lines (D1), timestamps, counts |
| `type.eyebrow` | 11 / 14 | 600 | +0.06 | **Uppercase.** The category label above a card title (D2) |
| `type.figure-xl` | 40 / 44 | 600 | −0.03 | The single hero figure on a surface (*68%*) |
| `type.figure` | 28 / 32 | 600 | −0.02 | Stat tile figures, subject readiness |
| `type.figure-sm` | 18 / 22 | 600 | −0.01 | Inline figures inside list rows |

**Rule TY-03 — the eyebrow is the only uppercase.** Uppercase is slower to read and is reserved for the one element whose job is *categorisation rather than reading* (D2). Buttons, labels, tabs, and headings are sentence case (§6.1).

**Rule TY-04 — 14 sp is the content floor.** No text a student is expected to read may fall below `type.body-sm`. `type.caption` and `type.eyebrow` are permitted below it only because they carry metadata that is also available elsewhere. If a layout only fits by shrinking type, the layout is wrong (`DP-07`).

**Rule TY-05 — 16 sp minimum on all text inputs.** iOS Safari auto-zooms any input below 16 px. That auto-zoom is the reason production currently disables zoom entirely — which is the accessibility defect in §47 RE-02. Setting inputs to 16 sp removes the cause and lets the lock be removed.

### 13.4 Responsive type `[RECOMMENDED]`

| Token group | compact | medium | expanded / wide |
| --- | --- | --- | --- |
| Display | as specified | +2 | +4 |
| Titles | as specified | +1 | +2 |
| Body and below | **unchanged** | unchanged | unchanged |
| Figures | as specified | +4 | +8 |

Body text does not grow with the viewport. A larger screen means a wider margin and a longer reading column (capped at 760 px, Rule L-01), not larger prose. Growing body text on desktop is a common mistake that makes long-form notes fatiguing.

### 13.5 Long-form reading `[RECOMMENDED]`

Notes, summaries, and tutor responses are the one place Avora is a reading application. Rules for that context:

| Property | Value |
| --- | --- |
| Base | `type.body-lg` (16 / 24) |
| Measure | 60–75 characters; hard cap 760 px |
| Paragraph spacing | `space.4` (16), not a first-line indent |
| Heading spacing | `space.6` above, `space.2` below |
| List item spacing | `space.2` |
| Emphasis | Weight 600 in `text.primary`. **Never colour-only**, never italic for emphasis (italics degrade in the small sizes and mixed-script content the target market produces). |
| Key term highlight (`FR-077`) | `text.primary` weight 600 with a `surface.raised` background wash — never the accent, which is reserved (Rule C-01) |
| Math and code | Never wraps mid-expression; horizontally scrollable in its own container with a visible edge fade |

---

## 14. Spacing and Sizing

### 14.1 Spacing scale `[RECOMMENDED — VERIFY]`

Base unit **4**. A 4-unit base is correct for a product whose canonical viewport is 360 dp — an 8-unit base forces either wasteful padding or off-grid exceptions at that width.

| Token | Value | Primary use |
| --- | --- | --- |
| `space.0` | 0 | Reset |
| `space.1` | 4 | Icon-to-label, chip internal vertical |
| `space.2` | 8 | Between a title and its metadata line; chip horizontal |
| `space.3` | 12 | Between related rows inside a card |
| `space.4` | 16 | **Default.** Card padding, page margin, gap between cards |
| `space.5` | 20 | Card padding at `bp.expanded` |
| `space.6` | 24 | Between modules |
| `space.8` | 32 | Between major sections; above a page's first module |
| `space.10` | 40 | Sheet top padding |
| `space.12` | 48 | Empty-state vertical padding |
| `space.16` | 64 | Bottom scroll padding above the navigation bar |

**Rule SP-01 — spacing encodes relationship.** Elements `space.2` apart are one thought. `space.4` apart are peers in a container. `space.6` apart are different subjects. A student should be able to parse the grouping of a screen with the type blurred out. Where a layout looks wrong, the fix is almost always a relationship error, not a value error.

**Rule SP-02 — the bottom scroll buffer is mandatory.** Every scrollable surface ends with `space.16` plus the safe-area inset plus the navigation bar height. Content ending flush against a fixed bottom bar reads as truncated and hides the last row under the bar on short screens.

### 14.2 Sizing scale `[RECOMMENDED — VERIFY]`

| Token | Value | Use |
| --- | --- | --- |
| `size.touch.min` | **44 × 44** | Absolute minimum interactive target (§41.4) |
| `size.control.sm` | 32 height | Chips, filter pills, inline controls |
| `size.control.md` | 40 height | Default buttons, inputs, select fields |
| `size.control.lg` | 48 height | Primary actions, composer send, thumb-zone controls |
| `size.icon.sm` | 16 | Inline with `type.caption` and `type.label` |
| `size.icon.md` | 20 | **Default.** Buttons, list rows, metadata |
| `size.icon.lg` | 24 | Navigation bar, headers, empty states |
| `size.avatar.sm` | 24 | Inline attribution |
| `size.avatar.md` | 32 | Identity header |
| `size.avatar.lg` | 56 | Profile surface |
| `size.nav.height` | 56 + safe-area inset | Bottom navigation |
| `size.header.height` | 56 collapsed / auto expanded | Sticky header |

**Rule SZ-01.** A control smaller than 44 dp must carry an invisible 44 dp hit area. `size.control.sm` at 32 dp height is legal *visually* and illegal *interactively* without padding. This is the most commonly violated accessibility rule in dense interfaces and the one most worth enforcing at the primitive layer, where `architecture.md` §7.4 places it.

---

## 15. Border Radius

### 15.1 Scale `[RECOMMENDED — VERIFY]`

| Token | Value | Applied to |
| --- | --- | --- |
| `radius.xs` | 6 | Badges, inline tags, small indicators |
| `radius.sm` | 8 | Chips, filter pills, inputs, small buttons |
| `radius.md` | 12 | Buttons, list rows, stat tiles, nested containers |
| `radius.lg` | 16 | **Default card radius.** Modules, cards, suggestion cards |
| `radius.xl` | 20 | Hero cards, prominent containers |
| `radius.2xl` | 28 | Bottom sheets and dialogs (top corners) |
| `radius.full` | 999 | Avatars, monograms, progress tracks, toggle knobs, scope strip |

### 15.2 Rules `[DERIVED]`

**Rule RD-01 — nested radius decreases.** A child inside a `radius.lg` card uses `radius.md` or smaller. Equal radii on nested containers make the corners visually collide; a larger child radius is always wrong.

**Rule RD-02 — full radius is reserved for two meanings.** Either *this is a person or an identity* (avatars, subject monograms) or *this is a continuous quantity* (progress tracks, sliders, toggles). A fully-rounded button in Avora would read as a pill-shaped chip and dilute both meanings.

**Rule RD-03 — radius is constant across breakpoints.** A card is `radius.lg` at 360 dp and at 1440 px. Scaling radius with viewport makes the same component look like two components.

---

## 16. Elevation, Shadow, and Glass

### 16.1 The elevation model — lightness, not shadow `[DERIVED]`

This is the most important and most frequently violated rule in dark interfaces.

On a near-black canvas, a drop shadow is nearly invisible: there is no lighter ground for the shadow to darken. Attempting elevation with shadow on `#080D11` produces either an imperceptible effect or, when compensated for, a heavy dark halo that reads as smudge. **Avora expresses elevation as surface lightness plus a hairline border.**

| Level | Surface | Border | Shadow | Used for |
| --- | --- | --- | --- | --- |
| **E0 — Page** | `surface.base` | none | none | The canvas |
| **E1 — Raised** | `surface.raised` | `border.subtle` 1 px | none | Cards, list rows, modules, stat tiles |
| **E2 — Sticky** | `surface.base` @ 80% + blur | `border.subtle` on the leading edge only | none | Sticky headers, bottom navigation, docked composer |
| **E3 — Overlay** | `surface.overlay` | `border.default` 1 px | `shadow.overlay` | Sheets, dialogs, popovers, menus |
| **E4 — Transient** | `surface.overlay` | `border.default` 1 px | `shadow.overlay` | Toasts, tooltips, drag ghosts |

**Rule EL-01.** Shadow is used **only at E3 and E4**, and only because those layers must read as detached from a scrolling surface behind them. It is never used on cards. A shadowed card in Avora is a defect.

**Rule EL-02.** `shadow.overlay` `[RECOMMENDED — VERIFY]`: a two-part shadow — a tight `0 1 2 rgba(0,0,0,0.4)` contact shadow and a diffuse `0 16 40 rgba(0,0,0,0.5)` — combined with a **scrim** behind the layer (`#000000` at 60%). On dark surfaces the scrim, not the shadow, does most of the separation work.

**Rule EL-03.** Elevation is never animated as a *change of level*. A card does not lift on press; it changes surface (§17.4). Level changes belong to entering and exiting overlays only.

### 16.2 Glassmorphism `[RECOMMENDED]`

Backdrop blur is expensive on the mid-range Android devices `NFR-052` protects, and it reduces contrast for text placed over it — a direct tension with `NFR-051`. It is also, currently, unverified in the production build (VB-08). Avora therefore adopts a deliberately narrow position.

**Glass is chrome, never content.**

| Permitted | Prohibited |
| --- | --- |
| Bottom navigation bar | Cards of any kind |
| Sticky collapsed header | Modules and list rows |
| Docked tutor composer and its scope strip | Bottom sheets and dialogs (use opaque `surface.overlay`) |
| Bottom-sheet grabber region | Toasts |
| Floating scope indicator | Any surface carrying long-form reading |

**Specification for permitted glass `[RECOMMENDED — VERIFY]`:**

| Property | Value | Reason |
| --- | --- | --- |
| Backdrop blur | 20–24 | Below 20 the effect is illegible; above 24 the cost rises with no perceptual gain |
| Background | `surface.base` at 80% opacity | 80% keeps text on the bar above 4.5:1 against arbitrary scrolling content |
| Border | 1 px `border.subtle` on the leading edge only | The blur alone does not separate the layer; the hairline does |
| Saturation boost | none | Saturated glass tints scrolling content and breaks the calm |
| Low-end fallback | Opaque `surface.base` at 100%, no blur, same border | Detected by device capability, not by user setting |

**Rule GL-01.** Every glass surface must have an opaque fallback that is visually acceptable on its own. If the design only works with blur, it is not a glass treatment — it is a dependency.

**Rule GL-02.** No text on a glass surface may be smaller than `type.label` (13 sp) or lighter than `text.secondary`. Blur reduces effective contrast unpredictably because the underlying content is arbitrary student material.

---

## 17. Motion

### 17.1 Motion philosophy `[DERIVED]`

Avora's brand is *calm* (§4.1) and its performance budget is a mid-range phone (`NFR-001`, `NFR-052`). Both point the same way: **motion exists to explain a change, never to decorate one.**

Four permitted purposes. Anything outside them is removed.

| Purpose | Example |
| --- | --- |
| **Continuity** — showing where a thing came from or went | A card expanding into a detail surface |
| **Status** — showing that work is happening | Streaming text, upload progress, skeleton shimmer |
| **Attention** — directing to a change the student did not cause | A toast entering, a new insight appearing |
| **Feedback** — confirming input was received within 100 ms (`NFR-002`) | Press state, ripple-free surface change |

Prohibited: entrance animations on page load, staggered list reveals, parallax, decorative loops, bounce and elastic easing, anything that delays interactivity, and celebration animations (which also violate `RAI-07`).

### 17.2 Duration scale `[RECOMMENDED — VERIFY]`

| Token | Value | Use |
| --- | --- | --- |
| `motion.instant` | 80 ms | Press and release feedback, checkbox, toggle knob |
| `motion.fast` | 140 ms | Hover, focus ring, chip selection, colour transitions |
| `motion.base` | 200 ms | **Default.** Expand/collapse, tab change, list item insert |
| `motion.slow` | 280 ms | Bottom sheet, dialog, page transition |
| `motion.deliberate` | 400 ms | Full-screen transitions, camera capture confirmation |

**Rule M-01.** Nothing exceeds 400 ms. `NFR-002` requires perceptible response within 100 ms; a 600 ms transition on a phone in exam week is not elegance, it is latency wearing a costume.

### 17.3 Easing `[RECOMMENDED — VERIFY]`

| Token | Curve | Use |
| --- | --- | --- |
| `ease.standard` | `cubic-bezier(0.2, 0, 0, 1)` | Default. Both-ends transitions, colour, transform |
| `ease.enter` | `cubic-bezier(0, 0, 0, 1)` | Elements entering — fast start, soft settle |
| `ease.exit` | `cubic-bezier(0.3, 0, 1, 1)` | Elements leaving — exits are faster than entrances |
| `ease.linear` | `linear` | Progress bars, streaming indicators, spinners only |

**Rule M-02 — exits are faster than entrances.** Exit at `motion.fast`, enter at `motion.base`. A slow dismissal feels like the interface arguing with the student.

### 17.4 Micro-interactions `[RECOMMENDED]`

| Interaction | Specification |
| --- | --- |
| **Press** | Surface steps one level lighter (E1 → E2 equivalent) over `motion.instant`. Scale ≤ 0.98, and only on cards, never on buttons — button scale reads as toy-like. |
| **Focus** | 2 px `accent.default` ring at 2 px offset, `motion.fast`, no fade-out on blur (§41.3) |
| **Checkbox** | Fill then check-mark draw, 80 ms + 80 ms sequential |
| **Progress figure change** | Number counts to its new value over `motion.base` with tabular figures (Rule TY-01); the ring or bar animates simultaneously |
| **Streaming AI text** | Token-by-token append with a soft caret. **Never** a typewriter delay on already-received text — that is fake latency and violates `NFR-003`'s intent. |
| **List insert / remove** | Height and opacity over `motion.base`; neighbours shift with `ease.standard` |
| **Bottom sheet** | Enters over `motion.slow` with `ease.enter`; scrim fades over `motion.base`; drag-to-dismiss tracks the finger 1:1 with no easing |
| **Pull to refresh** | Indicator tracks the finger; release triggers a spinner at `ease.linear` |
| **Scope change in tutor** | The scope strip cross-fades and a divider is inserted into the conversation (`architecture.md` §18.1) — the change must be *visible in the transcript*, not only in the chrome |

### 17.5 Reduced motion `[RECOMMENDED]`

**Rule M-03.** When the platform reports a reduced-motion preference, all transform and scale animation is replaced by an opacity cross-fade at `motion.fast`. Three things are **retained** because they carry information rather than decoration: progress indication, streaming text append, and skeleton-to-content replacement. Removing those would remove status, not motion.

---
## 18. Component Philosophy

### 18.1 The three layers `[OBSERVED from architecture.md §7.4]`

The architecture already fixes the component model. This document specifies the design contract for each layer.

| Layer | Contents | Design obligation |
| --- | --- | --- |
| **1 — Primitives** | Button, Input, Card, Sheet, Chip, Badge, Tabs, List, Toast, Tooltip, Skeleton, Avatar, ProgressRing, Icon | Accessibility is satisfied **here** — contrast, 44 dp targets, focus, screen-reader semantics — and inherited everywhere. Never re-solved per feature. |
| **2 — Domain components** | `StructureTree`, `ResourceCard`, `CitationChip`, `AIGeneratedBadge`, `ProcessingState`, `MasteryMeter`, `ConfidenceIndicator`, `SubjectCard`, `InsightCard`, `ScopeStrip`, `EvidenceLine`, `ReadinessRing` | These are the **enforcement points** for PRD rules. Their props make violations impossible rather than discouraged. |
| **3 — Surface compositions** | Screens | Assembled from domain components only. A screen containing a raw primitive is a smell: it means a domain pattern was invented locally instead of promoted. |

### 18.2 Enforced-by-component design contracts `[OBSERVED from architecture.md §7.4]`

The architecture specifies that certain PRD rules are structurally enforced. Their *visual* contracts are specified here:

| Rule | Component | Design contract |
| --- | --- | --- |
| AI content labelled everywhere (`FR-143`, `AIR-010`, `RAI-01`) | `AIGeneratedBadge` | Required on any artefact with AI provenance. Uses `ai.provenance` (Rule C-06). Persists into export. §31.2 |
| Citations resolvable, never fabricated (`AIR-002`, `AIR-006`) | `CitationChip` | Accepts only a resolved citation with a real locator. Has no free-text variant. §31.3 |
| Confidence visible with one-action correction (`FR-039`) | `ResourceCard` | `confidence` is a required prop; a correction affordance renders whenever confidence is below the ask-threshold. §36.4 |
| Failures honest, paired with recovery (`NFR-014`) | `ErrorState` | `recoveryAction` is a required prop. **There is no error component without one.** §28.6 |
| No shaming or manufactured urgency (`FR-125`, `RAI-06`) | Progress and insight components | Copy comes only from the reviewed content catalogue (§6). §27 |

**Rule CP-01 — promotion over duplication.** A pattern used on two surfaces becomes a domain component before it is used on a third. Avora's consistency comes from a small component set used often, not a large one used once each.

**Rule CP-02 — components own their states.** Every component ships with all applicable states from §28 defined at design time: default, hover, focus, active, disabled, loading, empty, error, offline. A component delivered with only a default state is not delivered.

### 18.3 Naming convention `[RECOMMENDED]`

`<Domain><Object><Type>` — PascalCase, no abbreviations, no `Avora` prefix.

| Correct | Incorrect | Reason |
| --- | --- | --- |
| `SubjectCard` | `SubjCard`, `CourseCard` | `Subject` is the PRD's term (§14.1). `Course` is not. |
| `StructureUnitRow` | `UnitRow`, `FolderRow` | `Unit` is a *label*, not a type (Rule N-06). `Folder` is prohibited vocabulary. |
| `ResourceUploadSheet` | `FileUploadModal` | `Resource` not `File`; `Sheet` not `Modal` on mobile. |
| `MasteryMeter` | `ScoreBar` | `Mastery Signal` is guidance, not a grade (`FR-121`). |
| `CitationChip` | `SourceTag` | Matches the architecture's mandated component name. |

**Rule CP-03 — the PRD glossary is the naming authority**, matching `architecture.md` §32.1 rule 2. `structure_unit` not `folder`; `resource` not `file`; `mastery_signal` not `score`. Divergence between component vocabulary and product vocabulary is how product decisions get quietly reinterpreted. **This applies to visible labels as well as component names** — see §47 RE-06, where production currently shows "24 files".

### 18.4 Iconography `[RECOMMENDED — VERIFY]`

| Property | Specification |
| --- | --- |
| Style | Outline, geometric, uniform stroke. Never filled except to indicate an active navigation state. |
| Stroke | 1.5 px at 20 dp; 2 px at 24 dp. Constant optical weight across sizes. |
| Grid | 24 with a 20 live area |
| Corner treatment | Rounded joins and caps, matching `radius.xs` at icon scale |
| Colour | Inherits `text.secondary` at rest, `text.primary` when active, `accent.default` only when the item is the single accented element (Rule C-01) |
| Library | Single library, no mixing. VB-11 to confirm the library in use. |

**Rule IC-01 — icons never travel alone in navigation or primary actions.** Bottom navigation items carry labels. Quick Actions carry labels. Icon-only controls are permitted only where the icon is universal *and* the control has an accessible name: close, back, search, more, notifications. Every icon-only control has a tooltip on pointer devices and an accessible label always.

**Rule IC-02 — one metaphor per concept, forever.** Upload is one icon everywhere in the product. Flashcards are one icon. A concept with two icons is two concepts to the student.

### 18.5 Illustration `[RECOMMENDED]`

**Current standard:** the production interfaces contain no illustration. Every surface is type, data, and structure. That is a coherent and defensible position — it reads as competent rather than playful, which matches §4.1.

**Recommended evolution:** keep it that way, with one narrow exception.

| Context | Treatment |
| --- | --- |
| Empty states | **Geometric mark, not character illustration.** A simple line construction in `border.strong` at ~64 dp, no colour, no personality. Characters and mascots undercut §4.1 and age badly. |
| Onboarding | Real interface previews, not illustrations. Show the student their own structure forming (`PR-04` made visible). |
| Errors | No illustration. An error state is text plus a recovery action (§28.6). Illustration in an error state delays the fix. |
| Achievement | No illustration. Celebration mechanics are prohibited under `RAI-07`. |
| Marketing surfaces | Illustration is permitted outside the product shell but may not introduce a visual language that the product does not use. |

**Rule IL-01.** If an illustration is doing emotional work that copy could do better, delete it and write the copy. Avora's empathy is in its sentences (§6.3), not in its drawings.

---

## 19. Navigation System

### 19.1 Bottom navigation `[OBSERVED, standardised]`

The primary navigation on mobile. Five destinations, per §8.2.

| Property | Specification |
| --- | --- |
| Destinations | Home · Subjects · AI · Planner · Profile — fixed order, never reordered, never configurable |
| Height | `size.nav.height` (56) + bottom safe-area inset |
| Surface | E2 glass (§16.2) with `border.subtle` on the top edge; opaque fallback on low-end devices |
| Item | Icon (`size.icon.lg`) above label (`type.caption`), centred, full-height 44 dp minimum target |
| Active state | Filled icon variant + `text.primary` label + `accent.default` icon. **Three signals, not one** (Rule C-02). |
| Inactive state | Outline icon + `text.tertiary` label |
| Badges | A count badge is permitted on Home and Planner only. Never on AI — an unread-style badge on the tutor manufactures urgency (`FR-125`). |
| Hidden during | Open sheet, focus mode (review, quiz, camera), raised keyboard in the tutor |

**Rule NV-01 — tab state is preserved.** Returning to a tab restores its scroll position and its internal navigation stack. A student who taps AI and returns to Subjects must land where they left, not at the root. This is what makes a five-tab structure feel like five places rather than one place that keeps resetting.

**Rule NV-02 — the bar never carries an action.** No centre FAB, no compose button, no upload button in the bar. Upload is global (Rule N-04) and is surfaced in the header and in Quick Actions; putting it in the bar would make it *look* like a sixth destination.

### 19.2 The identity header `[OBSERVED, standardised]`

The Dashboard's top block, generalised into a reusable pattern.

```
┌────────────────────────────────────────────────────┐
│  Good evening                        [search] [🔔] │   greeting · type.body-sm · text.secondary
│  Arjun                                      (avatar)│   name    · type.display  · text.primary
│  Semester 5 · Computer Science                     │   context · type.caption  · text.secondary
└────────────────────────────────────────────────────┘
```

| Rule | Detail |
| --- | --- |
| The greeting is time-aware and factual | Morning / afternoon / evening. It never comments on behaviour ("You're up late!") — that is surveillance, not warmth. |
| The name is the largest element on the surface | Ownership statement (§2). |
| The context line uses D1 middot format | Term · Programme. It is the student's academic coordinates, always identical wording across surfaces. |
| Right-side affordances are capped at three | Search (per Recommendation N-03), notifications, profile. A fourth means something else must leave. |
| On scroll it collapses to a single 56 dp line | Surface name plus any active scope. Never disappears entirely. |

### 19.3 Sub-navigation `[RECOMMENDED]`

| Pattern | When to use | Never use for |
| --- | --- | --- |
| **Segmented control** | 2–4 peer views of the same data (Notes / Flashcards / Quizzes within a subject) | Filtering, or more than four options |
| **Scrollable chip row** | Filters over a set of unknown size (`All`, then subjects, then structure units) | Navigation between surfaces |
| **Breadcrumb** | Structure depth beyond level 2 — carries depth so indentation does not (Rule N-06) | Anything under two levels |
| **"All" affordance** | A truncated module linking to its full list — as production already does for Subjects and Assignments | A different destination than the module implies |

**Rule NV-03 — breadcrumbs render the student's own labels.** A breadcrumb reads `Mechanics › Experiment 7 › Observations`, not `Subject › Unit › Section`. The trail is data (Rule N-06). It truncates from the middle with the first and last always visible.

---

## 20. Buttons

### 20.1 Hierarchy `[DERIVED from OBSERVED]`

Production shows exactly three weights in use: a filled primary (*Get Started*, *Create Account*, *Continue*, *Continue preparing*, *Start*), a bordered secondary (*Continue with Google*), and a plain text tertiary (*I already have an account*, *All*, *Details*, *History*, *Timetable*).

| Variant | Surface | Label | Border | Use |
| --- | --- | --- | --- | --- |
| **Primary** | `accent.default` fill | `accent.fg` (near-black) | none | The one action the surface exists for. **Max one per viewport** (Rule C-01) |
| **Secondary** | `surface.raised` | `text.primary` | 1 px `border.default` | Alternative paths of equal legitimacy — federated sign-in, "Not now" |
| **Tertiary** | transparent | `text.secondary` | none | Navigation-like actions: *All*, *Details*, *History* |
| **Destructive** | `surface.raised` | `feedback.danger` | 1 px `feedback.danger` @ 40% | Delete, revoke, remove. **Never filled** — a filled red button invites the accidental tap it should prevent. |
| **Ghost icon** | transparent | `text.secondary` | none | Header and toolbar affordances; 44 dp hit area regardless of visual size |

**Rule BT-01 — one primary per viewport, one per card.** This is `DP-02` and it is the single most reliable way to keep a dense screen calm. If two actions both seem primary, the surface is doing two jobs and should be split.

**Rule BT-02 — destructive actions are never adjacent to primary actions**, and never in the thumb zone (`DP-05`). In a confirmation sheet, the destructive action sits *above* the cancel action, with the cancel action in the thumb position.

### 20.2 Sizes and states `[RECOMMENDED]`

| Size | Height | Padding | Type | Use |
| --- | --- | --- | --- | --- |
| `sm` | 32 (44 hit area) | 12 h | `type.label` | Inline, within cards |
| `md` | 40 | 16 h | `type.label` | Default |
| `lg` | 48 | 20 h | `type.body` | Primary actions, thumb-zone, full-width forms |

| State | Treatment |
| --- | --- |
| Hover (pointer only) | Surface lightens one step, `motion.fast` |
| Pressed | Surface darkens one step + scale unchanged (Rule §17.4) |
| Focus | 2 px `accent.default` ring at 2 px offset — visible on every variant including primary, where it renders outside the fill |
| Loading | Label is **replaced** by a spinner; width is held constant; the button is disabled and its accessible name becomes "Loading" |
| Disabled | `surface.raised`, `text.disabled`, no border change. **Always accompanied by adjacent text explaining why** (Rule C-05) |

**Rule BT-03 — labels are outcomes, not mechanics.** *Continue preparing*, *Generate Quiz*, *Create Account* — every production label already follows this. Never *Submit*, *OK*, *Confirm*, *Proceed*.

**Rule BT-04 — the label persists through the flow.** *Upload Notes* leads to an uploading state that says *Uploading notes*, and a result that says *3 notes uploaded*. The verb never changes identity mid-flow.

---

## 21. Cards

### 21.1 The Avora card anatomy `[DERIVED]`

Every card across all five production surfaces resolves to the same six-slot skeleton. This is device D2 formalised, and it is the highest-value pattern in the system.

```
┌─────────────────────────────────────────────┐
│ ① EYEBROW              UPCOMING EXAM        │  type.eyebrow · text.tertiary · optional
│                                             │
│ ② TITLE                Mid 1                │  type.title-lg · text.primary · required
│ ③ METADATA             4 subjects · Units 1–3│  type.caption · text.secondary · D1 format
│                                             │
│ ④ EVIDENCE             Weakest topic in your │  type.body-sm · text.secondary
│                        last quiz · appears   │  required for any derived claim (D3)
│                        in Mid 1              │
│                                             │
│ ⑤ FIGURE               68% Ready  81% goal   │  type.figure-xl + qualifier (D4)
│                                             │
│ ⑥ ACTION               [Continue preparing]  │  exactly one primary
└─────────────────────────────────────────────┘
```

| Slot | Required? | Rule |
| --- | --- | --- |
| ① Eyebrow | Optional | Present when the card's *category* is not obvious from the module heading. Always uppercase, always `type.eyebrow`. |
| ② Title | **Required** | The subject of the card. Never a category ("Exam"), always an instance ("Mid 1"). |
| ③ Metadata | Optional | Single line, middot-separated (D1). Wraps to at most two lines, then truncates. |
| ④ Evidence | **Required if the card asserts anything derived** | Rule DS-01 / `DP-03`. A card that says "you should" without saying "because" is a defect. |
| ⑤ Figure | Optional | Always paired with a qualifier (D4). Never a bare number. |
| ⑥ Action | **Exactly one, or zero** | Zero if the whole card is tappable. Never two primaries. |

**Rule CD-01 — a card is one idea.** If a card needs two evidence lines for two different claims, it is two cards.

**Rule CD-02 — a tappable card has no primary button.** Either the surface is the target or the button is. Both is ambiguous, and on mobile it produces mis-taps at the button edge.

**Rule CD-03 — cards do not nest.** A card inside a card is a list row inside a card. Use `surface.sunken` or a divider, not a second `surface.raised` with a second border (Rule C-03).

### 21.2 The card catalogue `[DERIVED]`

| Card | Where observed | Distinguishing slots |
| --- | --- | --- |
| `ReadinessCard` | Dashboard — Mid 1 | Eyebrow + hero figure + conditional-forecast evidence + one action |
| `InsightCard` | Dashboard — Next best action | **Mandatory** evidence line + effort chip + impact chip + one action (`FR-122`, `FR-123`) |
| `ResumeCard` | Dashboard — Continue learning; AI Tutor — Continue where you left off | Title + structural path + progress figure + last-opened timestamp + *Resume* |
| `SubjectCard` | Dashboard — Subjects | Monogram + readiness figure + name + next class + metadata pair |
| `StatTile` | AI Tutor — four tiles | Label + figure + qualifier. No action. Compact D4 unit. |
| `SuggestionCard` | AI Tutor — Suggested for you | Action phrase + scope line. Tappable whole, no button (Rule CD-02). §32 |
| `QuickActionTile` | Dashboard — Quick actions | Icon + label only. Deliberately the lightest card in the system. |
| `EventRow` | Dashboard — Today's classes | Time + title + location metadata + live status label |
| `ObligationRow` | Dashboard — Assignments | Title + subject + due date, relative-first |

**Rule CD-04 — the InsightCard is the strictest component in Avora.** It is the surface where `FR-122`, `FR-123`, `FR-125`, `RAI-06` and `PR-09` all land simultaneously. Its contract: evidence is a required prop; at least one concrete action is a required prop; copy comes only from the reviewed catalogue; it is dismissible; and its delivery is rate-limited upstream (`FR-124`). An InsightCard that cannot state its evidence must not render at all.

---
## 22. Forms and Inputs

### 22.1 Observed form pattern `[OBSERVED]`

The Sign Up and Log In screens establish the canonical form skeleton, and it is a good one:

```
[← Back]

Create your account                          ← type.display, H1
Set up Avora once and your notes, exams      ← benefit subtitle, type.body, text.secondary
and attendance stay in sync all semester.

Full Name                                    ← persistent label above field
[                                        ]

College Email
[                                        ]

Password                        [Show password]
[                                        ]
Use 8+ characters with a number or symbol.   ← hint BEFORE the error, not after

[          Create Account          ]         ← full-width primary, lg

──────────── or ────────────

[     Continue with Google     ]             ← secondary

By creating an account you agree to Avora's Terms and Privacy Policy.
Already have an account? Log In
```

Five things this pattern gets right and which are therefore rules:

| Rule | Detail |
| --- | --- |
| **FM-01** | **Labels are persistent and above the field.** Never placeholder-as-label — the label disappears exactly when the student needs it, and it fails screen readers. |
| **FM-02** | **Constraints are stated before they are violated.** "Use 8+ characters with a number or symbol" renders at rest, not on error. Preventing an error is cheaper than explaining one. |
| **FM-03** | **Password visibility is always available.** A `Show password` control on every password field. This is an accessibility and an accuracy feature, especially on mobile keyboards. |
| **FM-04** | **The primary action is full-width and in the thumb zone** (`DP-05`). |
| **FM-05** | **Legal and cross-navigation microcopy sits last, in `text.tertiary`.** Present, honest, and not competing. |

### 22.2 Input specification `[RECOMMENDED — VERIFY]`

| Property | Value |
| --- | --- |
| Height | `size.control.lg` (48) on mobile, `md` (40) on desktop |
| Surface | `surface.sunken` |
| Border | 1 px `border.default`; `accent.default` on focus with the 2 px focus ring outside it |
| Radius | `radius.sm` |
| Text | **`type.body-lg` — 16 sp minimum** (Rule TY-05) |
| Placeholder | `text.tertiary`. Contains an *example*, never a restatement of the label |
| Label | `type.label`, `text.secondary`, `space.2` above the field |
| Hint | `type.caption`, `text.tertiary`, `space.1` below |
| Error | `type.caption`, `feedback.danger`, replaces the hint, plus a `feedback.danger` border and an inline icon (Rule C-02) |
| Disabled | `surface.base`, `text.disabled`, with adjacent explanation |

**Rule FM-06 — validate on blur, re-validate on change, never on keystroke-before-first-blur.** Validating as a student types their first three characters of an email tells them they are wrong before they have finished being right.

**Rule FM-07 — errors are specific and instructive.** "Enter your college email address" not "Invalid input". "That email is already registered — log in instead?" with the log-in link inline, not "Error 409".

**Rule FM-08 — never clear a field on error.** Not passwords, not anything. `NFR-015`'s spirit — student input is never silently destroyed — applies to form state as much as to note bodies.

**Rule FM-09 — one question per screen in setup flows.** Onboarding asks for institution, programme, branch, term, subjects and structure (`FR-010`–`FR-020`). That is six decisions. They are presented as a sequence of single-question steps with visible progress, not as one long form. The observed onboarding entry — one promise, three benefits, one CTA, one reassurance — sets exactly this expectation and must be honoured by the steps that follow.

### 22.3 Selection controls `[RECOMMENDED]`

| Control | Use | Notes |
| --- | --- | --- |
| Checkbox | Multi-select in a list; the Today's-goal items | 44 dp target; the whole row is the target, not just the box |
| Radio | 2–5 mutually exclusive options where all should be visible | Above five, use a select |
| Switch | An immediate, reversible setting with no save step | Never inside a form with a save button — mixed commit models confuse |
| Select / picker | 6+ options, or an option set that varies by student data | Opens as a bottom sheet on mobile (§25.2), never a native dropdown |
| Stepper | Bounded numeric input — question count, card count, session length | Always shows the current value as text, not only as a position |

---

## 23. Search Experience

**Status:** `FR-110`–`FR-114` are V1. No search surface is observable in production, and there is currently no entry point (§8.1). This section specifies it ahead of build so that its entry point can be reserved now.

### 23.1 Entry `[RECOMMENDED]`

Per Recommendation N-03, search is a persistent affordance in the identity header and in every subject header — not a tab. Tapping it opens a full-screen search surface with the keyboard raised and the scope pre-set to the context it was invoked from.

### 23.2 The search surface `[RECOMMENDED]`

| Zone | Contents |
| --- | --- |
| Input | Full-width, `surface.sunken`, leading search icon, trailing clear. Placeholder: *"Search everything you've added"* |
| Scope chips | Immediately below the input: `All` · current subject · current term. Scope is visible before results, not hidden in a filter menu. |
| Resting state | Recent searches, then recently opened resources. Never a blank surface — see §28.3. |
| Results | Grouped by artefact type in a fixed order: Resources · Notes · Flashcards · Quiz questions · Conversations. Each group shows up to three with a "See all" affordance. |
| Result row | Type icon + title + the matched fragment with the query term emphasised in weight (not colour) + a D1 metadata line giving subject · structure path · term |
| Filters | Subject, structure unit, term, artefact type (`FR-112`) — as chips, applied immediately, never behind an "Apply" button |

### 23.3 Rules `[RECOMMENDED]`

| Rule | Detail |
| --- | --- |
| **SE-01** | **Every result is answerable.** `FR-114` — each result carries an "Ask about this" affordance that opens the tutor scoped to that result. This is the feature that makes search feel like an operating system rather than a file finder. |
| **SE-02** | **Semantic and keyword results are visually indistinguishable** but the *reason* for a semantic match is shown as the matched fragment. The student never needs to know which retrieval mode fired. |
| **SE-03** | **Two-second budget** (`NFR-005`). Skeleton rows appear immediately; results replace them in place. |
| **SE-04** | **Offline honesty.** Per `architecture.md` §27, offline search covers local titles and cached content only. The surface must say so: *"Searching downloaded content only — semantic search needs a connection."* Silent partial results would be a `NFR-014` violation. |
| **SE-05** | **Zero results is a state, not a blank.** Show the query, what was searched, and two actions: widen scope, or ask the tutor instead. |

---

## 24. Lists, Tables, and Trees

### 24.1 The list row `[DERIVED]`

The production interfaces use one row anatomy throughout — classes, assignments, subjects, suggestions:

`[leading] Title` / `metadata · line · D1` `[trailing]`

| Property | Specification |
| --- | --- |
| Minimum height | 56 (two lines), 44 (single line) |
| Leading | Icon, monogram, avatar, checkbox, or time — one only |
| Title | `type.title-sm`, `text.primary`, single line, truncate with ellipsis |
| Metadata | `type.caption`, `text.secondary`, D1 middot format, single line |
| Trailing | Figure, status label, chevron, or overflow — one only |
| Divider | `border.subtle` inset to the start of the title, not full-bleed |
| Whole row is the target | Trailing controls carry their own 44 dp target and stop propagation |

**Rule LS-01 — no more than five rows before truncation on Home.** Production truncates Subjects and Assignments with a count and an "All" affordance. That is the pattern. Home is a triage surface, not a browser.

**Rule LS-02 — status labels are text, not colour alone.** "Now", "Next", "All clear", "2 due" — production already does this correctly, and it is what makes the classes list readable in greyscale (Rule C-02).

### 24.2 Tables `[RECOMMENDED]`

Avora has almost no true tabular data, and this is deliberate. Attempt history, mastery breakdowns, and attendance detail are the only genuine candidates.

**Rule TB-01 — no horizontally scrolling tables on mobile.** Below `bp.expanded`, tabular data renders as a card list with labelled figure pairs. At `bp.expanded` and above, a real table is permitted with sticky headers, tabular figures (Rule TY-01), right-aligned numerics, and left-aligned text.

**Rule TB-02 — comparison is the only justification for a table.** If the student is not comparing rows against each other, a list is better.

### 24.3 The structure tree `[DERIVED from PRD §14.2]`

`StructureTree` is the component where Rule N-06 is enforced. It is the hardest component in the system and the one most worth specifying precisely.

| Requirement | Design |
| --- | --- |
| Zero depth is valid (`FR-015`) | Resources render directly under the subject header. No empty container, no "create your first unit" prompt, no visual gap where structure "should" be. |
| Labels are data (`FR-014`, `FR-020`) | The type label is rendered from the student's choice and appears as the eyebrow on each node: `UNIT` / `EXPERIMENT` / `WEEK` / whatever they typed. |
| Depth ≥ 3 (`FR-016`) | Levels 1 and 2 use indentation of `space.4`. **Level 3 and beyond do not indent further** — they push into a new screen with a breadcrumb (Rule NV-03). Progressive disclosure, per `PRD §22.2`. |
| Mixed structures coexist (`FR-017`) | The Subjects list shows counts, never tree shapes — nothing implies uniformity. |
| Mutation preserves everything (`FR-018`) | Rename, re-type, re-nest, split and merge each have a confirmation that states what is preserved: *"All 24 resources, 12 notes and 40 flashcards move with it."* |

**Rule TR-01 — the tree never shows more than two levels at once.** Depth is carried by the breadcrumb, not by indentation. Indentation past two levels collapses to nothing on a 360 dp screen and makes deep structures feel punishing — which would make the product's central adaptivity claim feel like a cost.

**Rule TR-02 — every node states its contents in D1 format.** `12 resources · 3 notes · 24 cards`. A student navigating structure is deciding where to go; counts are the deciding information.

---

## 25. Overlays

### 25.1 Choosing the overlay `[RECOMMENDED]`

| Overlay | Use | Never use for |
| --- | --- | --- |
| **Bottom sheet** | The mobile default for everything: pickers, filters, actions, confirmations, quick create | Anything that needs more than 90% of screen height |
| **Full-screen surface** | Multi-step flows, editors, camera capture, review sessions, search | Simple choices |
| **Dialog** | Desktop equivalent of a bottom sheet; on mobile only for destructive confirmation | Anything routine |
| **Popover / menu** | 2–6 contextual actions attached to a trigger, on pointer devices | Mobile — use a sheet |
| **Inline expansion** | Progressive disclosure within a list | Anything requiring a decision |

**Rule OV-01 — mobile prefers sheets to dialogs.** Sheets arrive from the thumb, are dismissible by drag, and preserve the context behind them. This directly serves `DP-05`.

### 25.2 Bottom sheet specification `[RECOMMENDED]`

| Property | Value |
| --- | --- |
| Surface | `surface.overlay`, opaque — **not glass** (§16.2) |
| Radius | `radius.2xl` on the top corners only |
| Grabber | 32 × 4, `border.strong`, `radius.full`, centred, `space.3` from the top |
| Scrim | `#000000` at 60%, tap-to-dismiss |
| Detents | Content height by default; `medium` (50%) and `large` (92%) for long content |
| Enter / exit | `motion.slow` / `ease.enter`; exit at `motion.base` / `ease.exit` (Rule M-02) |
| Drag | Tracks the finger 1:1; dismiss past 40% travel or on a downward velocity threshold |
| Header | Title `type.title`; optional trailing close; no back-and-forth navigation inside a sheet |
| Actions | Pinned to the bottom, above the safe-area inset, on `surface.overlay` with a `border.subtle` top edge |
| Focus | Trapped while open; restored to the trigger on dismiss (§41.5) |

**Rule OV-02 — sheets do not stack.** One sheet at a time. A sheet that needs to open another sheet is a flow that needs a full-screen surface.

### 25.3 Destructive confirmation `[RECOMMENDED]`

`FR-140` gives the student permanent deletion of any artefact, and `PRD §19.3` commits publicly that *deletion means deletion*. That commitment makes the confirmation design load-bearing.

| Element | Specification |
| --- | --- |
| Title | Names the object exactly: *"Delete "Unit 3 — Normalization"?"* |
| Body | States **precisely** what goes and what survives: *"This permanently removes 8 resources, 3 notes and 22 flashcards. Your other units are unaffected."* |
| Irreversibility | Stated plainly once: *"This can't be undone."* Never repeated, never bolded, never in red |
| Actions | Destructive variant (§20.1) placed **above** the cancel; cancel occupies the thumb position (Rule BT-02) |
| No type-to-confirm | For student content this is friction without safety. Reserve it for account deletion (`FR-005`) only. |

---

## 26. Feedback Components

### 26.1 Toasts `[RECOMMENDED]`

| Property | Value |
| --- | --- |
| Position | Above the bottom navigation, `space.4` inset, full-width minus margins |
| Surface | E4 — `surface.overlay`, `border.default`, `shadow.overlay` |
| Anatomy | Status icon + message (`type.body-sm`) + optional single action (`type.label`) |
| Duration | 4 s default; 6 s with an action; **indefinite for errors with a recovery action** |
| Stacking | Maximum two; a third replaces the oldest |
| Dismissal | Swipe in any horizontal direction, or the action |

**Rule FB-01 — toasts never carry information the student needs later.** They are transient by definition. An upload failure lives on the resource itself (§28.6); the toast merely points at it.

**Rule FB-02 — success toasts are rare.** If the interface already shows the result, a toast saying it happened is noise. Use them for actions whose effect is off-screen: "Note saved", "Share revoked", "Queued — will upload when you're back online".

### 26.2 Tooltips `[RECOMMENDED]`

Pointer devices only. Never the sole carrier of information, because they do not exist on the primary platform. On mobile the equivalent is an info affordance opening a sheet — used sparingly, and mainly for explaining derived figures such as readiness and mastery (§27.3).

### 26.3 Badges and chips `[DERIVED]`

| Component | Anatomy | Use |
| --- | --- | --- |
| **Count badge** | Numeral on `feedback.danger` or `accent.subtle`, `radius.full` | Due counts, unread. Capped at `99+`. Never on the AI tab (Rule NV-01). |
| **Status badge** | Icon + `type.caption` label on a tinted `surface.raised` | Processing state, "Now", "Next", "All clear", "2 due" |
| **Filter chip** | `type.label` on `surface.raised`, `radius.sm`, selected = `accent.subtle` + `accent.border` + `text.primary` | Scope and filter selection. 44 dp hit area (Rule SZ-01) |
| **Metadata chip** | `type.caption`, `surface.sunken`, no interaction | Cost and value markers — *12 min*, *High impact* |
| **`AIGeneratedBadge`** | Small mark + label "AI", `ai.provenance` | §31.2. Mandatory, reserved, never restyled |
| **`CitationChip`** | Numeral or short source label, `accent.subtle`, tappable | §31.3. Cannot render an unresolved citation |
| **`ConfidenceIndicator`** | Three-state: high (no chip), medium (`feedback.warning` + "Check placement"), low (`feedback.warning` + "Confirm subject") | §36.4. Confidence never renders as a raw percentage to the student |

**Rule FB-03 — chips never wrap to a third line.** Chip rows scroll horizontally with a partial next chip visible. Three lines of chips is a filter panel pretending to be a chip row.

---

## 27. Progress and Data Display

Avora shows the student numbers about themselves constantly — readiness, mastery, attendance, accuracy, coverage. This is the surface where `FR-121` (*framed as guidance rather than grading*), `FR-125`, `RAI-06` and `RAI-07` are most at risk, and where D4 (figure-with-qualifier) is mandatory.

### 27.1 The universal rule `[DERIVED]`

**Rule PG-01 — no bare numbers, ever.** Every figure carries: (a) a **label** saying what it measures, (b) a **reference** giving it meaning, and where the figure is derived, (c) an **explanation** available on tap.

Production already models this well:

| Production example | Label | Reference |
| --- | --- | --- |
| `68% Ready` | Ready | `81% goal` |
| `79%` | Overall attendance | `142 of 180 classes · 75% required` |
| `64%` | Quiz Accuracy | `+12% this week` |
| `Unit 3 of 5` | Current Progress | the total |

**Rule PG-02 — derived figures are explainable on demand.** Readiness and mastery are model estimates. Tapping either opens a sheet stating what fed it — units covered, quiz attempts, recall performance, time remaining — in the student's own vocabulary. `FR-121` requires these be framed as guidance; an unexplainable number cannot be guidance, only judgement.

### 27.2 Component specifications `[RECOMMENDED]`

| Component | Form | Notes |
| --- | --- | --- |
| **`ReadinessRing`** | Circular track, `surface.sunken`; arc in `accent.default`; percentage in `type.figure-xl` centred; a tick mark on the track showing the goal | The tick converts a score into a distance-to-target. That reframing is the difference between anxiety and direction. |
| **`ProgressBar`** | 4 dp track, `radius.full`, `surface.sunken` behind `accent.default` | Determinate only. Indeterminate work uses a skeleton (§28.2), not a bar. |
| **`MasteryMeter`** | Five discrete segments, filled in `feedback.success`, with a word label | **Never a percentage and never a grade letter.** Words — *Not started · Introduced · Developing · Solid · Strong*. `FR-121` requires guidance framing; a 62% next to a concept reads as a mark. |
| **`SubjectMonogram`** | Two letters, `radius.full`, `surface.raised`, `text.primary` | Derived deterministically from the subject name. **Not colour-coded** (Rule C-07). |
| **`CoverageBar`** | Segmented by structure unit, each segment filled proportionally to engagement | Segments carry the student's own labels on tap (Rule N-06). |
| **`StreakCounter`** | Number + neutral factual qualifier | See §6.4 — **the imperative is removed.** The count is honest; the pressure is prohibited by `RAI-07`. |
| **`AttendanceMeter`** | Percentage + fraction + threshold + headroom statement | Production's *"You can skip 5 more classes safely"* is an exemplary headroom statement and should be the model for every constraint display in the product. |

### 27.3 Charts `[RECOMMENDED]`

Minimal, and only where a trend is the point: mastery over time, accuracy over attempts, coverage against the calendar.

| Rule | Detail |
| --- | --- |
| **CH-01** | One series per chart on mobile. Comparison charts wait for `bp.expanded`. |
| **CH-02** | No chart junk — no gridlines beyond a baseline, no legends where direct labels fit, no 3D, no gradients under lines. |
| **CH-03** | Series are distinguished by shape and label, not by colour alone (Rule C-02). |
| **CH-04** | Every chart has a one-sentence text summary above it stating the finding. The chart supports the sentence; it does not replace it. This also makes the chart accessible to screen readers by construction. |
| **CH-05** | Trend charts never render fewer than three data points. Two points is a line, not a trend, and drawing it invites a conclusion the data does not support. |

---
## 28. State System

`DP-06` requires every feature to specify six states at design time. `NFR-013` requires graceful degradation, `NFR-014` requires every surfaced failure to be honest, comprehensible, and paired with a recovery action, and `PRD §22.2` requires empty states to be instructive and processing states to be visible, honest, and non-blocking.

### 28.1 The state matrix `[RECOMMENDED]`

| State | Trigger | Blocking? | Required elements |
| --- | --- | --- | --- |
| **Loading** | First data fetch | No | Skeleton matching the final layout |
| **Empty — first run** | No data has ever existed | No | What this is · why it helps · one action |
| **Empty — filtered** | Filters exclude everything | No | The active filters · one action to clear them |
| **Partial** | Some work succeeded, some did not | No | What worked · what did not · one correction action |
| **Processing** | Async work in flight | **Never** | Per-item progress · an honest estimate · a way to leave |
| **Offline** | No connectivity | No | What still works · what is queued · what needs a connection |
| **Error** | Operation failed | No | What happened · what it means · a recovery action |
| **Limit reached** | Plan or storage boundary | Yes, for the action only | Current usage · the limit · what still works · how to proceed |
| **Success** | Operation completed | No | Usually nothing — the result is the confirmation (Rule FB-02) |

### 28.2 Loading and skeletons `[OBSERVED → RECOMMENDED]`

**Current standard.** The Study Dashboard renders a text loading state: *"Loading subject dashboard"*.

**Recommended evolution — skeletons that match the layout.** A text loading state gives the student nothing to anticipate and produces a full-page repaint on arrival, which reads as slow even when it is fast. A skeleton that mirrors the final layout makes the same wait feel shorter and holds scroll position stable.

| Rule | Detail |
| --- | --- |
| **LD-01** | The skeleton is the layout with content removed — same card count, same heights, same spacing. Not grey boxes in a generic stack. |
| **LD-02** | Skeleton fill is `surface.raised` with a slow shimmer at `ease.linear`; the shimmer stops after 3 s and holds static, because a shimmer that runs for ten seconds signals a hang. |
| **LD-03** | **No spinner for anything over 1 s.** Under 1 s, no indicator at all — an indicator that flashes is worse than none. Over 1 s, skeleton. Over 5 s, skeleton plus a progress statement. |
| **LD-04** | Content replaces skeleton **in place**, without layout shift. Reserve the space the content will occupy. |
| **LD-05** | Streaming content (tutor responses) never uses a skeleton. The first token is the loading state — this is why `NFR-003` measures time-to-first-token (`architecture.md` AD-03). |

### 28.3 Empty states `[RECOMMENDED]`

`PRD §22.2`: *empty states MUST be instructive and action-oriented, never decorative.*

**Anatomy:** geometric mark (§18.5) → title stating what lives here → one sentence on why it matters → one primary action → optionally one tertiary alternative.

| Surface | Title | Body | Action |
| --- | --- | --- | --- |
| Subject with no resources | "Nothing here yet" | "Add your slides, notes or photos and Avora will file them into your structure." | Upload |
| Subject with no structure (`FR-015`) | **No empty state at all** | A flat subject is a valid, complete state. Prompting for structure here would violate `PR-04`. | — |
| No flashcards | "No cards for this yet" | "Generate cards from any resource, unit or note — usually about 30 seconds." | Generate flashcards |
| Tutor, new conversation | **No empty state** | The AI Tutor opens on suggestions and context (§32) — production already does this correctly. | — |
| Search, no query | Recent searches and recently opened | — | — |
| Search, no results | "Nothing matched "<query>"" | "Searched all subjects in this term." | Widen scope · Ask the tutor |
| Today, nothing scheduled | "No deadlines this week" | "A good week to get ahead on Unit 4." | Start a review |
| Insights, none active | **No empty module** | Hide the module entirely. An empty insights module implies the product is failing to think. | — |

**Rule ES-01 — an empty state never blames the student.** "Nothing here yet", never "You haven't added anything".

**Rule ES-02 — hide, don't empty, for derived modules.** Insights, next-best-action and readiness are outputs of accumulated data. Before there is data, they are absent, not empty. A grid of empty derived modules on day one makes the product look broken rather than new.

### 28.4 Processing states `[DERIVED from architecture.md §19.2]`

The resource state machine defines nine student-visible states, and the architecture is explicit that **every state is student-visible and honest**, with `partial` as a first-class state rather than a hidden failure.

| Machine state | Student-facing label | Visual | Available actions |
| --- | --- | --- | --- |
| `pending_upload` | Waiting to upload | Queued indicator | Cancel |
| `uploaded` | Uploaded | Determinate bar at 100% | — |
| `validating` | Checking file | Indeterminate | — |
| `processing` | Reading your file | Determinate where page counts are known | Leave — it continues |
| `extracted` / `indexed` | Almost ready | Determinate | — |
| `ready` | *(no label)* | Normal resource | Full |
| **`partial`** | **Some pages were hard to read** | `feedback.warning` status badge | **Open · Review pages · Retake photos** |
| `failed` | Couldn't read this file | `feedback.danger` status badge | **Retry · Open original · Replace** |
| `rejected` | This file type isn't supported | `feedback.danger` status badge | See supported types · Remove |
| `reprocessing` | Improving extraction | Subtle indicator | Nothing required |

**Rule PS-01 — processing never blocks** (`FR-036`, `NFR-006`). The student may navigate away, background the app, and return. Progress is pushed, not polled (`architecture.md` §7.3).

**Rule PS-02 — `partial` is presented as a *quality note*, not a failure.** The resource is open, readable, shareable and summarisable. Copy: *"4 of 26 pages were hard to read. You can still use this — retake those pages for better answers."* This is the `R-01` mitigation made visible, and it is one of the most trust-relevant screens in the product.

**Rule PS-03 — extraction confidence is visible at the point of citation.** Per `architecture.md` §19.3, confidence propagates into retrieval and citation display. A `CitationChip` resolving to a low-confidence chunk shows a `feedback.warning` marker, and the citation preview says so.

### 28.5 Offline states `[DERIVED from architecture.md §27]`

Avora is offline-capable, not local-first, and the interface must make the boundary legible rather than letting the student discover it by failure.

| Rule | Detail |
| --- | --- |
| **OF-01** | A persistent, non-modal offline indicator in the collapsed header. Never a blocking dialog. |
| **OF-02** | Cached data is **marked stale**, not hidden: *"Last updated 2 hours ago"*. |
| **OF-03** | Unavailable actions are disabled with an inline reason (Rule C-05): *"Needs a connection"*. They are never hidden — a disappearing feature is more confusing than a disabled one. |
| **OF-04** | **Queued work is visible and counted**: *"3 files will upload when you're back online"*. Upload queuing is the single most important offline behaviour because it protects the upload-on-receipt habit (`PRD §21.3`). |
| **OF-05** | Queued tutor questions show an explicit *"Will send when connected"* state in the transcript, in position, so the conversation reads correctly later. |
| **OF-06** | Reconnection is silent for reads and **explicit for writes**: a single toast, *"3 files uploaded"*. |

### 28.6 Error states `[DERIVED from NFR-014]`

**The rule that generates all the others:** there is no error component without a recovery action (`architecture.md` §7.4 — `ErrorState` requires `recoveryAction`).

**Anatomy:** what happened (plain) → what it means for the student → one recovery action → optionally, one alternative path.

| Error | Message | Recovery |
| --- | --- | --- |
| Upload failed | "Couldn't upload lecture-5.pdf. The connection dropped." | Retry |
| Extraction failed | "Couldn't read this file. The original is still here and you can open it." | Retry · Open original · Replace |
| AI unavailable (`AIR-012`) | "The tutor is unavailable right now. Your notes, resources and downloaded cards all still work." | Try again · Go to my notes |
| No material in scope (`AIR-003`) | "Your materials for Unit 3 don't cover this." | Widen scope · Answer from general knowledge (labelled) |
| Sync conflict (`architecture.md` §27.1) | "You edited this note on another device. Both versions are saved." | Compare versions |
| Limit reached (`FR-042`, `FR-144`) | "You've used 4.8 GB of 5 GB. Uploads are paused; everything you have is still available." | Manage storage · Upgrade |

**Rule ER-01 — never apologise, never blame, never expose internals.** No "Sorry!", no "Something went wrong", no error codes in the primary message. A copyable reference identifier may appear in `text.tertiary` beneath, for support.

**Rule ER-02 — errors are placed on the thing that failed.** A failed resource shows its state on its own card. Toasts announce; they do not hold state (Rule FB-01).

**Rule ER-03 — a failure in one artefact never removes access to another** (`NFR-013`). If AI generation fails, the resource, the original file, and every previously generated artefact remain reachable, and the error copy says so explicitly. This sentence is what turns a degraded moment into a trustworthy one.

### 28.7 Success states `[RECOMMENDED]`

**Rule SU-01 — the result is the confirmation.** When a note saves, the note is there. No toast, no checkmark, no celebration.

**Rule SU-02 — confirm only what is off-screen or irreversible**: sharing, revoking, deletion, export, queued offline work.

**Rule SU-03 — no celebration mechanics** (`RAI-07`). No confetti, no streak fanfare, no congratulation for routine use. When a student completes a hard thing — finishing a unit, clearing a backlog subject — the acknowledgement is one quiet sentence with the fact in it: *"Unit 3 complete. 4 of 5 units covered for Mid 1."*

---

## 29. AI Interaction Patterns

AI is not a feature of Avora; it is the mechanism by which the product delivers its promise (`PRD §18`). Six patterns govern every AI-touching surface.

| # | Pattern | Rule | Requirement |
| --- | --- | --- | --- |
| **AI-1** | **Scope before response** | The student always knows what the AI can see *before* they ask. The scope strip is persistent and adjacent to the input. | `FR-051` |
| **AI-2** | **Provenance always** | Every AI-generated artefact carries `AIGeneratedBadge` at every point of presentation, including export. | `FR-143`, `AIR-010`, `RAI-01` |
| **AI-3** | **Citation always** | Every substantive claim from student material carries a resolvable `CitationChip`. | `FR-052`, `AIR-002` |
| **AI-4** | **Honest insufficiency** | Not knowing is a designed state with its own layout, not an error. | `FR-053`, `AIR-003` |
| **AI-5** | **Labelled general knowledge** | Answers from outside the student's materials are visually distinct and explicitly labelled. Never a silent fallback. | `FR-054`, `AIR-004` |
| **AI-6** | **Reportable** | Every AI output carries an inline report affordance. | `AIR-011`, `NFR-071` |

**Rule AI-01 — the six patterns are non-negotiable and non-decorative.** They are the visual contract behind `PR-06` and the four public trust commitments in `PRD §19.3`. A surface that ships without them has not shipped an AI feature; it has shipped a liability.

---

## 30. AI Chat Experience

### 30.1 The observed entry state `[OBSERVED]`

The AI Tutor does not open on a blank conversation. It opens on **context and suggestion**: a scoped subject, a returning-user greeting, four stat tiles, a resumption strip, seven suggestion cards, a scope declaration, and a composer with a grounding reassurance.

This is the correct design and it is a deliberate rejection of the generic chat pattern. A blank chat box asks the student to know what to ask; `PR-09` requires Avora to know first. **Rule CH-01: the tutor never opens blank.**

### 30.2 Surface structure `[DERIVED]`

```
┌──────────────────────────────────────────────┐
│ AI Tutor                                     │  surface name
│ Database Management Systems                  │  active scope · type.title
│ Answers grounded in your uploaded resources  │  grounding claim (§6.4)
│ Semester 5 · Computer Science                │  D1 context
├──────────────────────────────────────────────┤
│                                              │
│   CONTEXT BLOCK — progress, resources,       │  StatTiles + ResumeCard
│   accuracy, resumption point                 │
│                                              │
│   SUGGESTED FOR YOU — Based on Unit 3        │  §32
│   [ suggestion cards ]                       │
│                                              │
│   ── or, once a conversation exists ──       │
│                                              │
│   [ transcript ]                             │  §31
│                                              │
├──────────────────────────────────────────────┤
│ Studying: CS3402 · Unit 3 · using 3 resources│  ScopeStrip — persistent, tappable
│ [ Ask anything about this subject      ] [→] │  composer
│ Answers stay inside your semester syllabus   │  grounding reassurance
└──────────────────────────────────────────────┘
```

### 30.3 The scope strip `[OBSERVED → standardised]`

Production's *"Studying: CS3402 · Unit 3 · using 3 resources"* is the most important single line in the AI experience, and it deserves to be a formal component.

| Rule | Detail |
| --- | --- |
| **SC-01** | The strip is **persistent and docked to the composer**. It rises with the keyboard. A student must never type a question without seeing what the AI can see. |
| **SC-02** | It states **three facts**: the subject or code, the structural scope in the student's own label, and the count of resources in play. The count is what makes grounding tangible. |
| **SC-03** | It is **tappable and is the scope control** (`FR-051`) — opening a sheet offering Resource · Structure Unit · Subject · Everything. Scope is never buried in a menu. |
| **SC-04** | A scope change **inserts a visible divider into the transcript** (`architecture.md` §18.1): *"Scope changed to: Operating Systems · all units"*. An answer's validity is scope-dependent; a student re-reading history must know what the assistant could see. |
| **SC-05** | When scope is widened to answer an insufficiency (`AIR-003`), the widening is shown as an explicit, student-confirmed step — never automatic. |

### 30.4 Composer `[RECOMMENDED]`

| Property | Specification |
| --- | --- |
| Height | Single line at rest, grows to 5 lines, then scrolls internally |
| Text | `type.body-lg` (16 sp — Rule TY-05) |
| Placeholder | Scope-aware: *"Ask anything about this subject"* / *"Ask about Experiment 7"* |
| Send | Enabled only with content; becomes a stop control while streaming |
| Attachments | Camera and file affordances inline — a question about a photographed page is a primary use case (`FR-032`) |
| Reassurance | *"Answers stay inside your semester syllabus"* in `type.caption`, `text.tertiary`, persistent |
| Offline | Composer stays enabled; send queues with a visible *"Will send when connected"* state (Rule OF-05) |

### 30.5 Message rendering `[RECOMMENDED]`

| Element | Specification |
| --- | --- |
| Student message | Right-aligned, `surface.raised`, `radius.lg` with a squared bottom-right corner, `type.body` |
| Assistant message | **Full-width, no bubble**, on `surface.base`, `type.body-lg`. Tutor answers are long-form academic reading (§13.5); a chat bubble makes a 400-word explanation unreadable. |
| Assistant header | `AIGeneratedBadge` + depth control + overflow (copy · save as note · report) |
| Streaming | Token append with a soft caret. Never a fake typewriter delay (Rule §17.4). |
| Math and code | `FR-058`. Rendered notation, never raw markup. Code blocks scroll horizontally with an edge fade and a copy affordance. |
| Citations | Inline `CitationChip` at the end of the sentence they support (§31.3) |
| Actions | On completion: *Save as note* (`FR-059`), *Copy*, *Report* (`AIR-011`), *Regenerate* |
| Conversation memory | Compaction is invisible to the student (`architecture.md` §18.1). Never show "context summarised" — it undermines confidence in a mechanism the student cannot control. |

---

## 31. AI Response Presentation

### 31.1 The presentation contract `[DERIVED]`

Every assistant response resolves to one of four forms. The form is chosen by the *grounding outcome*, not by the topic, and each has a distinct visual treatment so that the student learns the difference in one exposure.

| Form | When | Visual signature |
| --- | --- | --- |
| **Grounded** | Evidence retrieved above threshold | Standard rendering + inline `CitationChip`s + a source summary footer |
| **Insufficient** | No material in scope above threshold (`AIR-003`) | A distinct panel on `surface.raised` with `border.default`, a plain statement, and **two offered actions**: widen scope, or answer from general knowledge |
| **General knowledge** | Explicitly chosen after insufficiency (`AIR-004`) | A persistent labelled container — `border.strong` left rule and a header reading **"Outside your materials"** — that remains in the transcript permanently |
| **Refused / degraded** | Provider unavailable (`AIR-012`) or the request falls outside responsible use (`RAI-02`) | Honest statement + what still works + an alternative path |

**Rule RP-01 — general knowledge is never a silent fallback.** Per `architecture.md` §18.1, a silent fallback when retrieval is weak is precisely the failure mode that destroys the product's premise. It requires an explicit student choice and a permanent visual label, and the label must survive being scrolled back to a week later.

**Rule RP-02 — the insufficiency state is a designed screen, not an apology.** It states what was searched, in what scope, and offers the two ways forward. Copy: *"Your Unit 3 materials don't cover deadlock recovery. I searched 3 resources in Unit 3."* Naming the scope that was searched is what makes the statement credible rather than evasive.

### 31.2 AI provenance labelling `[DERIVED from FR-143, AIR-010, RAI-01]`

| Context | Treatment |
| --- | --- |
| Tutor response | `AIGeneratedBadge` in the message header |
| AI-generated note | Badge in the note header **and** in every list row where the note appears |
| Note edited by the student (`FR-073`) | Badge changes to "Edited by you" — provenance flips on first edit and the change is visible |
| Summary | Badge in the summary header |
| Flashcard | Badge on the card back and in the deck list |
| Quiz question | Badge on the quiz header, not per question — per-question badges would clutter an assessment surface without adding information |
| Insight | Badge on the InsightCard |
| **Export** (`RAI-01`) | The label is carried into the exported artefact as text. This is a hard requirement and applies to every export path. |

**Rule RP-03 — the badge is never suppressed for aesthetics.** It is small, quiet, and uses the reserved `ai.provenance` colour (Rule C-06). It is not restyled per surface, not made optional in a compact variant, and not removed when "obvious from context".

### 31.3 Citations `[DERIVED from AIR-002, AIR-006]`

`CitationChip` cannot render a free-text citation by construction (`architecture.md` §7.4). Fabricated citations are a severity-one defect (`AIR-006`), and the design must make a fabricated citation impossible to display rather than merely unlikely.

| Property | Specification |
| --- | --- |
| Inline form | A small numbered chip at the end of the supported sentence, `accent.subtle`, 44 dp hit area |
| Tap behaviour | Opens a preview sheet: resource name, exact locator (page, slide, or section), the matched excerpt, and *Open resource* |
| Footer | A response with citations ends with a source summary: *"From 3 resources · normalization-notes.pdf, Lecture 5, Unit 3 summary"* |
| Low confidence | A chip resolving to a low-confidence chunk carries a `feedback.warning` marker and the preview states it (Rule PS-03) |
| Cross-term (`FR-113`) | A citation to a prior term shows the term in the chip preview — prerequisite grounding must be visible, not silent |
| Never | No citation without a resolved locator. No "according to your notes" without a chip. No footnote-style deferral. |

### 31.4 Depth control `[DERIVED from FR-056, AIR-009]`

Explanation depth is adjustable and should adapt to demonstrated mastery.

| Rule | Detail |
| --- | --- |
| **DC-01** | Three levels, named in student language: **Simple · Standard · Rigorous**. Never "ELI5" or "Expert" — both carry judgement. |
| **DC-02** | The control sits in the assistant message header and re-renders **that** response. It does not restart the conversation and does not discard the previous version. |
| **DC-03** | The default is inferred from mastery (`AIR-009`) but the inference is never announced. Telling a student the system chose "Simple" for them because they are weak is exactly the shaming `RAI-06` prohibits. |

### 31.5 Reporting `[DERIVED from AIR-011, NFR-071]`

Every AI output carries a report affordance in its overflow menu. The flow is one sheet, three tap-able reasons — *Incorrect · Not from my materials · Not helpful* — plus an optional free-text field, and a single honest confirmation: *"Thanks — this goes to our quality review."* No follow-up survey, no gamification, no "we'll get back to you" promise the system cannot keep.

---

## 32. AI Suggestions

### 32.1 The observed pattern `[OBSERVED]`

The AI Tutor's *Suggested for you — Based on Unit 3* module is a strong pattern and generalises cleanly. Each suggestion is a two-line pair:

| Action phrase | Scope line |
| --- | --- |
| Explain Unit 3 | Normalization · 3NF & BCNF |
| Summarize today's lecture | Lecture 5 · 24 pages |
| Prepare for tomorrow's class | Lab 6 · Nested Queries |
| Generate Flashcards | From your Unit 3 notes |
| Create Practice Quiz | 10 MCQs · exam pattern |
| Explain uploaded PDF | normalization-notes.pdf |
| Ask from lecture notes | 25 notes indexed |

### 32.2 Rules `[DERIVED]`

| Rule | Detail |
| --- | --- |
| **SG-01** | **Every suggestion names its scope.** The second line is mandatory. A suggestion without scope is a prompt template; a suggestion with scope is a demonstration that the system knows the student's material. |
| **SG-02** | **Suggestions are derived, never static.** The module header states the basis — *"Based on Unit 3"* — which is device D3 applied to suggestions. |
| **SG-03** | **Between four and seven at a time.** Fewer looks thin; more becomes a menu the student must read rather than a shortcut they can take. |
| **SG-04** | **Ordered by proximity to what the student is doing now** — current unit, then imminent class or deadline, then recent uploads, then generative actions. |
| **SG-05** | **Mixed types are correct.** Explain, summarise, prepare, generate, and open are all legitimate. The tutor surface is the entry point to the whole AI layer, not only to conversation. |
| **SG-06** | **Suggestions are dismissible and rate-limited** where they are proactive rather than requested (`FR-124`, `AIR-014`). Proactive AI must be fully disableable by the student. |
| **SG-07** | **Follow-up suggestions after a response** (`FR-057`) are capped at three, appear below the message, and disappear once the student types. They must never push the composer off screen. |

---
## 33. File Upload Experience

`PRD §15.2` calls ingestion *"the moment the product earns its category claim"* and requires that filing must feel like it did not happen. `PRD §22.1` requires Upload to be globally available and never nested. `architecture.md` §7.1 makes the upload queue a global client service surviving navigation, backgrounding and restart.

Upload is therefore the most important interaction in Avora, and it gets the most design attention.

### 33.1 Entry points `[DERIVED]`

| Entry | Availability |
| --- | --- |
| Global upload affordance | Every surface, in the header (Rule N-04) |
| Quick Actions — *Upload Notes* | Home. First position, as production already has it. |
| Subject and structure-unit context | Pre-scopes the destination |
| Share-sheet / system intent | Critical. Material arrives in messaging apps (`PRD §4.2 P1`); the shortest path from a class group to Avora is the OS share sheet, not the app. |
| Desktop drag-and-drop | `bp.expanded` and above |

### 33.2 The upload sheet `[RECOMMENDED]`

Opens as a bottom sheet with four sources in this order — **Camera first**:

1. **Take photos** — multi-page capture (`FR-032`)
2. **Photo library**
3. **Files**
4. **Recent** — items shared to Avora but not yet filed

Camera leads because the beachhead photographs whiteboards and handwritten pages, and because it is the source with the most friction elsewhere.

### 33.3 Multi-page capture `[RECOMMENDED from FR-032]`

| Rule | Detail |
| --- | --- |
| **UP-01** | Continuous capture. Shoot, shoot, shoot; review at the end. Never one photo per round-trip. |
| **UP-02** | Live edge detection with an auto-crop preview; manual corner adjustment available but never required. |
| **UP-03** | Per-page retake from the review strip, without discarding the others. |
| **UP-04** | Immediate quality feedback at capture time: *"Try again in better light"*. Catching a bad scan before processing is worth more than the best `partial`-state design. |
| **UP-05** | Page order is drag-reorderable in review. |

### 33.4 Classification and correction `[DERIVED from FR-038, FR-039]`

`ResourceCard` requires a `confidence` prop and renders a correction affordance whenever confidence is below the ask-threshold.

| Confidence | Presentation | Action |
| --- | --- | --- |
| **High** | Filed silently. Subject and structure unit shown as plain metadata. | Change placement, via overflow |
| **Medium** | Filed, with an inline chip: *"Filed under Operating Systems · Unit 3"* + **Change** | One tap to a scoped picker |
| **Low** | Filed to the subject only, with a prompt: *"Which unit is this?"* + up to three ranked suggestions + **Choose** | One tap |
| **Unknown** | Held in an *Unfiled* group with a count on the upload surface | One tap |

**Rule UP-06 — never block on classification.** The resource is available, openable, and summarisable while placement is uncertain. Correction is an invitation, never a gate.

**Rule UP-07 — confidence is never shown as a percentage.** "87% confident" is meaningless to a student and invites misplaced trust. Show the consequence — *"Filed under X · Change"* — not the score.

**Rule UP-08 — correction is one action** (`FR-039`). Tap → pick → done. No confirmation dialog, no save button. And the correction should visibly cost nothing, because a student who finds correcting expensive will stop uploading.

### 33.5 Progress `[DERIVED from NFR-004]`

Immediate acknowledgement, visible per-item progress, typical completion within two minutes.

| Rule | Detail |
| --- | --- |
| **UP-09** | Acknowledgement is instantaneous and local — the file appears in the list before any network round-trip completes. |
| **UP-10** | Progress is per-item, not aggregate. "Processing 3 of 12" hides which one is stuck. |
| **UP-11** | A persistent, collapsible upload tray, reachable from any surface, showing the queue and its states. |
| **UP-12** | Backgrounding continues the work and a completion notification is offered — opt-in (`FR-107`, `AIR-014`). |
| **UP-13** | Duplicate detection (`FR-041`) offers *Keep both · Skip · Replace*, never silently deduplicates. Silent deduplication of student material is indistinguishable from data loss. |

---

## 34. Authentication Experience

### 34.1 Current standard `[OBSERVED]`

Welcome → Sign Up or Log In. Sign Up collects Full Name, College Email, Password, Confirm Password, with a Google alternative. Log In collects Email and Password with Forgot Password inline. Both satisfy `FR-001` (one low-friction method plus one email-based method), `FR-003` (self-service recovery), and the §22.1 form pattern.

### 34.2 Design rules `[DERIVED]`

| Rule | Detail |
| --- | --- |
| **AU-01** | The Welcome surface states the outcome, not the feature list. Production's four benefit blocks — Upload Notes, AI Study Assistant, Smart Quizzes, Exam Readiness — are the correct level of abstraction and correct vocabulary. |
| **AU-02** | Two actions of clearly different weight, never two primaries (Rule BT-01). |
| **AU-03** | The subtitle states a benefit, not an instruction (§6.3). |
| **AU-04** | Federated sign-in is secondary, below the divider — not above the form. Placing it above implies the email path is the fallback. |
| **AU-05** | The primary action is full-width and in the thumb zone (`DP-05`). |
| **AU-06** | Legal microcopy is present, plain, and in `text.tertiary`. It is never hidden behind a checkbox the student must find. |

### 34.3 Recommended evolutions

**RE-A — Reconsider "Confirm Password".**
*Current standard:* Sign Up collects a password twice.
*Recommended evolution:* a single password field, retaining the existing **Show password** control and the existing pre-emptive requirement hint.
*Reasoning:* the confirm field exists to catch typos in masked input. Production already ships the better solution to that problem — visible input on demand. `PRD §21.2` targets minimal-friction account creation as step one of a ten-minute time-to-value; `FR-003` provides self-service recovery as the safety net. Removing one field from the first screen of the funnel is a cheap, measurable improvement that changes nothing visual.

**RE-B — Align the method set with the architecture.**
*Current standard:* email plus password.
*Observation, not a defect:* `architecture.md` §6 specifies Supabase Auth with OAuth plus **email OTP / magic link** for the email method. Password and magic-link are both valid readings of `FR-001`. This needs a product decision rather than a design one, and the design system should carry whichever wins. If magic link is chosen, the form pattern in §22.1 is unchanged — one fewer field, one added "check your email" state (which needs an explicit design: what to do if the mail does not arrive, and how to resend).

**RE-C — "College Email" label.**
*Current standard:* the Sign Up field is labelled "College Email".
*Recommendation:* keep the label — it correctly signals the product's audience — but **do not validate against an institutional domain allow-list**. `FR-011` requires that a student at an institution unknown to Avora is never blocked, and many students in the beachhead do not have or do not use an institutional address. The label is guidance; a domain restriction would be a `PR-04` violation at the very first step.

---

## 35. Onboarding Experience

### 35.1 Current standard `[OBSERVED]`

One promise (*"Let's personalize your semester"*), one duration commitment (*"a couple of minutes"*), three benefit bullets, one action, one reassurance (*"You can change any of this later."*).

This is an unusually good onboarding entry, and the reason is the middle bullet: *"Units, labs or programs — your way"*. `PR-04` is the product's central thesis and its hardest thing to communicate, and this line does it in six words, before the student has been asked anything.

### 35.2 Rules for the steps that follow `[DERIVED from FR-010–FR-020]`

Onboarding must collect institution, programme, branch, term, subjects and structure while satisfying `PRD §21.2`'s under-ten-minutes-to-value target.

| Rule | Detail |
| --- | --- |
| **OB-01** | **One decision per step**, with visible progress (Rule FM-09). Six decisions in one form contradicts the "couple of minutes" promise the entry screen just made. |
| **OB-02** | **Every step is skippable or deferrable except institution and term.** The reassurance line is a promise; every step must honour it. |
| **OB-03** | **Search-first pickers for institution and programme**, with a persistent, prominent *"I can't find mine"* path (`FR-011`). This path must be visible from the start, not revealed after a failed search — a student whose college is missing is exactly the student most likely to abandon. |
| **OB-04** | **Templates are suggestions, never constraints** (`PRD §14.2`). A proposed subject list or structure arrives pre-filled and fully editable, with the source stated: *"Common for B.Tech CSE Semester 5 — edit anything."* |
| **OB-05** | **"No structure" is offered as a first-class choice**, not as a skip. `FR-015` makes a flat subject valid and complete. The copy should say so: *"Keep it simple — just files under each subject."* |
| **OB-06** | **The structure-label picker offers the full observed vocabulary plus a custom field** (`FR-014`, `FR-020`): Unit, Module, Chapter, Topic, Week, Experiment, Practical, Lab, Project, Program, and *Something else*. |
| **OB-07** | **Timetable upload is offered, not required** (`FR-101`), with parsed events shown for confirmation before they are created. Never silently create calendar entries from a photograph. |
| **OB-08** | **Onboarding ends at the first upload, not at a summary screen.** `PRD §21.2` defines activation as setup + upload + one AI interaction in the first session. The last onboarding step should be the upload sheet, and the first Home render should already show material being processed. |

**Rule OB-09 — no empty dashboard is ever shown to a new student.** If setup completes without an upload, Home renders a single guided state whose only action is upload. Handing a student an empty operating system is the fastest way to lose them.

---

## 36. Dashboard (Home) Design Rules

### 36.1 The contract `[DERIVED from OBSERVED + PRD §22.2]`

Home answers *"what should I do now"* without navigation. Every module either contributes to that answer or provides one-tap access to something the student came for.

**Rule HM-01 — the module order is canonical** and reflects the Tier model (§7.1):

| Order | Module | Tier | Present when |
| --- | --- | --- | --- |
| 1 | Identity header | 1 | Always |
| 2 | Readiness / next assessment | 2 | An assessment exists within the horizon |
| 3 | Today's goal | 3 | A plan exists |
| 4 | Next best action | 2 | Evidence supports a recommendation |
| 5 | Quick actions | — | Always |
| 6 | Continue learning | 3 | A resumable session exists |
| 7 | Subjects | 4 | Always |
| 8 | Today's classes | 4 | A timetable exists |
| 9 | Attendance | 4 | Attendance data exists (§40) |
| 10 | Assignments | 4 | Obligations exist |

**Rule HM-02 — derived modules hide rather than empty** (Rule ES-02). A first-day student sees the identity header, Quick actions, Subjects, and an upload-led guided state. Nothing else.

**Rule HM-03 — Home is read-and-launch, not edit.** Every action on Home either launches a session or navigates. Editing structure, renaming, and re-filing happen in Subjects. Mixing the two makes Home a control panel, which defeats `DP-01`.

**Rule HM-04 — every module has exactly one "more" affordance** and it is a tertiary text action in the module header (*All*, *Details*, *Timetable*, *History*) — as production already does throughout.

**Rule HM-05 — Quick actions are six or fewer, single row of tiles, Upload first.** They are shortcuts, not a feature menu. Adding a seventh means one must go.

### 36.2 The readiness module `[DERIVED]`

The strongest card in the product and the model for any predictive surface.

| Element | Rule |
| --- | --- |
| Eyebrow | Names the assessment type |
| Title | The assessment's real name (*Mid 1*) |
| Scope | D1 metadata: subjects and structure covered |
| Urgency | Days remaining **and** the date. Relative alone is anxious; absolute alone is abstract. |
| Figure | Readiness with its goal (D4) — **never a bare percentage** |
| Evidence | A conditional forecast (§6.3): *"Complete Unit 3 Part A today to reach 81% readiness."* |
| Action | One. Continues the plan; never opens a settings surface. |

**Rule HM-06 — readiness is explainable** (Rule PG-02). Tapping the figure explains what fed it. An unexplained predictive number about a student's exam is the single most anxiety-producing element the product could ship, and the explanation is what converts it into guidance under `FR-121`.

---

## 37. Subject and Study Dashboard Rules

### 37.1 Subject surface `[RECOMMENDED, consistent with observed]`

The subject dashboard is Home scoped to one subject, and it inherits the Tier model.

| Order | Module | Notes |
| --- | --- | --- |
| 1 | Subject header | Monogram + name + code + instructor + D1 context. Collapses on scroll retaining name and readiness. |
| 2 | Readiness for this subject | Tier 2. Same component as Home, scoped. |
| 3 | Continue / next action | Tier 2. |
| 4 | Structure | `StructureTree` (§24.3) — **or, for a flat subject, the resource list directly** (`FR-015`) |
| 5 | Artefacts | Segmented control: Resources · Notes · Flashcards · Quizzes |
| 6 | Coverage | `CoverageBar` segmented by the student's own structure labels |
| 7 | Upcoming for this subject | Classes, deadlines, assessments |

**Rule ST-01 — the subject surface must render correctly for a subject with zero structure, one level, and three levels, and for a subject whose label is "Experiment".** This is the Meera test (Rule N-06) and it is the single most important review question for this surface.

**Rule ST-02 — the loading state is a skeleton of this layout** (§28.2), replacing the current text loading state.

### 37.2 Study surface `[RECOMMENDED from FR-080–FR-098]`

Study is entered from context (Recommendation N-02) and runs in **focus mode**: bottom navigation hidden, one task on screen, an explicit exit.

| Rule | Detail |
| --- | --- |
| **SD-01** | Session length is chosen before it starts, in cards or minutes (`FR-084`), and shown as remaining progress throughout. Open-ended review sessions produce fatigue and abandonment. |
| **SD-02** | The card face is centred with generous space; the grading controls sit in the thumb zone, spaced to prevent mis-taps. |
| **SD-03** | Every card carries its source (`FR-086`) — one tap to the resource it came from. |
| **SD-04** | Quiz feedback explains the reasoning, never only the answer (`AIR-008`), and cites the source material (`FR-094`). |
| **SD-05** | Session results are **factual and forward-looking**: what was covered, what will resurface, what to do next. Never a grade, never a comparison, never a celebration (`RAI-06`, `RAI-07`). |
| **SD-06** | Offline review is fully functional for downloaded decks (`FR-085`), with a visible sync-pending count and no degradation in the session itself. |
| **SD-07** | Exiting mid-session preserves position and never warns about "losing progress" — attempts are appended as they happen (`architecture.md` §27.1). |

---

## 38. AI Tutor Surface Rules

Specified across §29–§32. Consolidated review checklist for this surface:

| # | Check | Requirement |
| --- | --- | --- |
| 1 | Never opens blank — context and suggestions are present | `PR-09` |
| 2 | Scope strip is persistent, docked to the composer, and is the scope control | `FR-051` |
| 3 | Scope changes insert a visible divider in the transcript | `architecture.md` §18.1 |
| 4 | Every response carries `AIGeneratedBadge` | `FR-143`, `AIR-010` |
| 5 | Every grounded claim carries a resolvable `CitationChip` | `FR-052`, `AIR-002` |
| 6 | Insufficiency is a designed state offering two ways forward | `FR-053`, `AIR-003` |
| 7 | General-knowledge answers carry a permanent visible label | `FR-054`, `AIR-004` |
| 8 | Depth control is present and does not restart the conversation | `FR-056`, `AIR-009` |
| 9 | Report affordance on every response | `AIR-011`, `NFR-071` |
| 10 | Save-as-note available on every response | `FR-059` |
| 11 | Math and code render as notation, never markup | `FR-058` |
| 12 | Streaming begins visibly; no fake typewriter delay | `NFR-003` |
| 13 | Conversation deletion available per conversation and in bulk | `FR-060` |
| 14 | Offline questions queue with a visible in-transcript state | `architecture.md` §27 |
| 15 | The grounding claim in the header is accurate — **"grounded in", not "trained on"** | `NFR-043`, §47 RE-01 |

---

## 39. Planner Surface Rules

`[RECOMMENDED from FR-100–FR-107]`

| Rule | Detail |
| --- | --- |
| **PL-01** | Opens on **today**, not on a month grid. A month view is an archive; a student needs the next thing. |
| **PL-02** | Three views: Today · Week · Month. Week is the default beyond today. |
| **PL-03** | The plan and the calendar are one surface. Classes, deadlines, assessments and planned study sessions share a timeline. Separating "my schedule" from "my plan" forces the student to reconcile them mentally, which is the job the product exists to do. |
| **PL-04** | **Missed sessions re-plan silently** (`FR-104`). No red, no overdue badge on a study session, no accumulated debt. The copy is forward-facing: *"Today's plan is updated for the time you have."* Deadlines are different — a genuinely missed deadline is a fact and is shown as one. |
| **PL-05** | Every planned item is overridable, reschedulable and dismissible in one action (`FR-106`), with no confirmation and no explanation requested. |
| **PL-06** | Parsed timetable events are confirmed before creation (`FR-101`) and are visually distinguishable from student-entered events until confirmed. |
| **PL-07** | Reminders are opt-in, per-category, and disableable entirely (`FR-107`, `FR-124`, `AIR-014`). |

---

## 40. Attendance Surface Rules

### 40.1 A documented gap `[OBSERVED]`

The production Dashboard contains a complete Attendance module — overall percentage, class fraction, institutional threshold, headroom statement, and per-subject exceptions. **Attendance does not appear anywhere in the PRD**: not in the domain model (§14.1), not in the core features (§15), not in the functional requirements (§16), and not in the information architecture (§22).

This is recorded as a finding, not a criticism. The feature is clearly deliberate and well-designed, and it is highly relevant to the beachhead — attendance thresholds are a real and consequential constraint in Indian engineering programmes. But `NFR-063` requires every shipped capability to trace to a requirement identifier, and this one does not.

**Recommendation A-01.** Raise a PRD amendment adding Attendance to the domain model and functional requirements. Until then, this document specifies its design rules on the basis of the approved production implementation, and flags it in the register (§47 RE-05).

### 40.2 Design rules `[DERIVED from OBSERVED]`

Production's attendance module is, in fact, the **best example of constraint display in the entire product**, and its pattern should be reused wherever Avora shows a threshold.

| Rule | Detail |
| --- | --- |
| **AT-01** | Show the figure, the fraction, and the threshold together: *"79% · 142 of 180 classes · 75% required"*. Three numbers, one line, complete meaning (D4). |
| **AT-02** | **Convert the constraint into remaining freedom.** *"You can skip 5 more classes safely"* is the exemplary headroom statement — it tells the student what they *can* do rather than what they must not. This directly serves `RAI-06` and should be the template for storage limits, plan limits, and revision-time budgets. |
| **AT-03** | Below-threshold subjects are stated factually with the figure — *"Computer Networks below requirement · 68%"* — in `feedback.warning`, never `feedback.danger`, and never with an exclamation, a warning triangle, or an imperative. |
| **AT-04** | Never compute or display a consequence Avora cannot verify. Institutional attendance rules vary and the penalty is not Avora's to assert. State the number and the threshold; do not state the outcome. |

---
## 41. Accessibility Standards

`NFR-051` requires WCAG 2.1 Level AA for contrast, target size, focus handling and screen-reader compatibility. `PR-11` extends the obligation beyond disability to device quality, network condition and language proficiency. `architecture.md` §7.5 places verification in CI on primitives and in manual review on surfaces, and makes contrast a property of the token set.

Accessibility is therefore not a review stage in Avora. It is a property of §12–§17 and §18.1.

### 41.1 Conformance target

| Level | Scope |
| --- | --- |
| **WCAG 2.1 AA** | The release gate. Every surface, every state. |
| **WCAG 2.1 AAA** | Aspirational where cheap — notably 7:1 contrast, which the proposed `text.primary` (16.9:1) and `text.secondary` (8.8:1) already exceed. |
| **Platform conventions** | iOS and Android accessibility APIs are honoured natively rather than reimplemented. Dynamic Type and font-scale settings are respected. |

### 41.2 Contrast `[computed for the proposed palette]`

| Pair | Ratio | Requirement | Result |
| --- | --- | --- | --- |
| `text.primary` on `surface.base` | 16.9 : 1 | 4.5 : 1 | Pass AAA |
| `text.secondary` on `surface.base` | 8.8 : 1 | 4.5 : 1 | Pass AAA |
| `text.tertiary` on `surface.base` | 4.7 : 1 | 4.5 : 1 | Pass AA — **no margin, see Rule C-04** |
| `accent.default` on `surface.base` | 7.4 : 1 | 3 : 1 (UI) / 4.5 : 1 (text) | Pass AAA |
| `accent.fg` on `accent.default` | 7.4 : 1 | 4.5 : 1 | Pass AAA — **white would fail at ~2.6 : 1** |
| `feedback.success` on `surface.base` | 9.8 : 1 | 4.5 : 1 | Pass AAA |
| `feedback.warning` on `surface.base` | 10.8 : 1 | 4.5 : 1 | Pass AAA |
| `feedback.danger` on `surface.base` | 7.3 : 1 | 4.5 : 1 | Pass AAA |
| `ai.provenance` on `surface.base` | 7.3 : 1 | 4.5 : 1 | Pass AAA |
| `border.subtle` on `surface.base` | ~1.4 : 1 | — | Decorative only; never the sole boundary of an interactive control |

**Rule AX-01 — contrast is verified in CI against the token set, not eyeballed per screen.** Every pair above is re-verified whenever a token changes, and every pair must be re-verified against `surface.raised` and `surface.overlay`, which are lighter and therefore reduce ratios.

**Rule AX-02 — colour is never the sole carrier of meaning** (WCAG 1.4.1, Rule C-02). Render greyscale as a review step. Production already passes this test because its status labels are words ("Now", "Next", "All clear", "2 due").

### 41.3 Focus `[RECOMMENDED]`

| Rule | Detail |
| --- | --- |
| **AX-03** | Focus is **always visible**, never suppressed. 2 px `accent.default` ring at 2 px offset, on every focusable element including primary buttons, where it renders outside the fill. |
| **AX-04** | Focus order follows visual order. Where a layout reorders visually, the DOM order is corrected rather than the tab order patched. |
| **AX-05** | Focus is **trapped** in sheets and dialogs and **restored** to the trigger on dismiss. |
| **AX-06** | Entering a new surface moves focus to its heading, not to the first control. |
| **AX-07** | Focus is never moved by an event the student did not initiate. A streaming response, an arriving toast, and an insight appearing must not steal focus. |

### 41.4 Touch targets `[RECOMMENDED]`

| Rule | Detail |
| --- | --- |
| **AX-08** | 44 × 44 dp minimum for every interactive element, achieved with padding where the visual is smaller (Rule SZ-01). |
| **AX-09** | 8 dp minimum spacing between adjacent targets. Enforced strictly in the flashcard grading row and the bottom navigation, where mis-taps have the highest cost. |
| **AX-10** | The whole list row is the target; trailing controls carry their own target and stop propagation. |

### 41.5 Keyboard navigation `[RECOMMENDED]`

Mobile is the primary platform, but keyboard support is required for external-keyboard users, switch-access users, and the desktop enhancement (`PR-11`, §10.4).

| Key | Behaviour |
| --- | --- |
| `Tab` / `Shift+Tab` | Move focus in visual order |
| `Enter` / `Space` | Activate |
| `Esc` | Close the topmost overlay; clear a search field before closing search |
| `↑ ↓` | Move within lists, menus, and the structure tree |
| `← →` | Collapse / expand a tree node; move between tabs |
| `Cmd/Ctrl + K` | Open search from anywhere |
| `Cmd/Ctrl + U` | Open upload from anywhere |
| `Cmd/Ctrl + Enter` | Send in the tutor composer |
| `1`–`5` | Jump to a primary destination (desktop rail) |

**Rule AX-11 — a skip-to-content affordance is present on every surface** at `bp.expanded` and above.

### 41.6 Screen readers `[RECOMMENDED]`

| Rule | Detail |
| --- | --- |
| **AX-12** | One `h1` per surface. Heading levels never skip. Module headings are real headings, not styled text. |
| **AX-13** | Every icon-only control has an accessible name describing the *action*, not the icon: "Upload notes", not "Plus". |
| **AX-14** | Figures are announced with their frame (Rule PG-01): "Exam readiness: 68 percent, goal 81 percent", not "68 percent". |
| **AX-15** | Streaming AI responses use a polite live region and announce completion. They do not announce every token. |
| **AX-16** | `CitationChip` announces its resolved source: "Citation 1, normalization-notes.pdf, page 12". |
| **AX-17** | `AIGeneratedBadge` is announced as text — "AI generated" — not conveyed by colour or glyph alone. This is a `FR-143` requirement, not only an accessibility one. |
| **AX-18** | Processing state changes are announced once on transition, not continuously. |
| **AX-19** | Charts have a text alternative that states the finding (Rule CH-04). |
| **AX-20** | The middot metadata line (D1) reads naturally. `·` is announced as a pause or is hidden from the accessibility tree with the segments separated semantically — never read as "middle dot" four times per row. |

### 41.7 Reading and language `[DERIVED from NFR-054, PRD §15.11]`

| Rule | Detail |
| --- | --- |
| **AX-21** | Plain language, enforced through the reviewed content catalogue (§6). |
| **AX-22** | All strings live in a message catalogue with ICU pluralisation from the first commit (`architecture.md` §7.5), even though multi-language ships at V2. |
| **AX-23** | Layouts tolerate **+40% string expansion** without truncation of anything load-bearing. Indian-language and mixed-script strings expand significantly. |
| **AX-24** | Text never renders inside images. Student-supplied thumbnails are decorative and are always accompanied by a text title. |
| **AX-25** | RTL is not required at V0 but no layout may hard-code directionality in a way that forecloses it (`PR-13`). |

### 41.8 Motion, zoom, and low-end devices

| Rule | Detail |
| --- | --- |
| **AX-26** | Reduced-motion preference is honoured (Rule M-03). |
| **AX-27** | **Zoom is never disabled** (WCAG 1.4.4). See §47 RE-02 — this is currently violated on all five surfaces, and Rule TY-05 removes the reason it was introduced. |
| **AX-28** | Text remains readable and functional at 200% scale. Layouts reflow; they do not clip. |
| **AX-29** | Every surface is verified on a low-end Android device (`NFR-052`) via the device matrix in `architecture.md` §6 — not on a simulator. |

---

## 42. Design Consistency Rules

The twenty checks below are the review checklist. A surface passing all twenty will look like Avora; a surface failing three or more will not.

| # | Rule |
| --- | --- |
| 1 | Exactly one primary action is visible per viewport (`DP-02`, Rule BT-01) |
| 2 | Every card follows the six-slot anatomy (§21.1) |
| 3 | Every derived claim carries an evidence line (D3, `DP-03`) |
| 4 | Every figure carries a label and a reference (D4, Rule PG-01) |
| 5 | Metadata is one middot-separated line (D1) |
| 6 | Eyebrows are the only uppercase text (Rule TY-03) |
| 7 | No hard-coded structure label appears anywhere (Rule N-06) |
| 8 | No colour, size, radius, or duration is hard-coded — tokens only (Rule T-01) |
| 9 | No component references a Tier 1 primitive token |
| 10 | Elevation is expressed by surface lightness, not shadow (Rule EL-01) |
| 11 | Glass appears only on chrome, never on content (§16.2) |
| 12 | All six applicable states are designed (`DP-06`, §28) |
| 13 | Every error carries a recovery action (Rule ER-01) |
| 14 | Every AI artefact carries `AIGeneratedBadge` (`FR-143`) |
| 15 | Every grounded claim carries a resolvable `CitationChip` (`AIR-002`) |
| 16 | Every interactive target is at least 44 dp with 8 dp separation (Rule AX-08) |
| 17 | Focus is visible on every focusable element (Rule AX-03) |
| 18 | The surface is greyscale-legible (Rule AX-02) |
| 19 | Copy passes the tone floor — no shame, loss-framing, or manufactured urgency (§6.2) |
| 20 | The surface works at 360 dp, at 200% text scale, and offline |

---

## 43. Design Do's and Don'ts

### Do

| Do | Because |
| --- | --- |
| Open every surface on a conclusion | `DP-01`, `PR-09` — the product's category claim depends on it |
| State the evidence beside every claim | `DP-03` — the only thing that makes a mastery estimate acceptable |
| Compress metadata into one middot line | D1 — density without complexity |
| Give every number a reference point | D4 — a raw percentage about a student is anxiety |
| Use the student's own structure labels | `PR-04` — the central product thesis |
| Show partial and low-confidence states honestly | `NFR-014` — honesty is cheaper than recovered trust |
| Make correction cost one tap | `FR-039` — expensive correction stops uploading |
| Close commitment moments with a reassurance line | D5 — the Rohit persona is the ethical centre of gravity |
| Design the empty, offline, and failed states first | `DP-06` — they are where trust is actually decided |
| Test every structure component against "Experiment 7" | Rule N-06 — the Meera test |

### Don't

| Don't | Because |
| --- | --- |
| Add a second accent colour | Rule C-01 — the accent *is* the instruction |
| Colour-code subjects or categories | Rule C-07 — breaks at eight subjects and for colour-blind students |
| Reuse `ai.provenance` for anything | Rule C-06 — provenance must be unambiguous in one exposure |
| Put a shadow on a card | Rule EL-01 — invisible on near-black, smudged when compensated |
| Use glass on content surfaces | Rule GL-01 — contrast and low-end performance |
| Hard-code "Unit" anywhere | Rule N-06 — silently breaks the adaptivity thesis |
| Nest cards | Rule CD-03 — a hierarchy failure wearing a container |
| Ship a spinner for work over one second | Rule LD-03 — skeletons make the same wait feel shorter |
| Use a streak, a countdown to nothing, or a celebration | `RAI-06`, `RAI-07` |
| Show a bare percentage | Rule PG-01 |
| Write "Sorry, something went wrong" | Rule ER-01 |
| Validate an email on the third keystroke | Rule FM-06 |
| Disable zoom | Rule AX-27, WCAG 1.4.4 |
| Put upload inside a menu | Rule N-04, `PRD §22.1` |
| Let the AI answer from general knowledge without a label | `AIR-004`, Rule RP-01 |
| Design at 390 dp and assume 360 works | §10.1 — the beachhead is mid-range Android |

---

## 44. Theme Switching, Handoff, and Token Distribution

### 44.1 Theme switching `[RECOMMENDED]`

Applicable when a light theme ships (§12.7), and specified now so the architecture accommodates it.

| Rule | Detail |
| --- | --- |
| **TH-01** | Default follows the system preference; a manual override persists per account, not per device — a student on a phone and a laptop expects one product. |
| **TH-02** | Switching applies without reload and without a flash of the wrong theme. The theme is resolved before first paint. |
| **TH-03** | The theme control lives in Profile, offering System · Dark · Light, in that order. |
| **TH-04** | Student-supplied thumbnails are theme-neutral and always carry a scrim (§12.6). |
| **TH-05** | No component may branch on theme. If a component needs to know the theme, a semantic token is missing (Rule T-01). |

### 44.2 Design-to-engineering handoff `[RECOMMENDED]`

| Artefact | Owner | Rule |
| --- | --- | --- |
| `packages/design-tokens/` | Design, reviewed by engineering | **The single source of truth.** Figma variables and the token package are generated from one source, never maintained in parallel. |
| Primitive components | Engineering, spec'd by design | Accessibility satisfied here (§18.1) |
| Domain components | Joint | Props encode PRD rules (§18.2) |
| Content catalogue | Design and product, reviewed | The only legal source of insight and progress copy (§6) |
| This document | Design Systems Lead | Amended by pull request with a changelog entry |

**Rule HO-01 — a design that cannot be expressed in tokens is not ready for handoff.** If a mock uses a colour that has no token, either a token is missing or the mock is wrong. Resolve before build, never during.

**Rule HO-02 — component parity is verified across web and mobile.** Any component existing on one platform and not the other is tracked as debt. The two UI packages are two implementations of one specification, never two design systems.

### 44.3 For AI coding agents

`architecture.md` AG-10 makes this repository the specification an AI agent works from. Operating instructions for agents building Avora surfaces:

1. **Read this document, `PRD.md`, and `architecture.md` before generating any UI.** A screenshot is not a specification.
2. **Never introduce a colour, size, radius, duration, or font value.** If a token does not exist, stop and ask.
3. **Never hard-code a structure label.** Rule N-06 is the rule most likely to be violated by pattern-matching from an example, and the most damaging when it is.
4. **Never render an AI artefact without `AIGeneratedBadge`, or a citation without `CitationChip`.** Both are build-enforced (`architecture.md` §7.4); generating around them is a defect, not a workaround.
5. **Never author insight or progress copy.** Take it from the content catalogue.
6. **Produce all six states** (§28) or the component is incomplete.
7. **Verify against the twenty checks in §42** before considering the work done.
8. **When this document and a live screen disagree, raise it** — do not silently follow either. That disagreement is exactly what §47 exists to capture.

---

## 45. Future Scalability

`PR-13` requires every model to accommodate new disciplines, structures, languages and content types without redesign. Six pressure points, and the design decisions taken now to absorb them.

| Pressure | When | Absorbed by |
| --- | --- | --- |
| **New structure labels and depths** | Continuous | Rule N-06. Labels are data; depth is carried by breadcrumb, not indentation. No design change required for a discipline Avora has never seen. |
| **New disciplines** | V2 | No colour-coding (Rule C-07) and no discipline-specific iconography means a Law or Medicine student inherits the identical system. |
| **New languages** | V2 | Message catalogue from commit one; +40% expansion tolerance (Rule AX-23); no text in images. |
| **New artefact types** | Continuous | The six-slot card anatomy (§21.1) and the list row (§24.1) are content-agnostic. A new artefact needs an icon and a metadata line, not a new pattern. |
| **Cross-term continuity** | V2 | Term is already part of the D1 context line and of citation previews (§31.3). Prior-term content needs a visible term marker, not a separate surface. |
| **Voice interaction** | V2 | The scope strip (§30.3) is the model — spoken input inherits the same visible scope contract, so grounding stays legible without a screen. |

**Rule FS-01 — new features extend the catalogue; they do not add vocabularies.** Before designing anything new, find the closest existing pattern and ask what it lacks. Avora's consistency is a small pattern set used often. Every new pattern is a permanent tax on every future screen.

**Rule FS-02 — a light theme, a second brand, and a web-first surface are all token exercises, not redesigns**, provided Rule T-01 holds. Enforcing it is the cheapest long-term investment available to this system.

---
## 46. Glossary and Vocabulary Alignment

### 46.1 The rule

`architecture.md` §32.1 makes the PRD glossary the naming authority for code. This document extends that authority to **every visible string**. When the interface calls a Resource a "file", the product's own concept quietly narrows — and a narrower concept produces narrower features.

### 46.2 Canonical vocabulary

| PRD term | Use in the interface as | Never |
| --- | --- | --- |
| Resource | Resource, or the specific type the student uploaded ("slides", "notes", "photos") | File, document, attachment |
| Structure Unit | The student's own label — Unit, Experiment, Week, Lab, whatever they chose | Folder, section, category, chapter *(unless the student chose it)* |
| Subject | Subject | Course, class, module |
| Academic Term | Term, or the student's own naming ("Semester 5") | Session, period |
| Note | Note | Doc, page |
| Summary | Summary | Overview, abstract |
| Flashcard | Card, Flashcards | Deck item, Q&A |
| Quiz | Quiz | Test, exam *(reserve "exam" for real Academic Events)* |
| Attempt | Attempt | Try, submission |
| Mastery Signal | Displayed as a word scale (§27.2) | Score, grade, mark, rating, level |
| Academic Event | Class, deadline, assessment, lab, exam — the specific type | Event, task, item |
| Study Plan | Plan | Schedule *(reserve "schedule" for the timetable)* |
| Insight | Insight | Tip, alert, notification |
| Concept | Topic *(student-facing)*, Concept *(internal)* | Skill, objective |

### 46.3 Observed divergence `[OBSERVED]`

| Location | Production string | Issue | Recommendation |
| --- | --- | --- | --- |
| Dashboard — Subject cards | "24 files" | Uses `file`, a prohibited term. Also under-describes what Avora holds: extracted content, summaries and derived artefacts, not files. | "24 resources" — or, better for plain language (`NFR-054`), name the types: "24 items". Decide once and apply everywhere. |
| Dashboard — bottom navigation | "Calendar" | Diverges from the Study Dashboard's "Planner" | Standardise on **Planner** (Recommendation N-01) |
| AI Tutor — header | "AI trained on your uploaded resources" | `NFR-043` conflict | "Answers grounded in your uploaded resources" (§47 RE-01) |
| AI Tutor — streak tile | "Keep it alive today" | `RAI-06` loss-framing | Neutral factual qualifier (§47 RE-07) |

**Rule GL-01 — vocabulary changes are made globally in one pass**, never per-screen. A product that says "files" on Home and "resources" in Subjects has two mental models and no glossary.

---

## 47. Recommendation Register

Every recommendation in this document, consolidated. Nothing here invalidates a production interface; all are evolutionary and most are single-line changes.

### 47.1 Priority 1 — requirement conflicts

| ID | Finding | Conflicts with | Current standard | Recommended evolution |
| --- | --- | --- | --- | --- |
| **RE-01** | The AI Tutor header reads *"AI trained on your uploaded resources"*. The mechanism is retrieval grounding, not training. | `NFR-043` (student content must not be used to train third-party models); `PRD §19.3` trust commitment 2; `AIR-001` | The string as shipped | *"Answers grounded in your uploaded resources."* More accurate, more differentiating, and consistent with the composer's existing *"Answers stay inside your semester syllabus."* |
| **RE-02** | Zoom is disabled on all five surfaces (`user-scalable=no`, `maximum-scale=1`). | `NFR-051` (WCAG 2.1 AA); WCAG SC 1.4.4 Resize Text | Zoom locked | Remove the lock. The likely motivation — iOS auto-zoom on focused inputs — is fully addressed by Rule TY-05 (16 sp minimum input text). This is a two-line change that closes an AA failure. |

### 47.2 Priority 2 — consistency and trust

| ID | Finding | Current standard | Recommended evolution |
| --- | --- | --- | --- |
| **RE-03** | Two background values in production: `#080D11` (four surfaces) and `#0A0D10` (Dashboard). | Both shipping | Canonicalise one as `surface.base` and apply to all five, including the `theme-color` meta and the native status-bar colour. Resolve in VB-01. |
| **RE-04** | Installable-app metadata (`mobile-web-app-capable`, app title, translucent status bar) appears on the Dashboard only. | 1 of 5 | Apply the full set consistently across all web surfaces, or remove it deliberately if the Expo client is the intended installable target (`architecture.md` AD-02). Either is defensible; inconsistency is not. |
| **RE-05** | Attendance is a complete, well-designed production module with no PRD requirement identifier. | Shipping | Raise a PRD amendment (Recommendation A-01, §40.1). `NFR-063` requires every shipped capability to trace to an identifier. The design itself needs no change — §40.2 records it as exemplary. |
| **RE-06** | The interface says "files" where the PRD says Resource. | "24 files" | Global vocabulary pass (§46.3). |
| **RE-07** | The Study Streak tile reads *"Keep it alive today"*. | Shipping | Retain the count as a neutral fact; remove the imperative. `RAI-06` prohibits loss-framing; `RAI-07` prohibits engagement mechanics that exploit anxiety. |
| **RE-08** | Bottom navigation slot 4 is "Calendar" on one build and "Planner" on another. | Two labels | Standardise on **Planner** (Recommendation N-01). |

### 47.3 Priority 3 — gaps to specify before the next build

| ID | Gap | Recommendation |
| --- | --- | --- |
| **RE-09** | The Study Dashboard uses a text loading state. | Replace with a layout-matching skeleton (§28.2). |
| **RE-10** | No search entry point exists anywhere in the production navigation, though `FR-110`–`FR-114` are V1. | Reserve the header affordance now (Recommendation N-03), before the navigation hardens. |
| **RE-11** | Empty, offline, partial, and error states were not observable on any surface. | Specify and build them per §28 before the next feature ships. These are where trust is decided and they are the most commonly deferred work in any product. |
| **RE-12** | "Confirm Password" on Sign Up. | Remove; retain the existing Show-password control (§34.3 RE-A). |
| **RE-13** | Production uses email + password; the architecture specifies email OTP / magic link. | Product decision required; the design system accommodates either (§34.3 RE-B). |

### 47.4 Navigation recommendations

| ID | Recommendation | Section |
| --- | --- | --- |
| **N-01** | Slot 4 is **Planner**, not Calendar | §8.2 |
| **N-02** | Study remains a destination reached from context, not a tab — recorded as a deliberate choice | §8.2 |
| **N-03** | Search becomes a persistent header affordance, not a sixth tab | §8.2 |
| **A-01** | Raise a PRD amendment for Attendance | §40.1 |

---

## 48. Open Questions

Questions this document cannot resolve alone. Each needs an owner and a decision before Status moves from Draft.

| ID | Question | Owner | Why it matters |
| --- | --- | --- | --- |
| **DQ-01** | Which background value is canonical — `#080D11` or `#0A0D10`? | Design | Blocks token finalisation (VB-01) |
| **DQ-02** | What is the confirmed accent hue, and does it meet 4.5:1 on `surface.base` with a dark foreground on fill? | Design + Engineering | Rule C-01 and every button state depend on it |
| **DQ-03** | Does a light theme have a target release, or is dark-only the stated position? | Product | Determines whether §12.7's preconditions are enforced now |
| **DQ-04** | Is the primary client the Expo app or the web build? The architecture says Expo (AD-02, subject to AOQ-02); the observed interfaces are web. | Product + Engineering | Determines which platform's constraints are the design target |
| **DQ-05** | What is the classification confidence threshold at which Avora asks rather than files? (`PRD OQ-02`) | Product | Determines how often §33.4's medium and low states appear — the difference between "filing didn't happen" and constant interruption |
| **DQ-06** | Does Attendance become a PRD-tracked capability, or is it removed? | Product | §40, RE-05 |
| **DQ-07** | Email + password, or email OTP / magic link? | Product | §34.3 RE-B |
| **DQ-08** | Should readiness percentage be visible on the Subjects list, given `FR-121`'s guidance-not-grading framing? Production shows bare figures (72, 54, 81, 38, 63) without qualifiers, which is currently the one place Rule PG-01 is not met. | Product + Design | The most sensitive number-display decision in the product |

---

## 49. Changelog

| Version | Date | Status | Summary |
| --- | --- | --- | --- |
| 1.0 | 2026-08-01 | Draft | Initial Design System and UX Specification. Reverse-engineered from the five approved production interfaces and both upstream documents. Establishes the token architecture, five signature devices, component catalogue, state system, AI interaction contract, accessibility standard, and a register of thirteen recommendations and eight open questions. Twelve token values require verification against source (§0.5) before promotion to Approved. |

---

## Appendix A — Requirement Traceability

Where PRD and Architecture requirements are realised in this document.

| Requirement | Realised in |
| --- | --- |
| `PR-04` Adapt, never impose | §8.4 Rule N-06, §24.3, §35.2, §45 |
| `PR-06` Grounded intelligence | Device D3, `DP-03`, §29, §31 |
| `PR-07` Mobile-first | §10, `DP-05`, §41.4 |
| `PR-08` Simplicity | `DP-02`, Rule C-01, Rule BT-01 |
| `PR-09` Proactive over reactive | `DP-01`, §7.1 Tier 2, §30.1, §32 |
| `PR-11` Accessibility | §41 in full; §12.4; §18.1 |
| `FR-014`–`FR-020` Structure | §8.4, §24.3, §35.2 |
| `FR-030`–`FR-042` Ingestion | §33 |
| `FR-039` Confidence + correction | §33.4, §26.3 `ConfidenceIndicator` |
| `FR-050`–`FR-060` Tutor | §30, §31, §38 |
| `FR-052`, `AIR-002`, `AIR-006` Citations | §31.3 |
| `FR-053`, `AIR-003` Insufficiency | §31.1 |
| `FR-054`, `AIR-004` Labelled general knowledge | §31.1, Rule RP-01 |
| `FR-056`, `AIR-009` Depth | §31.4 |
| `FR-121` Mastery as guidance | §27.2 `MasteryMeter`, DQ-08 |
| `FR-122`–`FR-125` Insights | §21.2 `InsightCard`, Rule CD-04, §6.2 |
| `FR-140`–`FR-144` Privacy and control | §25.3, §31.2 |
| `FR-143`, `AIR-010`, `RAI-01` AI labelling | §31.2, Rule C-06 |
| `NFR-002` 100 ms response | §17.1, §17.2 |
| `NFR-003` Streaming | §28.2 Rule LD-05, §30.5 |
| `NFR-013`, `NFR-014` Honest failure | §28.6 |
| `NFR-051` WCAG 2.1 AA | §41 |
| `NFR-052` Low-end devices | §16.2, §17.1, Rule AX-29 |
| `NFR-053` Offline degradation | §28.5 |
| `NFR-054` Plain language | §6, §46 |
| `NFR-055` Three-step workflows | §8.3 |
| `RAI-06`, `RAI-07` Tone and wellbeing | §6.2, §27, §28.7 |
| `architecture.md` §7.4 Enforced components | §18.2 |
| `architecture.md` §19.2 Resource states | §28.4 |
| `architecture.md` §27 Offline | §28.5 |

---

## Appendix B — New Surface Checklist

For any new Avora screen, before review.

**Foundations**
- [ ] Expressible in the four-tier model (§7.1), with Tier 2 above the fold
- [ ] Depth from Home declared and within budget (§8.3)
- [ ] Works at 360 × 640 dp
- [ ] Uses only Tier 2 semantic tokens

**Patterns**
- [ ] Uses devices D1 and D2; D3 if it makes a claim; D4 if it shows a number; D5 if it asks for commitment or reports a shortfall
- [ ] Exactly one primary action visible
- [ ] Every card follows the six-slot anatomy
- [ ] No new pattern introduced without promoting it to a domain component

**Structure adaptivity**
- [ ] No hard-coded structure label
- [ ] Renders correctly at zero, one, and three levels of depth
- [ ] Passes the Meera test — works for "Experiment 7"

**States**
- [ ] Loading (skeleton), empty, partial, offline, error, limit-reached all designed
- [ ] Every error carries a recovery action

**AI**
- [ ] `AIGeneratedBadge` on every AI artefact, including export
- [ ] `CitationChip` on every grounded claim
- [ ] Scope visible before input
- [ ] Insufficiency and general-knowledge states designed
- [ ] Report affordance present

**Accessibility**
- [ ] All contrast pairs verified against the actual background used
- [ ] 44 dp targets, 8 dp separation
- [ ] Visible focus, logical order, trap and restore in overlays
- [ ] Greyscale-legible
- [ ] Readable at 200% scale
- [ ] Screen-reader labels for every icon-only control and every figure

**Copy**
- [ ] Passes the tone floor (§6.2)
- [ ] Uses canonical vocabulary (§46.2)
- [ ] Insight and progress copy taken from the reviewed catalogue

---

*End of document.*
