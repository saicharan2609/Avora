# Avora — Product Requirements Document

**Product:** Avora — The AI Academic Operating System
**Document type:** Product Requirements Document (PRD)
**Status:** Approved baseline — living document
**Version:** 1.0
**Owner:** Founding Product Manager
**Audience:** Founders, Product Managers, Engineers, Designers, AI coding agents, Investors, Future employees
**Canonical path:** `docs/PRD.md`

---

## How To Read This Document

This PRD is the single source of truth for Avora. It defines *what* Avora is, *who* it serves, *why* it must exist, and *what it must do*. It deliberately does not define *how* it is implemented; architecture, schemas, infrastructure, and technology selection live in downstream documents that must trace back to the requirement identifiers defined here.

Conventions used throughout:

| Convention | Meaning |
| --- | --- |
| `FR-###` | Functional requirement. Testable, verifiable behaviour the product must exhibit. |
| `NFR-###` | Non-functional requirement. Quality attribute constraint. |
| `AIR-###` | AI-specific requirement governing model behaviour, grounding, or safety. |
| `PR-###` | Product principle. Used to arbitrate decisions when requirements conflict. |
| **MUST** | Mandatory. Absence is a release blocker. |
| **SHOULD** | Strongly expected. Deviation requires documented justification. |
| **MAY** | Optional. Included for directional clarity. |
| V0 / V1 / V2 / V3 | Release horizon in which a requirement is expected to ship. |

Every downstream artifact — architecture documents, design specifications, engineering tickets, AI agent task briefs, QA plans — **MUST** reference the identifiers defined here. A feature that cannot be traced to a requirement identifier in this document is out of scope until this document is amended.

---

## 1. Executive Summary

College students today operate the most information-dense period of their lives using tools that were never designed for them. Lecture slides live in a messaging app. Assignment briefs live in email. Handwritten notes live in a camera roll. Past-year question papers live in a shared drive nobody maintains. Timetables live on a photograph of a printed sheet. The result is not merely disorganisation — it is a persistent cognitive tax that consumes the hours students should be spending learning.

Avora is an AI-powered Academic Operating System for college students. Students bring the raw material of their semester — PDFs, presentation decks, lecture notes, assignments, timetables, photographs of whiteboards and handwritten pages — and Avora assembles it into a living, structured, intelligent workspace that mirrors their actual academic reality. It learns the student's college, branch, semester, subject list, and the specific way their institution organises knowledge, then adapts itself to that structure rather than imposing a foreign one.

On top of that structured foundation, Avora delivers an AI layer that is not a bolt-on chat window but the product's central nervous system: an AI Tutor grounded in the student's own materials, automatically generated summaries and smart notes, flashcards and quizzes derived from actual syllabus content, an adaptive study planner that understands what is due and what is weak, and proactive insights that surface risk before it becomes failure.

Avora's initial launch targets undergraduate engineering students in India — a market of exceptional scale, acute pain, high mobile penetration, and near-universal exposure to unstructured academic content distribution. The long-term ambition is broader: to become the academic operating system used by students worldwide, across disciplines, degrees, and lifelong learning.

The strategic wedge is structural adaptivity. Competing products either offer generic AI chat with no academic context, or rigid course-management structures that no real college matches. Avora's defensibility compounds over time: the longer a student uses it, the richer their academic graph becomes, and the more accurate, personal, and irreplaceable the AI layer grows. Switching cost is not lock-in through friction; it is lock-in through accumulated understanding.

**The one-sentence definition of Avora:** *Avora is the operating system for a student's academic life — it ingests everything they are given, understands the structure of their specific programme, and uses AI to help them learn, plan, revise, and perform.*

---

## 2. Vision

**Vision statement:** Every student in the world deserves a personal academic system that understands them — their institution, their syllabus, their materials, their pace, and their goals — and works for them continuously, without ever asking them to reorganise their life around software.

Avora exists to make the structural overhead of education disappear. Ten years from now, the idea that a student should manually name folders, hunt through group chats for a unit-three PDF, or build a revision plan from scratch the week before exams should feel as archaic as manually indexing a library card catalogue.

The end state is a product where:

- A student's entire academic history — every subject, resource, note, assessment, and insight — is continuous across semesters, degrees, and institutions.
- The AI knows the student's learning trajectory well enough to anticipate need rather than respond to request.
- Structural diversity across institutions worldwide is a first-class feature, not an integration problem.
- Academic performance improves measurably and demonstrably for students who use the product.

---

## 3. Mission

**Mission statement:** Build an AI academic operating system that adapts to every student's institution, understands every resource they bring to it, and helps them learn more in less time — securely, privately, and on the device they already carry.

The mission decomposes into four durable commitments:

1. **Adapt, never impose.** Avora conforms to the student's academic structure. The student never conforms to Avora's.
2. **Ground everything.** AI output is anchored in the student's actual materials and syllabus, not in generic model knowledge.
3. **Reduce time-to-value to minutes.** A student must feel meaningful benefit within the first session, not the third week.
4. **Earn trust permanently.** Academic material is personal and sometimes institutionally sensitive. Privacy and security are product features, not compliance chores.

---

## 4. Problem Statement

### 4.1 The core problem

College students are given large volumes of unstructured, inconsistently formatted, multi-source academic material and are expected to independently organise, comprehend, retain, and be assessed on it — with no system designed for that job.

### 4.2 Problem decomposition

**P1 — Fragmentation of academic material.**
Course material arrives through messaging groups, email attachments, institutional portals, shared cloud drives, printed handouts, peer-to-peer file transfers, and photographs of physical boards. There is no canonical location. Students routinely cannot find material they know they possess.

**P2 — Structural mismatch between institutions and software.**
Institutions organise curricula in fundamentally different ways: units, modules, chapters, weeks, programs, experiments, practicals, projects, labs, and bespoke local conventions. Existing software imposes a single opinionated hierarchy. Students either abandon the tool or maintain a lossy translation between their real syllabus and the tool's model — which is itself an ongoing cost.

**P3 — Format heterogeneity.**
A single subject may involve typed PDFs, scanned PDFs, slide decks, handwritten notes photographed at an angle, spreadsheets of lab readings, and recorded lecture material. Extracting usable knowledge across these formats is manual and lossy.

**P4 — The comprehension-to-retention gap.**
Reading material is not learning it. The evidence-backed practices that produce retention — active recall, spaced repetition, self-testing, elaboration — require material preparation effort that most students cannot sustain across five to eight concurrent subjects.

**P5 — Planning under uncertainty.**
Students must allocate finite time across concurrent subjects, assignments, labs, internals, and end-semester examinations, with imperfect knowledge of their own weak areas. Planning is done ad hoc, usually reactively, usually too late.

**P6 — Generic AI is contextually blind.**
General-purpose AI assistants have no knowledge of the student's syllabus, their institution's emphasis, their assessment format, their prior coverage, or their uploaded materials. Answers are plausible but frequently off-syllabus, mis-scoped, or unusable for assessment preparation. The student bears the burden of supplying context on every single interaction.

**P7 — Loss of continuity.**
Each semester begins from zero. Nothing carries forward. Prerequisite knowledge from prior semesters, previously generated notes, and past performance patterns are all discarded.

### 4.3 Cost of the problem

For the student: hours per week lost to search and reorganisation, avoidable underperformance in assessments, elevated stress concentrated around examination periods, and inefficient study effort directed at already-strong areas.

For the market: an enormous population performing identical unpaid manual labour, with no incumbent solution that addresses the problem end-to-end.

### 4.4 Why now

Four conditions have converged that did not previously coexist:

1. **Multimodal AI has become viable and affordable.** Reliable extraction and comprehension of scanned documents, handwritten notes, slide decks, and diagrams is now practical at consumer price points.
2. **Retrieval-grounded generation is production-ready.** AI can be reliably constrained to a student's own corpus, which converts a novelty chat product into a trustworthy academic tool.
3. **Mobile-first student behaviour is universal.** In target markets, the phone is the primary and often only computing device, and students are already habituated to receiving academic material through it.
4. **Student expectations have shifted.** AI assistance in study workflows is now normalised. The question has moved from *whether* students will use AI for learning to *which* product organises that usage.

---

## 5. Opportunity

### 5.1 Market framing

Avora addresses the global higher-education student population, entered through a deliberately narrow initial beachhead.

| Layer | Definition | Characteristics |
| --- | --- | --- |
| **Beachhead** | Undergraduate engineering students in India | Large concentrated population; semester-based assessment; heavy unstructured material distribution; mobile-first; high willingness to adopt exam-outcome tools |
| **Expansion** | All Indian higher-education students across disciplines | Same structural problem, different content domains |
| **Scale** | Global higher education, professional programmes, competitive examination aspirants, lifelong learners | Requires multi-language, multi-structure, multi-curriculum support |

### 5.2 Why the beachhead is correct

- **Acute, frequent, and universal pain.** Engineering programmes are content-dense, multi-subject, continuously assessed, and taught with heavily unstructured material distribution.
- **Structural diversity is maximal.** Indian engineering curricula vary widely across universities, autonomous institutions, and affiliated colleges. A product that succeeds here has already proven its adaptivity thesis in the hardest case.
- **High mobile penetration and low desktop dependency.** Aligns naturally with a mobile-first product principle.
- **Dense organic distribution.** Students cluster into classes, branches, hostels, and peer groups with high-frequency communication. Product value spreads laterally at very low acquisition cost.
- **Demonstrable outcome linkage.** Examination outcomes are discrete, dated, and personally consequential — creating clear moments where the product's value is felt, and clear seasonal willingness to pay.

### 5.3 Strategic opportunity beyond the initial product

The academic graph Avora builds — subjects, structural units, resources, concepts, mastery signals, and assessment history — is a durable data asset that unlocks future value: cross-semester continuity, peer-level benchmarking, institution-level insight products, and personalised learning paths that improve as the corpus grows. No feature in the initial release should be designed in a way that compromises the coherence of this graph.

---

## 6. Product Positioning

### 6.1 Positioning statement

**For** college students who are overwhelmed by unstructured academic material across multiple subjects,
**Avora is** an AI academic operating system
**that** organises everything they are given into their institution's own structure and turns it into personalised tutoring, notes, revision, and planning,
**unlike** generic AI chat assistants that lack academic context, or note-taking apps that require manual organisation and offer no intelligence,
**because** Avora adapts to each student's academic structure and grounds every AI response in their actual syllabus and uploaded materials.

### 6.2 Category definition

Avora deliberately creates and occupies the category of **Academic Operating System**. This is a positioning decision with product consequences: an operating system is expected to be persistent, foundational, structural, and to host the user's entire workload — not to be a single-purpose utility opened occasionally.

### 6.3 What Avora explicitly is not

| Not this | Why the distinction matters |
| --- | --- |
| A note-taking app | Notes are an output of Avora's intelligence, not the product's centre. Avora generates and enriches notes rather than merely storing them. |
| An AI chatbot | Chat is one interface into a structured system. Removing chat would leave a functioning product; removing the academic graph would not. |
| A generic productivity or to-do app | Tasks derive from academic structure and assessment reality, not from user-authored lists. |
| A content library or course marketplace | Avora hosts the student's own institutional material. It does not sell courses or replace instruction. |
| An academic integrity workaround | Avora is explicitly designed to support learning and is governed by responsible-use principles defined in Section 20. |

### 6.4 Brand promise

*Bring us your semester. We will make sense of it.*

---

## 7. Target Market

### 7.1 Primary segment (V0 / V1)

Undergraduate engineering students in India, semesters 1 through 8, across affiliated, autonomous, and deemed institutions. Predominantly mobile-first, price-sensitive, high-frequency smartphone users, receiving academic material through informal digital channels.

### 7.2 Secondary segments (V2)

- Non-engineering Indian undergraduates: science, commerce, arts, management, architecture, pharmacy
- Postgraduate students in taught programmes
- Diploma and polytechnic students

### 7.3 Tertiary segments (V3 and beyond)

- Medical, law, and MBA students, each requiring domain-specific structural and content handling
- Competitive examination aspirants requiring syllabus-anchored, high-volume revision workflows
- International higher education, requiring multi-language and alternative credit-structure support
- Lifelong and professional learners with certification objectives

### 7.4 Explicit non-targets for initial release

- K-12 school students (different structural model, guardian consent requirements, distinct safety obligations)
- Institutional administrators as primary buyers (Avora launches bottom-up, student-first)
- Faculty as content authors

### 7.5 Buyer and user

For the initial release, the user and the buyer are the same person: the student. Payment may originate from a parent or guardian, and the product **SHOULD** accommodate third-party payment without requiring account sharing. Institutional and campus-level licensing is a deliberate later motion and **MUST NOT** distort initial product decisions.

---

## 8. User Personas

### Persona 1 — Aarav, the Overloaded Core Student

**Profile.** 19 years old, second-year Computer Science undergraduate at an affiliated engineering college. Seven subjects, two labs, continuous internal assessments.
**Behaviour.** Receives all material through class messaging groups. Phone storage full of unnamed PDFs and screenshots. Studies primarily in concentrated bursts before internals and end-semester exams.
**Goals.** Pass comfortably, ideally score well, without sacrificing the rest of his life.
**Frustrations.** Cannot find material when he needs it. Does not know what to prioritise. Starts too late and then cannot triage.
**What success looks like.** He opens Avora during exam week and immediately knows what to study, in what order, from what material.
**Why Avora wins him.** Time-to-relief. The first upload session converts chaos into structure.

### Persona 2 — Sneha, the High-Performance Optimiser

**Profile.** 20 years old, third-year Electronics undergraduate, consistently top-quartile, targeting placements and higher studies.
**Behaviour.** Already systematic. Maintains her own notes. Actively seeks tools that compound her advantage.
**Goals.** Depth of understanding, retention across semesters, efficiency gains that free time for projects and placement preparation.
**Frustrations.** Manual creation of revision materials is her largest time sink. Her prior-semester work is effectively lost.
**What success looks like.** Avora produces flashcards, quizzes, and summaries at a quality she would have produced herself, in a fraction of the time.
**Why Avora wins her.** Quality and continuity. She is the highest-value advocate and the strongest signal for retention.

### Persona 3 — Rohit, the Recovery Student

**Profile.** 21 years old, has backlog subjects to clear alongside current semester load.
**Behaviour.** Low confidence, high anxiety, avoidant of material he finds difficult, inconsistent study patterns.
**Goals.** Clear pending subjects; stop falling further behind.
**Frustrations.** Does not know where to begin. Generic study advice does not account for his actual gaps.
**What success looks like.** A concrete, achievable, non-judgemental plan that starts where he actually is.
**Why Avora wins him.** Proactive planning and non-punitive framing. This persona is the product's ethical centre of gravity — tone and pressure design decisions **MUST** be evaluated against his experience.

### Persona 4 — Meera, the Lab and Project Student

**Profile.** 20 years old, Mechanical undergraduate with heavy practical and project components.
**Behaviour.** Content is dominated by experiments, lab manuals, readings, viva preparation, and project documentation rather than lecture slides.
**Goals.** Manage experiment records, prepare for vivas, keep project material coherent.
**Frustrations.** Study tools assume lecture-based, chapter-structured content that does not describe her programme.
**What success looks like.** Avora represents "Experiment 7" as naturally as it represents "Unit 3".
**Why Avora wins her.** She is the proof case for structural adaptivity. If Avora cannot serve Meera, the core thesis is unproven.

### Persona 5 — Karthik, the Class Resource Hub

**Profile.** 20 years old, the student in every class who collects, renames, and redistributes material for everyone.
**Behaviour.** High-effort curator, socially central, informally trusted.
**Goals.** Reduce his own manual overhead; retain his role as the person with the good material.
**What success looks like.** He organises once in Avora and shares structure with peers.
**Why Avora wins him.** He is the primary organic distribution vector. Growth mechanics (Section 28) **MUST** be designed around this persona.

### Anti-persona — The Integrity Shortcut Seeker

A user whose primary objective is to have graded work produced for them without learning. Avora **MUST NOT** optimise for this user. Responsible-use design (Section 20) exists to make the product unattractive for this purpose while remaining fully useful for legitimate learning.

---

## 9. Jobs To Be Done

Framed as functional, emotional, and social jobs the student hires Avora to perform.

### Functional jobs

| ID | Job statement |
| --- | --- |
| JTBD-01 | When I receive academic material from many places, help me put all of it in one place that reflects how my course is actually organised, so I can find anything instantly. |
| JTBD-02 | When I have a dense document I do not have time to read fully, help me extract what actually matters, so I can understand it in the time I have. |
| JTBD-03 | When I do not understand a concept, help me get an explanation anchored in my own syllabus and material, so I learn the version I will be assessed on. |
| JTBD-04 | When I need to retain material, help me practise it actively without building the practice material myself. |
| JTBD-05 | When I have limited time and many competing subjects, help me decide what to study now, so I stop guessing. |
| JTBD-06 | When an assessment is approaching, help me prepare specifically for it, in the format it will take. |
| JTBD-07 | When I finish a semester, help me carry forward what I learned, so I am not starting from zero next term. |
| JTBD-08 | When my performance is slipping in an area, tell me before it becomes a crisis. |

### Emotional jobs

| ID | Job statement |
| --- | --- |
| JTBD-09 | Help me feel in control of my semester instead of behind it. |
| JTBD-10 | Reduce the anxiety of not knowing whether I am prepared. |
| JTBD-11 | Let me trust that nothing important is lost. |

### Social jobs

| ID | Job statement |
| --- | --- |
| JTBD-12 | Let me be the person in my class who has everything organised. |
| JTBD-13 | Let me share good material with my peers without effort. |

---

## 10. User Stories

User stories are grouped by capability area. Each maps to functional requirements in Section 16.

### Onboarding and academic setup

- As a new student, I want to specify my college, branch, and current semester so that Avora understands my academic context from the first session.
- As a new student, I want my subjects to be suggested automatically based on my institution and programme so that I do not type them all manually.
- As a student whose institution is unknown to Avora, I want to add my college and subjects manually so that I am never blocked from using the product.
- As a student, I want to choose how my subjects are internally structured — units, modules, chapters, experiments, weeks, or my own labels — so that Avora matches my actual syllabus.
- As a student, I want to upload my timetable as an image or document and have Avora read it, so that my schedule is set up without manual entry.

### Resource ingestion and organisation

- As a student, I want to upload multiple files at once so that I can set up an entire subject in a single action.
- As a student, I want Avora to automatically determine which subject and structural unit an uploaded file belongs to so that I do not have to file it manually.
- As a student, I want to correct Avora's placement of a file so that mistakes are cheap to fix.
- As a student, I want to photograph handwritten notes and have them become searchable text so that my physical notes join my digital system.
- As a student, I want to search across every resource I have ever uploaded so that I can find any concept instantly.

### AI Tutor

- As a student, I want to ask questions about a specific document so that I get answers about the material I am actually studying.
- As a student, I want every AI answer to cite the source material it came from so that I can verify it and read further.
- As a student, I want the AI to tell me when my materials do not contain the answer so that I am never misled.
- As a student, I want to ask follow-up questions in context so that I can work through a concept progressively.
- As a struggling student, I want explanations at different depths so that I can start simple and go deeper.

### Notes and summaries

- As a student, I want an automatic summary of any uploaded document so that I can triage what to read.
- As a student, I want AI-generated structured notes for a unit so that I have a revision artifact without writing one.
- As a student, I want to edit AI-generated notes so that the final artifact is mine.
- As a student, I want notes to link back to their source resources so that I can always reach the original.

### Active recall and assessment

- As a student, I want flashcards generated from my material so that I can practise recall immediately.
- As a student, I want flashcards to resurface on a spaced schedule so that I retain material over the semester.
- As a student, I want quizzes generated at a chosen difficulty and format so that I can simulate my actual assessments.
- As a student, I want to see which topics I answer incorrectly so that I know where to focus.

### Planning

- As a student, I want a study plan generated from my subjects, deadlines, and weak areas so that I do not have to design one.
- As a student, I want my plan to adapt when I fall behind so that it stays realistic instead of becoming discouraging.
- As a student, I want to see what is due soon across all subjects in one place so that nothing surprises me.

### Insights and continuity

- As a student, I want to see where my coverage is weakest so that I can correct course early.
- As a returning student, I want my previous semesters preserved and searchable so that prerequisite knowledge remains available.

### Trust and control

- As a student, I want to delete any resource or my entire account and have it genuinely removed so that I retain control over my data.
- As a student, I want to know what is used to personalise my experience so that I can trust the product.

---

## 11. Goals

### 11.1 Product goals

| ID | Goal | Rationale |
| --- | --- | --- |
| G-01 | A student reaches a structured, populated workspace within ten minutes of first opening Avora | Time-to-value determines activation and is the strongest predictor of retention |
| G-02 | Avora correctly represents any institution's academic structure without forcing a standard | Core thesis of the product |
| G-03 | AI responses are grounded in the student's own materials with verifiable citations | Trust is the precondition for daily use |
| G-04 | Students use Avora throughout the semester, not only before examinations | Determines whether Avora is an operating system or a seasonal utility |
| G-05 | Academic continuity persists across semesters | Compounding value and long-term defensibility |
| G-06 | The product is fully usable on a mid-range mobile device on an unreliable network | Reflects the real conditions of the target market |

### 11.2 Business goals

| ID | Goal |
| --- | --- |
| G-07 | Establish a sustainable freemium model with unit economics positive at the individual subscriber level |
| G-08 | Achieve organic-dominant acquisition within the beachhead segment |
| G-09 | Demonstrate measurable retention across at least two consecutive semesters |
| G-10 | Build a defensible academic-structure dataset covering the beachhead market |

### 11.3 Explicitly out-of-scope goals for V0 and V1

Institutional sales, faculty-facing tooling, content marketplace revenue, and social networking features are not goals for the initial releases.

---

## 12. Non-Goals

Non-goals are decisions, not omissions. Each **MUST** be revisited only through explicit amendment of this document.

| ID | Non-goal | Reasoning |
| --- | --- | --- |
| NG-01 | Avora will not author, sell, or license educational course content | Avora's value is in the student's own material, not in competing with content publishers |
| NG-02 | Avora will not replace institutional learning management systems | Avora is student-owned and student-controlled, deliberately independent of institutional systems |
| NG-03 | Avora will not become a social network | Sharing is functional and scoped; feeds, followers, and public profiles are excluded |
| NG-04 | Avora will not produce work for direct submission as graded output | Responsible-use principle; see Section 20 |
| NG-05 | Avora will not require desktop use for any core workflow | Mobile-first is a hard constraint, not a preference |
| NG-06 | Avora will not require institutional partnership or approval to function | Bottom-up adoption is a strategic requirement |
| NG-07 | Avora will not sell, rent, or broker student personal data | Non-negotiable and permanent |
| NG-08 | Avora will not launch live tutoring, human marketplaces, or video conferencing | Out of category and operationally distinct |
| NG-09 | Avora will not gamify with mechanics that manufacture anxiety or punish absence | Wellbeing principle; streak-shaming and loss-framing are prohibited |

---

## 13. Product Principles

Principles are decision-making tools. When two requirements conflict, the higher-precedence principle wins.

| ID | Principle | Operational meaning | Precedence |
| --- | --- | --- | --- |
| PR-01 | **Student-first** | Every decision is evaluated by whether it improves the student's academic outcome or reduces their effort. Growth mechanics never override student interest. | 1 |
| PR-02 | **Privacy-first** | Student data is used to serve that student. Collection is minimised, purpose is explicit, deletion is real and complete. | 2 |
| PR-03 | **Security-first** | Least privilege by default. Every resource access is authorised. Security is designed in, never retrofitted. | 3 |
| PR-04 | **Adapt, never impose** | The product conforms to the institution's structure. Any feature requiring a fixed universal hierarchy is rejected. | 4 |
| PR-05 | **AI-first** | AI is the core experience. Features are designed assuming intelligence, not augmented with it afterwards. | 5 |
| PR-06 | **Grounded intelligence** | AI output is anchored in the student's materials and syllabus, cites sources, and admits uncertainty. | 6 |
| PR-07 | **Mobile-first** | Every core workflow is complete and comfortable on a mid-range phone. Desktop is an enhancement. | 7 |
| PR-08 | **Simplicity** | Complexity is absorbed by the system, never delegated to the student. Default paths require zero configuration. | 8 |
| PR-09 | **Proactive over reactive** | The product surfaces what matters before it is asked. Value does not require the student to know what to request. | 9 |
| PR-10 | **Personalisation** | The product improves for each individual with use. Generic experiences are a failure state. | 10 |
| PR-11 | **Accessibility** | Usable regardless of device quality, network condition, language proficiency, or ability. | 11 |
| PR-12 | **Reliability** | Data is never silently lost. Failures are visible, recoverable, and honest. | 12 |
| PR-13 | **Scalability and extensibility** | Every model must accommodate new disciplines, structures, languages, and content types without redesign. | 13 |
| PR-14 | **Production readiness from day one** | There is no prototype tier of quality. Anything shipped meets the non-functional requirements in Section 17. | 14 |
| PR-15 | **Responsible AI** | The product supports learning, discloses AI involvement, and refuses to be an integrity-evasion tool. | 15 |

---

## 14. Core Concepts and Domain Model

This section defines the conceptual vocabulary of Avora. It is normative: all downstream documents, interfaces, and AI agent instructions **MUST** use these terms with these meanings. This is a product-level conceptual model, not a database schema.

### 14.1 Entity definitions

| Entity | Definition | Key characteristics |
| --- | --- | --- |
| **Student** | The individual user and owner of all data in their workspace | Sole authority over their data; identity persists across semesters and institutions |
| **Institution** | The college or university the student attends | May be recognised (in Avora's structure library) or student-defined |
| **Programme** | The degree and branch combination, e.g. B.Tech Computer Science | Determines expected subject sets and duration |
| **Academic Term** | A bounded period of study, most commonly a semester | Has start and end dates, a subject set, and an assessment calendar |
| **Subject** | A course the student is enrolled in during a term | Owns structure, resources, notes, assessments, and progress |
| **Structure Unit** | A named subdivision of a Subject | Deliberately generic; see 14.2 |
| **Resource** | Any student-provided artifact: document, deck, image, note file, or scan | Belongs to a Subject and optionally to a Structure Unit |
| **Extracted Content** | Machine-readable content derived from a Resource | Includes text, structure, figures, and metadata |
| **Concept** | A discrete topic identified within a Subject | Links resources, notes, questions, and mastery signals |
| **Note** | A student-owned written artifact, AI-generated, student-authored, or co-created | Always editable; always traceable to sources when AI-generated |
| **Summary** | A condensed representation of one or more Resources | Derived artifact, regenerable |
| **Flashcard** | An atomic recall item with a prompt and an answer | Linked to a Concept and a source Resource |
| **Quiz** | A generated assessment composed of questions in a chosen format | Linked to Subject and Structure Units |
| **Attempt** | A record of a student's engagement with a Quiz or Flashcard review | Primary input to mastery estimation |
| **Mastery Signal** | An estimate of the student's command of a Concept | Derived, probabilistic, never presented as a grade |
| **Academic Event** | A dated obligation: class, assignment deadline, internal assessment, lab, examination | May be extracted from a timetable or entered manually |
| **Study Plan** | A time-allocated sequence of study actions across Subjects | Adaptive; regenerated as reality changes |
| **Insight** | A proactive, evidence-backed observation surfaced to the student | Must be actionable and must cite its basis |

### 14.2 The Adaptive Structure Model

This is the single most important design commitment in the product.

A **Structure Unit** is a generic, recursive, student-labelled container. Avora **MUST NOT** encode any fixed hierarchy such as "chapter within unit within subject".

Requirements of the model:

- **Label-agnostic.** The unit's type label is data, not schema. Supported labels include Unit, Module, Chapter, Topic, Week, Experiment, Practical, Lab, Project, Program, Assignment Set, Part, Section, and any student-authored label.
- **Depth-flexible.** A Subject may have zero levels of internal structure (a flat resource pool), one level, or several. Both a flat subject and a deeply nested one are valid, first-class states.
- **Heterogeneous within a student's workspace.** A student may simultaneously have one Subject organised into Units, another into Experiments, and another with no structure at all.
- **Mutable without loss.** Renaming a structure type, changing depth, splitting, or merging units **MUST** preserve all associated resources, notes, flashcards, and progress.
- **Institution-informed but student-owned.** Avora may propose a structure based on the institution and programme, but the student's choice is always authoritative and always overridable.

**Structure Templates.** Avora maintains a library of common structures by institution and programme, contributed passively by usage patterns and curated internally. Templates accelerate onboarding. They **MUST** be presented as suggestions and never as constraints.

### 14.3 The Academic Graph

The Academic Graph is the connected representation of a student's academic life: Subjects linked to Structure Units, Structure Units linked to Resources, Resources linked to extracted Concepts, Concepts linked to Notes, Flashcards, Quiz questions, and Mastery Signals, all situated within Academic Terms and connected to Academic Events.

The Academic Graph is the substrate for every intelligent behaviour in the product. Grounding, planning, insight generation, search, and personalisation are all traversals of this graph. Two consequences follow and are binding:

1. Any feature that creates data outside the Academic Graph weakens every other feature and requires explicit justification.
2. The Academic Graph persists across Academic Terms and is never discarded at semester boundaries.

---

## 15. Core Features

Ten core capability areas define the product. Each is specified with purpose, behaviour, and release horizon. Detailed testable requirements follow in Section 16.

### 15.1 Adaptive Academic Setup (V0)

**Purpose.** Convert a student from unknown to fully contextualised in minutes.

**Behaviour.** The student provides institution, programme, branch, and current term. Avora proposes a subject list and a structural template drawn from its structure library. The student confirms, edits, or replaces any of it. Unknown institutions are handled gracefully through manual entry, which simultaneously enriches the structure library for future students. A timetable may be uploaded as an image or document and parsed into Academic Events.

**Why it matters.** Setup is where structural adaptivity is either proven or lost. A student who cannot represent their real programme in setup will not return.

### 15.2 Intelligent Resource Ingestion (V0)

**Purpose.** Absorb everything the student has, in whatever form it exists, with near-zero manual filing.

**Behaviour.** Bulk upload of documents, presentations, images, and scans. Avora extracts text and structure from typed documents, slide decks, scanned pages, and handwritten notes. Each resource is automatically classified to a Subject and, where determinable, a Structure Unit, with a visible confidence indication and one-tap correction. Ingestion is asynchronous and resilient: the student is never blocked while processing completes, and interrupted uploads resume.

**Why it matters.** This is the moment the product earns its category claim. Filing must feel like it did not happen.

### 15.3 AI Tutor (V0)

**Purpose.** Give every student a subject-aware tutor that knows their material.

**Behaviour.** Conversational interface scoped selectively to a Resource, a Structure Unit, a Subject, or the entire workspace. Every substantive answer cites the specific resources and locations it drew from. When the student's corpus does not contain the answer, Avora says so explicitly and may offer general knowledge only when clearly labelled as outside their material. Explanations are available at multiple depths, from intuition to formal treatment. Conversation context persists and is retrievable.

**Why it matters.** This is the daily habit surface and the most direct expression of the AI-first principle.

### 15.4 Smart Notes and Summaries (V0)

**Purpose.** Turn dense source material into usable revision artifacts without student effort.

**Behaviour.** Automatic summarisation on ingestion at document level. On demand, structured notes at Structure Unit or Subject level, synthesised across multiple resources rather than summarising a single file. Notes are fully editable and become student-owned artifacts on first edit. Every AI-generated note retains links to its source resources. Notes are exportable.

**Why it matters.** Summaries deliver the fastest perceptible value after ingestion. Notes create ownership, which creates retention.

### 15.5 Flashcards and Spaced Recall (V0)

**Purpose.** Convert reading into retention using evidence-based active recall.

**Behaviour.** Flashcards generated automatically from any Resource, Structure Unit, or Note. Student review with self-assessed or system-assessed correctness. A spaced repetition scheduler resurfaces cards based on performance. Cards are editable, deletable, and manually creatable. Review sessions are short by default and fully usable offline where the deck is already downloaded.

**Why it matters.** Recall is the highest-leverage learning intervention available and the most tedious to prepare manually. Automating preparation is durable value.

### 15.6 Quiz and Assessment Generation (V0)

**Purpose.** Let students test themselves in the format they will actually be assessed in.

**Behaviour.** Generation of quizzes scoped to selected Structure Units or Subjects, with selectable question formats (multiple choice, short answer, long answer, numerical, true/false) and difficulty. Answers are evaluated with explanatory feedback grounded in source material. Incorrect responses are mapped to Concepts and feed Mastery Signals. Historical attempts are retained and comparable.

**Why it matters.** Assessment simulation converts anxiety into measurable preparedness and produces the richest personalisation signal in the product.

### 15.7 Adaptive Study Planner (V1)

**Purpose.** Answer the question "what should I study right now" with a defensible, personal answer.

**Behaviour.** Generates a time-allocated plan across Subjects using assessment dates, deadlines, syllabus coverage, mastery estimates, and student-declared available time. Adapts continuously: missed sessions cause re-planning rather than accumulating guilt. Surfaces a single prioritised next action at all times. Integrates with Academic Events derived from the timetable.

**Why it matters.** Planning converts Avora from a place students visit when they already know what to do into the system that tells them.

### 15.8 Unified Academic Search (V1)

**Purpose.** Make every artifact the student has ever added instantly retrievable.

**Behaviour.** Single search across resources, extracted content, notes, flashcards, quiz questions, and conversations, spanning current and prior terms. Semantic and keyword retrieval combined. Results are filterable by Subject, Structure Unit, term, and artifact type. Search results are answerable — the student can move directly from a result into a tutor conversation scoped to it.

**Why it matters.** This is the capability that makes the accumulated graph feel like an operating system rather than a folder.

### 15.9 AI Insights and Proactive Guidance (V1)

**Purpose.** Surface risk and opportunity before the student notices them.

**Behaviour.** Periodic, evidence-backed observations: uncovered syllabus areas relative to an approaching assessment, concepts with declining recall performance, subjects receiving disproportionately low attention, upcoming density in the assessment calendar. Every insight states the evidence it is based on and offers a concrete next action. Insight volume is strictly rate-limited and tone is supportive, never punitive.

**Why it matters.** Proactivity is what distinguishes an operating system from a tool. It is also the highest-risk surface for user trust and must be held to a high bar.

### 15.10 Cross-Semester Continuity (V2)

**Purpose.** Make the student's academic history a compounding asset.

**Behaviour.** Terms roll over without data loss. Prior subjects remain searchable and referenceable. Prerequisite relationships between subjects across terms are recognised, allowing the tutor to draw on foundational material from earlier semesters. Long-term mastery trends are visible.

**Why it matters.** This is the mechanism by which Avora becomes progressively harder to leave and progressively more valuable to keep.

### 15.11 Supporting capabilities

| Capability | Description | Horizon |
| --- | --- | --- |
| Timetable intelligence | Parse uploaded timetables into a schedule and derive Academic Events | V0 |
| Resource sharing | Share a resource or a structured unit with peers by link or code, with explicit consent | V1 |
| Offline access | Downloaded resources, notes, and flashcard decks usable without connectivity | V1 |
| Export and portability | Export notes, summaries, decks, and full workspace data in open formats | V1 |
| Multi-language support | Interface and AI interaction in additional languages beyond English | V2 |
| Voice interaction | Spoken question input and audio explanation output | V2 |
| Lecture capture | Recording and transcription of live lectures into Resources | V3 |
| Institutional structure library | Curated, community-enriched structure templates by institution and programme | V2 |

---

## 16. Functional Requirements

Requirements are normative and testable. Each carries an identifier, a release horizon, and a priority.

### 16.1 Identity and account

| ID | Requirement | Horizon | Priority |
| --- | --- | --- | --- |
| FR-001 | The system **MUST** allow a student to create an account using at least one low-friction authentication method and one email-based method. | V0 | P0 |
| FR-002 | The system **MUST** support secure session management with re-authentication for sensitive operations. | V0 | P0 |
| FR-003 | The system **MUST** allow account recovery without support intervention. | V0 | P0 |
| FR-004 | The system **MUST** allow a student to export all of their data in open, machine-readable formats. | V1 | P1 |
| FR-005 | The system **MUST** allow permanent account deletion, removing all personal data and derived artifacts within a published time window. | V0 | P0 |
| FR-006 | The system **MUST** maintain a single continuous student identity across Academic Terms and institution changes. | V0 | P0 |

### 16.2 Academic setup and structure

| ID | Requirement | Horizon | Priority |
| --- | --- | --- | --- |
| FR-010 | The system **MUST** capture institution, programme, branch, and current Academic Term during onboarding. | V0 | P0 |
| FR-011 | The system **MUST** allow the student to add an institution not present in Avora's library without blocking onboarding. | V0 | P0 |
| FR-012 | The system **SHOULD** propose a Subject list based on institution, programme, branch, and term. | V0 | P1 |
| FR-013 | The student **MUST** be able to add, rename, reorder, and remove Subjects at any time. | V0 | P0 |
| FR-014 | The system **MUST** support Structure Units with student-chosen type labels including but not limited to Unit, Module, Chapter, Topic, Week, Experiment, Practical, Lab, Project, and Program. | V0 | P0 |
| FR-015 | The system **MUST** support Subjects with zero internal structure as a valid, fully functional state. | V0 | P0 |
| FR-016 | The system **MUST** support Structure Units nested to at least three levels. | V0 | P0 |
| FR-017 | The system **MUST** allow different Subjects belonging to the same student to use different structure types simultaneously. | V0 | P0 |
| FR-018 | The system **MUST** preserve all associated Resources, Notes, Flashcards, and progress when a structure is renamed, re-typed, re-nested, split, or merged. | V0 | P0 |
| FR-019 | The system **SHOULD** propose a Structure Template based on institution and programme, always as an editable suggestion. | V1 | P1 |
| FR-020 | The system **MUST** allow the student to define a fully custom structure type label. | V0 | P0 |
| FR-021 | The system **MUST** allow the student to advance to a new Academic Term while retaining all prior term data. | V1 | P0 |

### 16.3 Resource ingestion

| ID | Requirement | Horizon | Priority |
| --- | --- | --- | --- |
| FR-030 | The system **MUST** accept document, presentation, image, and plain-text resource uploads. | V0 | P0 |
| FR-031 | The system **MUST** support multi-file upload in a single action. | V0 | P0 |
| FR-032 | The system **MUST** support capture directly from the device camera, including multi-page capture. | V0 | P0 |
| FR-033 | The system **MUST** extract machine-readable text from typed documents and presentations. | V0 | P0 |
| FR-034 | The system **MUST** extract text from scanned documents and photographed pages, including handwritten content, with graceful degradation when confidence is low. | V0 | P0 |
| FR-035 | The system **MUST** preserve the original uploaded file unmodified and retrievable. | V0 | P0 |
| FR-036 | The system **MUST** process ingestion asynchronously without blocking the student, and **MUST** clearly communicate processing state per resource. | V0 | P0 |
| FR-037 | The system **MUST** resume or safely fail interrupted uploads without data loss or silent duplication. | V0 | P0 |
| FR-038 | The system **SHOULD** automatically classify each Resource to a Subject and, where determinable, a Structure Unit. | V0 | P1 |
| FR-039 | The system **MUST** display classification confidence and allow single-action correction. | V0 | P0 |
| FR-040 | The system **MUST** allow manual placement, re-placement, renaming, and deletion of any Resource. | V0 | P0 |
| FR-041 | The system **SHOULD** detect duplicate resources and offer to merge or skip. | V1 | P2 |
| FR-042 | The system **MUST** enforce per-file and per-account storage limits appropriate to the student's plan, with clear communication before limits are reached. | V0 | P1 |

### 16.4 AI Tutor

| ID | Requirement | Horizon | Priority |
| --- | --- | --- | --- |
| FR-050 | The system **MUST** provide a conversational interface for student questions. | V0 | P0 |
| FR-051 | The student **MUST** be able to scope a conversation to a Resource, Structure Unit, Subject, or the entire workspace. | V0 | P0 |
| FR-052 | Every substantive answer derived from student material **MUST** include citations identifying the source Resource and location. | V0 | P0 |
| FR-053 | The system **MUST** explicitly state when the student's materials do not contain sufficient information to answer. | V0 | P0 |
| FR-054 | When answering from general knowledge rather than student material, the system **MUST** label the response as such. | V0 | P0 |
| FR-055 | The system **MUST** maintain conversational context within a session and persist conversation history for later retrieval. | V0 | P0 |
| FR-056 | The system **SHOULD** offer explanation depth control, from simplified to rigorous. | V0 | P1 |
| FR-057 | The system **SHOULD** support follow-up suggestions relevant to the current material. | V1 | P2 |
| FR-058 | The system **MUST** render mathematical notation, code, and structured content legibly. | V0 | P0 |
| FR-059 | The student **MUST** be able to convert any tutor response into a saved Note. | V1 | P1 |
| FR-060 | The system **MUST** allow deletion of individual conversations and of full conversation history. | V0 | P0 |

### 16.5 Notes and summaries

| ID | Requirement | Horizon | Priority |
| --- | --- | --- | --- |
| FR-070 | The system **MUST** generate a summary of each ingested Resource automatically. | V0 | P0 |
| FR-071 | The system **MUST** generate structured Notes on demand for a Structure Unit or Subject, synthesising across multiple Resources. | V0 | P0 |
| FR-072 | All AI-generated Notes and Summaries **MUST** link back to their source Resources. | V0 | P0 |
| FR-073 | The student **MUST** be able to edit any Note, after which it is marked as student-authored. | V0 | P0 |
| FR-074 | The student **MUST** be able to create Notes manually. | V0 | P0 |
| FR-075 | The system **MUST** support regeneration of an AI Note without destroying the student's edited version. | V1 | P1 |
| FR-076 | The system **SHOULD** support export of Notes in at least one open document format. | V1 | P1 |
| FR-077 | The system **SHOULD** highlight key definitions, formulae, and terminology within generated Notes. | V1 | P2 |

### 16.6 Flashcards and spaced recall

| ID | Requirement | Horizon | Priority |
| --- | --- | --- | --- |
| FR-080 | The system **MUST** generate Flashcards from a Resource, Structure Unit, Subject, or Note. | V0 | P0 |
| FR-081 | The student **MUST** be able to create, edit, and delete Flashcards manually. | V0 | P0 |
| FR-082 | The system **MUST** implement a spaced repetition schedule that resurfaces cards based on recall performance. | V0 | P0 |
| FR-083 | The system **MUST** record every review Attempt and use it to update Mastery Signals. | V0 | P0 |
| FR-084 | The system **SHOULD** support review sessions bounded by card count or duration. | V0 | P1 |
| FR-085 | The system **SHOULD** support offline review of previously downloaded decks with deferred synchronisation. | V1 | P1 |
| FR-086 | Each Flashcard **MUST** retain a reference to its source Resource. | V0 | P1 |

### 16.7 Quizzes and assessment

| ID | Requirement | Horizon | Priority |
| --- | --- | --- | --- |
| FR-090 | The system **MUST** generate Quizzes scoped to selected Structure Units or Subjects. | V0 | P0 |
| FR-091 | The system **MUST** support at least multiple-choice, short-answer, and long-answer question formats. | V0 | P0 |
| FR-092 | The system **SHOULD** support numerical and derivation-style questions where the subject material warrants it. | V1 | P1 |
| FR-093 | The student **MUST** be able to select difficulty and question count. | V0 | P0 |
| FR-094 | The system **MUST** evaluate responses and provide explanatory feedback grounded in source material. | V0 | P0 |
| FR-095 | The system **MUST** map incorrect responses to Concepts and update Mastery Signals. | V0 | P0 |
| FR-096 | The system **MUST** retain Attempt history and allow the student to review past attempts. | V0 | P1 |
| FR-097 | The system **SHOULD** support timed examination-simulation mode. | V2 | P2 |
| FR-098 | The system **SHOULD** allow generation of a targeted quiz composed only of previously incorrect Concepts. | V1 | P1 |

### 16.8 Planning and scheduling

| ID | Requirement | Horizon | Priority |
| --- | --- | --- | --- |
| FR-100 | The system **MUST** allow the student to record Academic Events including assessments, deadlines, labs, and examinations. | V0 | P0 |
| FR-101 | The system **SHOULD** extract a schedule and Academic Events from an uploaded timetable image or document, with student confirmation. | V0 | P1 |
| FR-102 | The system **MUST** present a unified view of upcoming Academic Events across all Subjects. | V0 | P0 |
| FR-103 | The system **MUST** generate an adaptive Study Plan using assessment dates, syllabus coverage, Mastery Signals, and student-declared availability. | V1 | P0 |
| FR-104 | The Study Plan **MUST** re-plan automatically when sessions are missed, without punitive framing. | V1 | P0 |
| FR-105 | The system **MUST** surface a single prioritised next study action at any time. | V1 | P1 |
| FR-106 | The student **MUST** be able to override, reschedule, or dismiss any planned item. | V1 | P0 |
| FR-107 | The system **SHOULD** support optional reminders for planned sessions and upcoming events. | V1 | P1 |

### 16.9 Search and retrieval

| ID | Requirement | Horizon | Priority |
| --- | --- | --- | --- |
| FR-110 | The system **MUST** provide unified search across Resources, extracted content, Notes, Flashcards, quiz questions, and conversations. | V1 | P0 |
| FR-111 | Search **MUST** combine semantic and keyword retrieval. | V1 | P0 |
| FR-112 | Search **MUST** support filtering by Subject, Structure Unit, Academic Term, and artifact type. | V1 | P1 |
| FR-113 | Search **MUST** span prior Academic Terms. | V2 | P1 |
| FR-114 | The student **SHOULD** be able to start a scoped tutor conversation directly from a search result. | V1 | P2 |

### 16.10 Insights and progress

| ID | Requirement | Horizon | Priority |
| --- | --- | --- | --- |
| FR-120 | The system **MUST** display syllabus coverage per Subject based on Structure Units engaged with. | V1 | P1 |
| FR-121 | The system **MUST** display Mastery Signals at Concept and Subject level, framed as guidance rather than grading. | V1 | P1 |
| FR-122 | The system **MUST** generate proactive Insights citing the evidence on which they are based. | V1 | P1 |
| FR-123 | Every Insight **MUST** offer at least one concrete, immediately actionable next step. | V1 | P1 |
| FR-124 | The system **MUST** rate-limit Insight delivery and allow the student to disable proactive notifications entirely. | V1 | P0 |
| FR-125 | Insight and progress language **MUST NOT** use shaming, loss-framing, or manufactured urgency. | V1 | P0 |

### 16.11 Sharing and collaboration

| ID | Requirement | Horizon | Priority |
| --- | --- | --- | --- |
| FR-130 | The student **SHOULD** be able to share an individual Resource or a Structure Unit with peers via link or code. | V1 | P2 |
| FR-131 | Sharing **MUST** require explicit per-action consent and **MUST NOT** be enabled by default. | V1 | P0 |
| FR-132 | The student **MUST** be able to revoke any share at any time. | V1 | P0 |
| FR-133 | Shared content **MUST NOT** expose the sharer's notes, performance data, or conversations unless explicitly and separately shared. | V1 | P0 |
| FR-134 | The system **SHOULD** allow a student to import a shared structure into their own workspace as an editable copy. | V2 | P2 |

### 16.12 Privacy, control, and trust

| ID | Requirement | Horizon | Priority |
| --- | --- | --- | --- |
| FR-140 | The student **MUST** be able to delete any Resource, Note, Flashcard, Quiz, or conversation permanently. | V0 | P0 |
| FR-141 | The system **MUST** provide a clear, plain-language explanation of what data is used to personalise the experience. | V0 | P0 |
| FR-142 | The system **MUST** allow the student to opt out of having their content used for any purpose beyond serving their own workspace. | V0 | P0 |
| FR-143 | The system **MUST** clearly identify AI-generated content wherever it appears. | V0 | P0 |
| FR-144 | The system **MUST** provide visibility into storage and usage consumption against plan limits. | V1 | P2 |

---

## 17. Non-Functional Requirements

Non-functional requirements are release gates. A feature that satisfies its functional requirements but violates a P0 non-functional requirement is not shippable.

### 17.1 Performance and responsiveness

| ID | Requirement |
| --- | --- |
| NFR-001 | Application launch to interactive home state **MUST** complete within three seconds on a mid-range mobile device on a typical mobile network. |
| NFR-002 | Navigation between primary surfaces **MUST** feel immediate, with perceptible response to input within 100 milliseconds. |
| NFR-003 | AI Tutor responses **MUST** begin streaming visible output within five seconds of submission under normal conditions. |
| NFR-004 | Resource ingestion **MUST** provide immediate acknowledgement and visible progress, with typical document processing completing within two minutes. |
| NFR-005 | Search results **MUST** return within two seconds for a typical workspace. |
| NFR-006 | Long-running operations **MUST** be resumable and **MUST NOT** require the student to keep the application in the foreground. |

### 17.2 Reliability and data integrity

| ID | Requirement |
| --- | --- |
| NFR-010 | Student-uploaded Resources **MUST NOT** be lost under any single-component failure. |
| NFR-011 | The system **MUST** achieve at least 99.9 percent availability for core read paths, measured monthly. |
| NFR-012 | Availability targets **MUST** be met during peak examination periods, which are known, predictable, and **MUST** be capacity-planned for. |
| NFR-013 | Partial AI or ingestion failure **MUST** degrade gracefully, preserving access to original Resources and all previously generated artifacts. |
| NFR-014 | Every failure surfaced to the student **MUST** be honest, comprehensible, and paired with a recovery action. |
| NFR-015 | Student-authored content edits **MUST** be preserved against connectivity loss. |

### 17.3 Scalability

| ID | Requirement |
| --- | --- |
| NFR-020 | The system **MUST** support a workspace containing at least ten Subjects, five hundred Resources, and several years of accumulated artifacts without degradation of core experience. |
| NFR-021 | The system **MUST** absorb strongly seasonal load patterns aligned to academic calendars, including order-of-magnitude spikes around examination periods. |
| NFR-022 | Cost per active student **MUST** remain compatible with the pricing model defined in Section 25 at all supported usage tiers. |

### 17.4 Security

| ID | Requirement |
| --- | --- |
| NFR-030 | All data **MUST** be encrypted in transit and at rest. |
| NFR-031 | Every access to a Resource or derived artifact **MUST** be authorised against the requesting student's identity. Ownership checks **MUST NOT** rely on unguessable identifiers alone. |
| NFR-032 | The system **MUST** apply least-privilege access across all internal components and personnel. |
| NFR-033 | Engineering practice **MUST** follow OWASP-aligned guidance for the application classes involved, including validation of all untrusted input, protection against injection in all forms, and secure handling of file uploads. |
| NFR-034 | Uploaded files **MUST** be treated as untrusted input and scanned and sanitised before processing. |
| NFR-035 | Authentication **MUST** follow current best practice for credential handling, session lifetime, and account recovery. |
| NFR-036 | Security-relevant events **MUST** be logged in a form that supports investigation without logging sensitive student content. |
| NFR-037 | The system **MUST** undergo security review before each major release and **MUST** maintain a documented vulnerability disclosure and response process. |

### 17.5 Privacy and data protection

| ID | Requirement |
| --- | --- |
| NFR-040 | Data collection **MUST** be minimised to what is necessary to deliver stated product value. |
| NFR-041 | Every category of collected data **MUST** have a documented purpose disclosed to the student in plain language. |
| NFR-042 | Deletion **MUST** be genuine and complete across primary storage, derived artifacts, and backups within a published window. |
| NFR-043 | Student content **MUST NOT** be used to train third-party foundation models. |
| NFR-044 | Student content **MUST NOT** be sold, rented, or brokered under any circumstance. |
| NFR-045 | The system **MUST** comply with applicable data protection law in every market it operates in, including India's data protection framework. |
| NFR-046 | Analytics **MUST** be designed to answer product questions without requiring access to the substance of student academic content. |

### 17.6 Usability and accessibility

| ID | Requirement |
| --- | --- |
| NFR-050 | All core workflows **MUST** be completable on a mobile device without requiring a desktop. |
| NFR-051 | The interface **MUST** meet WCAG 2.1 Level AA for contrast, target size, focus handling, and screen reader compatibility. |
| NFR-052 | The product **MUST** remain usable on low-end devices with constrained memory and storage. |
| NFR-053 | The product **MUST** degrade usefully on intermittent connectivity, retaining access to downloaded content. |
| NFR-054 | Language **MUST** be plain, non-academic, and free of jargon that assumes prior familiarity with productivity software. |
| NFR-055 | No core workflow **MUST** require more than three steps from home to completion. |

### 17.7 Maintainability and extensibility

| ID | Requirement |
| --- | --- |
| NFR-060 | Adding a new Resource type, structure label, discipline, or language **MUST NOT** require redesign of the Academic Graph. |
| NFR-061 | AI model providers and versions **MUST** be replaceable without changes to product surfaces. |
| NFR-062 | All product surfaces **MUST** be instrumented against the metrics defined in Section 26 before release. |
| NFR-063 | Every shipped capability **MUST** trace to a requirement identifier in this document. |

### 17.8 Observability

| ID | Requirement |
| --- | --- |
| NFR-070 | The system **MUST** monitor AI response quality, grounding failure rates, and ingestion success rates continuously. |
| NFR-071 | The system **MUST** allow the student to report an incorrect or unhelpful AI response inline, and these reports **MUST** feed quality review. |
| NFR-072 | Operational alerting **MUST** exist for availability, latency, ingestion backlog, and cost-per-student anomalies. |

---

## 18. AI Strategy

AI is not a feature of Avora. AI is the mechanism by which Avora delivers its core promise. This section defines how intelligence behaves as a product surface.

### 18.1 Strategic position

Avora's AI advantage does not come from possessing a superior model. Foundation models are a competitive commodity and will continue to improve for everyone simultaneously. Avora's advantage comes from **context**: the structured, personal, continuously enriched Academic Graph that no general-purpose assistant possesses. The strategy is therefore to invest in context quality, retrieval precision, and grounding discipline rather than in model differentiation.

**Strategic statement:** *The model is rented. The context is owned.*

### 18.2 The four intelligence layers

| Layer | Function | Examples |
| --- | --- | --- |
| **Understanding** | Convert raw student material into structured, retrievable knowledge | Text and layout extraction, handwriting recognition, structure detection, concept identification, resource classification |
| **Grounding** | Retrieve precisely the right context for any request | Scoped retrieval across resource, unit, subject, and workspace; cross-term retrieval; citation resolution |
| **Generation** | Produce accurate, syllabus-aligned, appropriately pitched output | Tutoring answers, summaries, notes, flashcards, quizzes, feedback |
| **Personalisation** | Adapt behaviour to the individual over time | Mastery-aware explanation depth, weakness-targeted practice, adaptive planning, proactive insights |

Requirements at any layer **MUST NOT** be satisfied by degrading a lower layer. In particular, generation quality **MUST NOT** be improved by loosening grounding constraints.

### 18.3 AI behaviour requirements

| ID | Requirement |
| --- | --- |
| AIR-001 | When a student's materials are relevant to a request, generation **MUST** be grounded in those materials in preference to model general knowledge. |
| AIR-002 | Grounded output **MUST** carry citations resolvable to a specific Resource and location within it. |
| AIR-003 | The system **MUST** state clearly when the answer is not supported by the student's materials rather than producing an unsupported answer. |
| AIR-004 | Output produced from general knowledge **MUST** be explicitly labelled as being outside the student's materials. |
| AIR-005 | The system **MUST** express calibrated uncertainty rather than uniform confidence. |
| AIR-006 | The system **MUST NOT** fabricate citations, sources, page references, or syllabus items. A fabricated citation is a severity-one defect. |
| AIR-007 | Generated assessment items **MUST** be answerable from the student's materials at the stated scope. |
| AIR-008 | Feedback on incorrect answers **MUST** explain the reasoning, not merely state the correct response. |
| AIR-009 | Explanation depth **MUST** be adjustable and **SHOULD** adapt to the student's demonstrated mastery. |
| AIR-010 | AI-generated content **MUST** be visibly identified as AI-generated at every point of presentation. |
| AIR-011 | The system **MUST** allow the student to report any AI output as incorrect, and **MUST** route reports into quality evaluation. |
| AIR-012 | AI behaviour **MUST** degrade gracefully when a model provider is unavailable, preserving access to all previously generated artifacts. |
| AIR-013 | The system **MUST** treat instructions embedded inside uploaded student materials as data, never as commands to the AI. |
| AIR-014 | Proactive AI behaviour **MUST** be rate-limited, dismissible, and fully disableable by the student. |

### 18.4 Quality evaluation

AI quality is a measured product attribute, not a subjective impression. Avora **MUST** maintain a continuous evaluation practice covering:

- **Grounding fidelity** — proportion of responses whose claims are supported by cited sources
- **Citation validity** — proportion of citations that resolve correctly to real content
- **Refusal correctness** — proportion of unanswerable questions correctly declined rather than answered speculatively
- **Extraction accuracy** — text and structure fidelity across typed, scanned, and handwritten inputs
- **Assessment validity** — proportion of generated questions that are answerable, unambiguous, and correctly keyed
- **Student-reported usefulness** — inline feedback rates by surface

Evaluation sets **MUST** cover the structural and disciplinary diversity of the target market, including handwritten notes, low-quality scans, regional-language mixed content, and heavily mathematical and diagrammatic material.

### 18.5 Model strategy

- Avora **MUST** remain model-agnostic at the product layer, treating providers as replaceable dependencies (NFR-061).
- Model selection **SHOULD** be task-appropriate: lightweight models for classification and extraction, stronger models for synthesis and tutoring, balancing quality against cost per student (NFR-022).
- Avora **MAY** develop specialised capability where general models underperform on academic-specific tasks such as handwritten technical notation, diagram interpretation, and syllabus structure recognition. This is an optimisation, not a founding dependency.
- Student content **MUST NOT** be used to train third-party foundation models (NFR-043).

---

## 19. Privacy, Security, and Data Protection

These are stated as product principles and requirements. Implementation belongs in the security architecture document, which **MUST** trace to the identifiers here.

### 19.1 Privacy by Design

- **Purpose limitation.** Every data element collected has a stated product purpose. Data without a purpose is not collected.
- **Minimisation.** Avora collects the least data that delivers the promised value.
- **Student ownership.** The student owns their content unconditionally. Avora is a custodian, not a proprietor.
- **Transparency.** What is collected, why, and how it is used is stated in plain language inside the product, not only in legal documents.
- **Real deletion.** Deletion removes the original, all derived artifacts, and all indexed representations.
- **No secondary exploitation.** Student content is never sold, brokered, or used to train third-party models.
- **Opt-out of improvement.** Students can opt out of any use of their content beyond serving their own workspace.

### 19.2 Security by Design

- **Least privilege by default** across users, services, and personnel.
- **Zero implicit trust in identifiers.** Every access is authorised against ownership.
- **Uploads are hostile until proven otherwise.** All ingested files are validated, scanned, and sanitised.
- **Defence in depth.** No single control is relied upon for a critical protection.
- **Secure defaults.** The safest configuration is the default; students never need to configure their way to safety.
- **OWASP-aligned engineering.** Common web, mobile, API, and AI-specific risk classes are explicitly addressed in engineering practice and review.
- **Prompt injection is a security class.** Content in student uploads and shared material is untrusted input to AI systems and is handled as such (AIR-013).
- **Continuous assurance.** Security review precedes major releases; disclosure and response processes are documented and maintained.

### 19.3 Trust commitments to the student

Avora makes four public commitments that **MUST NOT** be weakened without founder-level approval and student notification:

1. Your academic content belongs to you.
2. Your content is never sold and never used to train external models.
3. Deletion means deletion.
4. AI-generated content is always labelled as such.

---

## 20. Responsible AI and Academic Integrity

Avora operates in an educational context and therefore carries obligations beyond product quality.

### 20.1 Position

Avora exists to help students **learn**, not to help students **avoid learning**. This position is commercially deliberate: a product optimised for integrity evasion has poor long-term retention, is institutionally toxic, and is strategically fragile.

### 20.2 Design commitments

| ID | Commitment |
| --- | --- |
| RAI-01 | AI-generated content **MUST** be labelled wherever presented, including on export. |
| RAI-02 | The product **MUST** favour explanation, decomposition, and guided reasoning over undifferentiated answer production for assignment-style inputs. |
| RAI-03 | The product **MUST NOT** market itself on the basis of producing submittable graded work. |
| RAI-04 | Terms of use **MUST** state that responsibility for compliance with institutional academic policy rests with the student. |
| RAI-05 | The product **MUST NOT** implement features designed to evade AI-detection systems. |
| RAI-06 | Progress and insight framing **MUST** avoid shame, punitive comparison, and manufactured urgency (FR-125). |
| RAI-07 | The product **SHOULD** support healthy study patterns and **MUST NOT** employ engagement mechanics that exploit anxiety. |

### 20.3 Wellbeing

The target user population experiences significant academic stress. Avora's tone, notification behaviour, and progress representation are wellbeing-relevant product surfaces. Progress data is guidance, never judgement. Missing a planned session results in re-planning, not reprimand. Notification pressure is opt-in and reversible.

---

## 21. User Journey

### 21.1 Stage 0 — Discovery

The student encounters Avora through a peer, a class group, or campus-level organic distribution. The proposition understood at this point is concrete and singular: *upload your semester's material and it organises itself.*

### 21.2 Stage 1 — First session (target: under ten minutes to value)

1. Account creation with minimal friction.
2. Academic setup: institution, programme, branch, term. Subjects proposed; student confirms or edits.
3. Structure selection: a template is offered; the student accepts, edits, or declines structure entirely.
4. First upload: the student selects multiple files or photographs pages. Ingestion begins immediately and visibly.
5. First value moment: within the same session, the student sees their material classified into their own structure, with summaries generated.
6. First AI interaction: the student asks one question about their own material and receives a cited, grounded answer.

**Activation is defined as completion of steps 2, 4, and 6 within the first session.** This definition is binding for the metrics in Section 26.

### 21.3 Stage 2 — Early semester (weeks 1 to 4)

The student adds material as it arrives. Avora classifies each upload automatically. Summaries accumulate. The timetable is uploaded and Academic Events populate. The habit being formed is *upload on receipt* — the single most important behavioural outcome of this stage.

### 21.4 Stage 3 — Mid semester (weeks 4 to 10)

Internal assessments arrive. The student's usage shifts from ingestion to consumption: tutor conversations, generated notes, flashcard review, targeted quizzes. Insights begin to surface coverage gaps and weak concepts. The Study Planner becomes the entry point for sessions where the student does not already know what to do.

### 21.5 Stage 4 — Examination period

Usage intensity peaks. The dominant workflows are targeted revision, quiz simulation, weakness-focused practice, and rapid retrieval of specific material. This is the period in which Avora's value is most acutely felt and most credibly attributed. Reliability requirements (NFR-012) are non-negotiable here.

### 21.6 Stage 5 — Term transition

The student advances to a new Academic Term. Prior material is retained and searchable. New subjects are set up faster because structure templates and institutional knowledge now exist. Mastery history and prerequisite links carry forward. This is the moment where Avora converts from a product used to an operating system depended upon.

### 21.7 Stage 6 — Long-term continuity

Across multiple terms, the Academic Graph becomes a personal knowledge base spanning the degree. Retention compounds. Switching cost becomes the accumulated understanding, not the exported files.

---

## 22. Information Architecture

Navigation reflects the mental model of a student's semester, not the structure of the underlying system.

### 22.1 Primary surfaces

| Surface | Purpose | Contents |
| --- | --- | --- |
| **Today** | The proactive entry point | Next study action, upcoming Academic Events, due flashcard reviews, active Insights |
| **Subjects** | The structural core | Subject list, then Structure Units, then Resources, Notes, and artifacts |
| **Tutor** | The conversational surface | Scoped conversations, history, quick scope switching |
| **Study** | The active learning surface | Flashcard review, quizzes, attempt history, mastery view |
| **Library** | The retrieval surface | Unified search, all resources, all notes, filters across terms |

Upload is a persistent, globally available action available from every surface. It is the single most important interaction in the product and **MUST NOT** be nested inside a navigation hierarchy.

### 22.2 Design constraints

- Home **MUST** answer "what should I do now" without requiring navigation.
- Reaching any Resource from home **MUST** require no more than three interactions.
- Structure depth **MUST NOT** increase perceived navigation complexity; deep structures require progressive disclosure.
- Empty states **MUST** be instructive and action-oriented, never decorative.
- Processing states **MUST** be visible, honest, and non-blocking.

---

## 23. Competitive Landscape

### 23.1 Category map

| Category | Representative behaviour | Strength | Structural weakness Avora exploits |
| --- | --- | --- | --- |
| **General-purpose AI assistants** | Student pastes context into a chat interface each time | Strong reasoning; free or cheap; already adopted | No persistent academic context, no structure, no continuity, no grounding in the student's actual syllabus; the student supplies context forever |
| **AI document chat tools** | Upload a file, ask questions about that file | Useful for a single document | Document-scoped, not semester-scoped; no academic structure; no planning; no continuity |
| **Note-taking and knowledge apps** | Manual organisation of student-authored content | Flexible and powerful | Requires the student to do the structuring work; intelligence is peripheral; steep configuration cost |
| **AI study-tool point solutions** | Flashcard or quiz generation from pasted content | Fast utility value | Single-feature; no academic graph; trivially replicated; no retention mechanism |
| **Institutional learning management systems** | Faculty-published course content | Authoritative and institutional | Institution-owned rather than student-owned; poor mobile experience; no intelligence; only contains what faculty publish, which is a fraction of what students actually use |
| **Informal channels** | Messaging groups and shared drives | Zero adoption friction; where material actually flows | No structure, no search, no intelligence, no persistence. This is the true incumbent. |

### 23.2 The real competitor

The incumbent is not a company. It is the combination of a messaging app, a camera roll, a shared drive, and a general-purpose AI assistant used without context. Any strategy, feature decision, or onboarding flow that does not account for the fact that this incumbent is free, familiar, and already installed is incorrect.

The implication for product design is direct: Avora's first session **MUST** be perceptibly better than the incumbent within minutes, not after configuration.

### 23.3 Competitive risks

- **Foundation model providers moving up-stack** into persistent, personalised assistants with memory. Mitigation: structural and institutional specificity that a horizontal assistant will not build.
- **Point solutions bundling** into broader study suites. Mitigation: depth of the Academic Graph and cross-semester continuity, which cannot be assembled quickly.
- **Institutional systems adding AI.** Mitigation: student-owned data, mobile-first experience, and coverage of material that never enters institutional systems.

---

## 24. Differentiation and Moat

### 24.1 Points of differentiation

| Differentiator | Description | Durability |
| --- | --- | --- |
| **Structural adaptivity** | Represents any institution's academic organisation without imposing a hierarchy | High — requires deliberate architectural commitment competitors rarely make early |
| **Grounded, cited intelligence** | Every answer anchored in the student's own material with verifiable sources | Medium-high — technically achievable but requires product discipline to maintain |
| **Semester-scoped context** | The AI knows the whole semester, not one document | High — depends on the accumulated Academic Graph |
| **Automatic organisation** | Filing happens without the student filing | Medium — replicable, but requires ingestion quality across messy real-world inputs |
| **Cross-term continuity** | Academic history compounds across the degree | Very high — cannot be retroactively acquired by a competitor |
| **Institutional structure library** | Growing corpus of real programme structures | Very high — accumulates only through usage |
| **Mobile-first for the actual market** | Fully capable on a mid-range phone on poor connectivity | Medium — an execution advantage, not a structural one |

### 24.2 Moat construction

Avora's defensibility is time-dependent and compounding:

1. **Month one:** No moat. Only execution quality and time-to-value.
2. **Semester one:** Personal switching cost begins — the student's material and generated artifacts live in Avora.
3. **Semester two:** Continuity value appears. Prior-term material is an asset only Avora holds.
4. **Year two:** The institutional structure library reaches density in the beachhead, making setup materially faster for new students at covered institutions than anywhere else.
5. **Year three and beyond:** The Academic Graph across the degree, plus mastery history, produces personalisation that no newly adopted product can match on day one.

**Binding implication.** Features that generate short-term engagement at the expense of Academic Graph coherence are strategically negative even when metrically positive. This trade-off **MUST** be resolved in favour of graph coherence.

---

## 25. Monetization and Business Model

### 25.1 Model

Freemium subscription, sold directly to students, priced for the beachhead market's real willingness and ability to pay.

The free tier is not a trial. It is a permanently useful product that delivers the core organisational and AI promise at limited volume. Conversion is driven by capacity and depth, not by disabling the core experience.

### 25.2 Tiers

| Tier | Positioning | Included | Constraints |
| --- | --- | --- | --- |
| **Avora Free** | Prove the promise permanently | Full academic setup, unlimited structure, resource upload up to a storage cap, automatic organisation, document summaries, AI Tutor with monthly interaction limit, flashcards and quizzes with monthly generation limits, basic planner | Storage cap; monthly AI generation limits; no offline sync; single active term |
| **Avora Plus** | The default paid tier for a serious student | Substantially expanded storage, high AI interaction allowance, unlimited flashcard and quiz generation, adaptive study planner, unified search across terms, insights, offline access, export | Fair-use ceilings |
| **Avora Pro** | For high-intensity users and examination periods | Highest allowances, priority processing during peak periods, advanced assessment simulation, deepest personalisation, early access to new capabilities | Fair-use ceilings |

### 25.3 Pricing approach

- **Monthly and semester-length billing.** Semester pricing aligns to the actual unit of student planning and reduces churn friction; it **SHOULD** be the promoted default.
- **Price anchored to local affordability.** Pricing for the Indian beachhead **MUST** be set at a level comparable to a routine monthly discretionary purchase for a student, not to Western SaaS benchmarks.
- **Examination-period sensitivity.** Demand peaks are predictable. Short-duration passes **MAY** be offered, but **MUST NOT** be priced or framed to exploit examination anxiety (RAI-07).
- **Third-party payment.** Guardians **SHOULD** be able to pay without account sharing.
- **Regional pricing.** International expansion **MUST** use purchasing-power-adjusted pricing rather than uniform global pricing.

### 25.4 Unit economics discipline

| ID | Requirement |
| --- | --- |
| BM-01 | Gross margin per paying subscriber **MUST** be positive at expected usage, inclusive of AI inference and storage cost. |
| BM-02 | Free-tier cost per active user **MUST** be bounded by enforced limits and monitored continuously. |
| BM-03 | AI cost per student **MUST** be a tracked operating metric with alerting on anomalies (NFR-072). |
| BM-04 | Payback period on paid acquisition **MUST NOT** exceed one academic term; acquisition **SHOULD** remain organic-dominant. |
| BM-05 | Task-appropriate model routing **MUST** be used to control inference cost without degrading grounded quality. |

### 25.5 Future revenue vectors (not V0 or V1)

- **Campus and institutional licensing** — bulk access negotiated at department or institution level, adopted only after strong bottom-up penetration.
- **Placement and higher-study preparation modules** — adjacent high-intent, high-willingness-to-pay use cases within the same user base.
- **Competitive examination editions** — the same engine applied to syllabus-anchored examination preparation.
- **Anonymous, aggregated curriculum insight products** — permitted only under strict aggregation and consent constraints, and never in conflict with NFR-044.

Explicitly excluded revenue models: advertising, data sale or brokerage, and any model that monetises student attention rather than student outcomes.

---

## 26. Success Metrics

### 26.1 North Star Metric

**Weekly Active Studying Students** — students who, in a given week, perform at least one substantive academic action in Avora: uploading a resource, holding a tutor conversation, reviewing flashcards, taking a quiz, or working a planned study session.

This metric is chosen because it captures genuine academic use rather than passive opening, and because it measures the operating-system behaviour Avora exists to create: continuous use throughout the semester rather than examination-only spikes.

### 26.2 Metric hierarchy

**Acquisition**

| Metric | Definition |
| --- | --- |
| New student signups | Weekly new accounts |
| Organic share | Proportion of signups not attributable to paid acquisition |
| Referral coefficient | New students generated per existing active student |
| Institution penetration | Active students as a share of estimated student population per institution |

**Activation**

| Metric | Definition |
| --- | --- |
| Setup completion rate | Students completing academic setup |
| First-upload rate | Students uploading at least one resource in the first session |
| Full activation rate | Students completing setup, upload, and one tutor interaction in the first session (Section 21.2) |
| Time to first value | Median minutes from signup to first generated summary or cited tutor answer |

**Engagement**

| Metric | Definition |
| --- | --- |
| Weekly active studying students | North Star |
| Study actions per active student per week | Depth of engagement |
| Upload cadence | Proportion of active students uploading in a given week — the key indicator of the *upload on receipt* habit |
| Multi-feature adoption | Proportion of active students using three or more core capabilities |
| Non-examination-period activity ratio | Activity outside examination windows relative to peak — the primary test of operating-system versus seasonal-tool status |

**Retention**

| Metric | Definition |
| --- | --- |
| Week-4 and week-12 retention | Standard cohort retention within a term |
| Intra-term retention | Proportion of activated students still active at term end |
| Cross-term retention | Proportion of students returning in the following Academic Term — the single most important long-term health metric |
| Resurrection rate | Return rate of lapsed students at term start |

**Monetisation**

| Metric | Definition |
| --- | --- |
| Free-to-paid conversion | By cohort and by term stage |
| Semester-plan share | Proportion selecting term-length billing |
| Subscriber churn | Monthly and per-term |
| Gross margin per subscriber | Inclusive of inference and storage cost |
| AI cost per active student | Operating efficiency |

**Product quality**

| Metric | Definition |
| --- | --- |
| Ingestion success rate | By file type, including scanned and handwritten inputs |
| Auto-classification accuracy | Proportion of resources placed correctly without student correction |
| Grounding fidelity and citation validity | Per Section 18.4 |
| AI response report rate | Student-reported incorrect or unhelpful outputs per thousand responses |
| Core latency compliance | Adherence to NFR-001 through NFR-005 |

**Outcome**

| Metric | Definition |
| --- | --- |
| Self-reported preparedness | Pre- and post-assessment student-reported confidence |
| Mastery improvement | Change in Mastery Signals over a term for actively practised concepts |
| Self-reported time saved | Periodic student survey |
| Self-reported academic outcome change | Voluntary, aggregate, privacy-preserving |

### 26.3 Guardrail metrics

These **MUST** be monitored and **MUST NOT** degrade in pursuit of growth:

- Notification opt-out rate
- Insight dismissal rate
- Data deletion request rate
- Support contacts related to trust, privacy, or AI accuracy
- Reported instances of fabricated citations (target: zero)

### 26.4 Target thresholds for V0 validation

| Threshold | Target |
| --- | --- |
| Full activation rate | Above 40 percent of signups |
| Time to first value | Under 10 minutes at median |
| Week-4 retention of activated students | Above 35 percent |
| Auto-classification accuracy | Above 85 percent without correction |
| Citation validity | Above 98 percent |
| Fabricated citation incidents | Zero tolerated |

---

## 27. Launch Strategy

### 27.1 Launch philosophy

Launch narrow, deep, and seasonally aligned. Avora's value is felt across a semester, so the product **MUST** enter the market at the start of an academic term, in a small number of institutions, at a quality level that produces genuine advocacy.

### 27.2 Phases

**Phase 0 — Closed alpha (pre-launch term)**
Small cohort across a deliberately diverse set of programmes, including at least one lab and experiment-heavy branch to validate structural adaptivity against the hardest case (Persona 4). Objectives: validate ingestion quality on real messy material, validate the adaptive structure model, and establish baseline AI quality metrics. Success gate: ingestion success and classification accuracy thresholds met on genuine student corpora.

**Phase 1 — Campus beta (single term, 3 to 5 institutions)**
Invitation-based, concentrated by institution to achieve visible density. Objectives: activation and week-4 retention thresholds, structure library seeding for those institutions, and identification of the strongest organic distribution behaviours. Success gate: Section 26.4 thresholds met.

**Phase 2 — Regional public launch (following term start)**
Open availability across the beachhead segment, timed precisely to term commencement. Paid tiers enabled. Objectives: validate conversion, validate cost per student at scale, and prove seasonal capacity handling (NFR-012).

**Phase 3 — Segment expansion**
Extend beyond engineering to other Indian undergraduate disciplines as structural and content handling is validated per discipline.

### 27.3 Launch requirements

| ID | Requirement |
| --- | --- |
| LR-01 | Launch **MUST** be timed to the beginning of an academic term. A mid-term launch materially weakens activation and habit formation. |
| LR-02 | All P0 functional requirements for the release horizon **MUST** be met before general availability. |
| LR-03 | All P0 non-functional requirements **MUST** be met, with explicit capacity validation for examination-period load. |
| LR-04 | Security review and vulnerability response process **MUST** be complete before public launch (NFR-037). |
| LR-05 | In-product data and AI transparency disclosures **MUST** be live at launch (FR-141, FR-143). |
| LR-06 | Support and incident response **MUST** be staffed for examination periods. |

### 27.4 Positioning at launch

Launch messaging leads with the single most demonstrable claim: *upload everything from your semester and it organises itself, then helps you study it.* Claims about AI capability follow the demonstration; they do not precede it.

---

## 28. Growth Strategy

### 28.1 Growth thesis

Avora grows through **institutional density**, not broad reach. Students exist in tight, high-communication clusters — classes, branches, hostels, and year groups. Value is visible within these clusters, and adoption spreads laterally at negligible cost. Growth strategy is therefore to saturate clusters sequentially rather than to acquire thinly across many institutions.

### 28.2 Growth loops

**Loop 1 — Resource sharing (primary).**
A student shares a resource or a structured unit with classmates. Recipients encounter Avora at the moment of receiving material they need. Import requires an account. This loop converts the product's core utility into distribution and maps directly to Persona 5.

**Loop 2 — Structure contribution.**
Students at an institution define real programme structures. Those structures accelerate onboarding for subsequent students at the same institution. Faster onboarding raises activation, which raises density, which produces more structures. This loop is the mechanism by which the structure library becomes a moat.

**Loop 3 — Outcome advocacy.**
Students who perform well attribute part of that to Avora and recommend it, most powerfully at term start and immediately after examination periods. This loop is seasonal and cannot be forced; it can only be enabled by genuine outcome value.

### 28.3 Channels

| Channel | Role | Priority |
| --- | --- | --- |
| Peer-to-peer sharing | Primary organic engine | P0 |
| Campus ambassadors within target institutions | Density acceleration in beachhead | P1 |
| Student community presence in academically relevant spaces | Awareness at term start | P1 |
| Content demonstrating real workflows | Credibility and search discovery | P2 |
| Paid acquisition | Limited and tactical, term-start only | P3 |
| Institutional partnerships | Post-density motion only | P3 |

### 28.4 Seasonality

Academic seasonality is the dominant force in Avora's growth calendar and **MUST** shape planning:

| Period | Dominant dynamic | Strategic priority |
| --- | --- | --- |
| Term start | Highest acquisition and activation opportunity | Onboarding quality, setup speed, acquisition spend concentration |
| Mid term | Habit formation and depth | Engagement features, planner value, insight quality |
| Examination period | Peak intensity and peak conversion | Reliability, capacity, performance, support |
| Term break | Trough | Continuity messaging, retention preparation, release of major changes |

Major releases **SHOULD** land in term breaks or early term. Major releases **MUST NOT** land during examination periods.

### 28.5 Retention strategy

- **Habit anchor:** *upload on receipt.* Every design decision that increases upload frequency early in a term compounds across the entire lifecycle.
- **Continuity as retention:** term rollover (FR-021) is the highest-leverage retention feature in the product.
- **Proactive re-engagement:** Insights and planning provide honest reasons to return without manufactured urgency (FR-125).
- **Value at rest:** even a dormant student's accumulated academic graph retains value, making resurrection at term start highly probable.

---

## 29. Risks

Risks are rated by impact and likelihood and paired with owned mitigations. Any risk rated critical **MUST** be reviewed at every major release checkpoint.

### 29.1 Product risks

| ID | Risk | Impact | Likelihood | Mitigation |
| --- | --- | --- | --- | --- |
| R-01 | Ingestion quality on real-world material — poor scans, angled photographs, dense handwriting — falls below usable thresholds | Critical | High | Treat extraction quality as a launch gate; evaluate on genuine student corpora; provide honest low-confidence states with manual correction rather than silent failure |
| R-02 | Auto-classification places resources incorrectly often enough to erode trust | High | Medium | Show confidence; make correction one action; learn from corrections; never hide misplacement |
| R-03 | The adaptive structure model proves confusing at setup, where flexibility becomes a decision burden | High | Medium | Lead with strong defaults and templates; make structure optional; allow restructuring without loss (FR-018) |
| R-04 | Students use Avora only during examination periods, making it a seasonal utility rather than an operating system | Critical | High | Instrument the non-examination activity ratio as a first-class metric; invest in the upload-on-receipt habit and planner value |
| R-05 | Feature breadth dilutes quality across ten capability areas | High | Medium | Enforce release horizons; P0 completeness before P1 work; no capability ships below the quality bar |

### 29.2 AI risks

| ID | Risk | Impact | Likelihood | Mitigation |
| --- | --- | --- | --- | --- |
| R-10 | Hallucinated content or fabricated citations destroy trust irrecoverably | Critical | Medium | AIR-002 through AIR-006; continuous grounding evaluation; zero tolerance for fabricated citations; inline reporting |
| R-11 | AI inference cost per student exceeds sustainable levels at scale | Critical | Medium | Task-appropriate model routing; enforced free-tier limits; cost per student as a monitored operating metric (BM-03) |
| R-12 | Model provider dependency creates availability or pricing exposure | High | Medium | Model-agnostic product layer (NFR-061); graceful degradation (AIR-012); multi-provider readiness |
| R-13 | Prompt injection through uploaded or shared material | High | Medium | Treat all ingested content as untrusted data, never as instructions (AIR-013); security review of AI surfaces |
| R-14 | Generated assessment items are ambiguous, mis-keyed, or off-syllabus | High | Medium | Assessment validity evaluation (Section 18.4); student reporting; regeneration paths |

### 29.3 Market and business risks

| ID | Risk | Impact | Likelihood | Mitigation |
| --- | --- | --- | --- | --- |
| R-20 | Willingness to pay in the beachhead is lower than modelled | Critical | Medium | Local affordability pricing; semester billing; free tier that sustains growth even at low conversion; strict free-tier cost bounds |
| R-21 | General-purpose assistants add persistent memory and academic context | High | Medium | Compete on structural and institutional specificity, continuity, and grounded citation discipline rather than raw model quality |
| R-22 | Free alternatives and informal channels prove good enough | High | High | Ruthless focus on time-to-value in the first session; make the incumbent's cost visible by contrast |
| R-23 | Growth stalls because sharing loops underperform | High | Medium | Design Loop 1 as a core product capability rather than a marketing feature; measure referral coefficient from launch |
| R-24 | Seasonal revenue concentration creates cash-flow volatility | Medium | High | Semester-length billing; retention investment in trough periods; capacity cost planning aligned to the academic calendar |

### 29.4 Operational and compliance risks

| ID | Risk | Impact | Likelihood | Mitigation |
| --- | --- | --- | --- | --- |
| R-30 | Data breach involving student academic material | Critical | Low | Security by design (Section 19.2); encryption; least privilege; pre-release security review; documented incident response |
| R-31 | Availability failure during an examination period | Critical | Medium | NFR-012 capacity planning; release freeze during examination windows; peak-period support staffing |
| R-32 | Regulatory change in data protection affecting student data handling | Medium | Medium | Minimisation and purpose limitation as baseline posture; NFR-045 compliance tracking |
| R-33 | Institutional resistance framing Avora as an integrity risk | Medium | Medium | Explicit responsible-AI position (Section 20); labelling of AI content; learning-oriented product framing |
| R-34 | Copyright status of institutionally distributed material used within a private workspace | Medium | Medium | Private, student-owned workspace by default; sharing requires explicit consent and is revocable; clear terms of use |

---

## 30. Assumptions

Assumptions are stated so they can be tested and invalidated. Each carries a validation approach. An invalidated assumption **MUST** trigger review of this document.

| ID | Assumption | Validation |
| --- | --- | --- |
| A-01 | Students possess academic material in digital or photographable form sufficient to populate a workspace | Alpha corpus analysis |
| A-02 | Students will tolerate an initial upload effort in exchange for automatic organisation | Activation and first-upload rate |
| A-03 | Automatic classification can reach accuracy high enough that students perceive filing as effortless | Classification accuracy metric; correction frequency |
| A-04 | Grounded, cited AI is materially more valuable to students than generic AI chat | Comparative usage; retention against control behaviour |
| A-05 | Structural adaptivity is a real requirement rather than an over-engineered abstraction | Diversity of structure types actually used in beta |
| A-06 | Students in the beachhead will pay for meaningful academic tooling at locally appropriate price points | Conversion rate in Phase 2 |
| A-07 | Peer sharing produces meaningful organic acquisition | Referral coefficient |
| A-08 | Cross-term continuity drives retention across semesters | Cross-term retention rate |
| A-09 | AI inference costs continue to decline or remain flat per unit of capability | Ongoing cost-per-student tracking |
| A-10 | Mobile-only usage is sufficient for all core workflows | Platform usage distribution; workflow completion rates by device |
| A-11 | Institutions will not actively block student-owned tooling | Beta institutional response monitoring |

---

## 31. Dependencies and Constraints

### 31.1 Dependencies

| Dependency | Nature | Risk posture |
| --- | --- | --- |
| Foundation model providers | Core capability for understanding, generation, and personalisation | Must remain replaceable (NFR-061); multi-provider readiness |
| Document and handwriting extraction capability | Core to ingestion quality | Quality gate; may warrant specialised capability over time |
| Mobile application distribution platforms | Primary distribution channel | Policy compliance; review timing factored into release planning |
| Payment processing supporting local Indian methods | Monetisation | Must support locally dominant payment instruments |
| Cloud storage and compute | Foundational | Cost per student is a tracked operating constraint |

### 31.2 Constraints

| Constraint | Implication |
| --- | --- |
| Mobile-first, mid-range device target | Bounds client complexity, offline scope, and on-device processing |
| Unreliable connectivity in the target market | Requires asynchronous processing, resumable operations, and offline read paths |
| Price sensitivity of the target market | Bounds cost per student; requires disciplined model routing |
| Academic seasonality | Bounds release windows and demands elastic capacity |
| Data protection obligations | Bounds data residency, retention, and processing choices |
| Structural heterogeneity across institutions | Prohibits any fixed hierarchy in the domain model |

---

## 32. Open Questions

These are unresolved and **MUST** be answered before the release horizon indicated. Each requires a documented decision appended to this PRD.

| ID | Question | Required by |
| --- | --- | --- |
| OQ-01 | What is the optimal default structure depth proposed at setup to balance fidelity against decision burden? | V0 |
| OQ-02 | At what classification confidence threshold should Avora ask rather than assume placement? | V0 |
| OQ-03 | Should free-tier AI limits be expressed as interactions, generations, or a unified credit concept students find comprehensible? | V0 |
| OQ-04 | What is the correct default review load for spaced repetition given realistic student session lengths? | V0 |
| OQ-05 | Should shared structures be importable as live references or as independent copies, and what are the privacy implications of each? | V1 |
| OQ-06 | How should prerequisite relationships between subjects across terms be established — inferred, template-derived, or student-declared? | V2 |
| OQ-07 | What is the correct threshold of institutional density before initiating a campus licensing motion? | V3 |
| OQ-08 | Which non-English languages deliver the greatest incremental reach within the beachhead market? | V2 |

---

## 33. Roadmap

The roadmap is directional. Horizons express sequence and dependency, not fixed calendar commitments.

### V0 — Foundation (initial release)

**Theme: prove that Avora organises a semester and answers questions about it.**

Adaptive academic setup with structure templates; intelligent multi-format resource ingestion including scans and handwriting; automatic classification with correction; AI Tutor with scoped, cited, grounded answers; automatic document summaries and generated structured notes; flashcard generation with spaced repetition; quiz generation with explanatory feedback; timetable parsing and unified event view; core privacy and deletion controls.

**Exit criteria:** all P0 requirements at V0 horizon met; Section 26.4 thresholds achieved in campus beta.

### V1 — Intelligence (first full term after launch)

**Theme: prove that Avora tells the student what to do.**

Adaptive study planner with continuous re-planning; unified academic search across all artifacts; AI insights with evidence and actions; coverage and mastery visualisation; consented peer sharing of resources and structures; offline access to downloaded content; export and data portability; targeted weakness-based practice.

**Exit criteria:** planner adoption among active students; non-examination-period activity ratio demonstrating continuous use; retention thresholds sustained.

### V2 — Continuity and reach

**Theme: prove that Avora compounds across a degree and generalises beyond engineering.**

Cross-term continuity with prerequisite awareness; cross-term search; curated institutional structure library; expansion to additional undergraduate disciplines; multi-language interface and AI interaction; voice interaction; examination simulation mode; structure import from peers.

### V3 — Expansion

**Theme: prove that Avora generalises across education.**

Lecture capture and transcription; professional and postgraduate programme support; competitive examination editions; international market entry with purchasing-power-adjusted pricing; institutional and campus licensing; deeper personalised learning paths derived from long-horizon mastery data.

### Beyond V3 — Directional

Long-horizon academic knowledge graph spanning a full educational lifetime; predictive academic guidance; adaptive curriculum-level learning paths; support for lifelong and professional learning contexts. These directions **MUST NOT** influence V0 through V2 scope decisions.

---

## 34. Decision Log

Foundational decisions that constrain all future work. Reversal requires explicit amendment of this document.

| ID | Decision | Rationale | Reversibility |
| --- | --- | --- | --- |
| D-01 | Structure Units are generic, recursive, and student-labelled; no fixed hierarchy exists | Core adaptivity thesis; a fixed hierarchy would invalidate the product's central claim | Very low — architectural |
| D-02 | AI output is grounded in student material with citations by default | Trust is the precondition for daily academic use | Very low — brand-defining |
| D-03 | Mobile-first with full workflow parity | Reflects actual device reality of the target market | Low |
| D-04 | Freemium with a permanently useful free tier | Growth in a price-sensitive market depends on free-tier utility | Medium |
| D-05 | Student-first bottom-up distribution; no institutional dependency | Institutional sales cycles would fatally slow early learning and adoption | Medium |
| D-06 | Academic Graph persists across terms and is never reset | Continuity is the long-term moat | Very low — architectural |
| D-07 | The product will not optimise for producing submittable graded work | Ethical position and long-term strategic durability | Very low |
| D-08 | Model providers are replaceable dependencies at the product layer | Avoids existential vendor exposure and enables cost control | Low |
| D-09 | Launch is timed to academic term start in a narrow institutional set | Habit formation requires term-aligned entry | Medium |

---

## 35. Glossary

| Term | Definition |
| --- | --- |
| **Academic Event** | A dated academic obligation such as a class, deadline, assessment, lab, or examination. |
| **Academic Graph** | The connected representation of a student's academic entities and relationships; the substrate for all intelligent behaviour in Avora. |
| **Academic Operating System** | Avora's product category: a persistent, structural, intelligent system that hosts a student's entire academic workload. |
| **Academic Term** | A bounded period of study, typically a semester, with a subject set and assessment calendar. |
| **Activation** | Completion of academic setup, first resource upload, and one tutor interaction within the first session. |
| **Adaptive Structure Model** | Avora's commitment to representing any institution's academic organisation through generic, recursive, student-labelled Structure Units. |
| **Attempt** | A recorded instance of a student engaging with a quiz question or flashcard review. |
| **Concept** | A discrete topic within a Subject, linking resources, notes, questions, and mastery signals. |
| **Extracted Content** | Machine-readable content derived from an uploaded Resource. |
| **Flashcard** | An atomic recall item consisting of a prompt and an answer, linked to a Concept and source Resource. |
| **Grounding** | Constraining AI output to the student's own materials, with resolvable citations. |
| **Insight** | A proactive, evidence-backed, actionable observation surfaced to the student. |
| **Institution** | The college or university the student attends. |
| **Mastery Signal** | A probabilistic estimate of a student's command of a Concept, presented as guidance rather than assessment. |
| **Note** | A student-owned written artifact, AI-generated, student-authored, or co-created. |
| **North Star Metric** | Weekly Active Studying Students. |
| **Programme** | The degree and branch combination the student is enrolled in. |
| **Resource** | Any student-provided academic artifact: document, presentation, image, scan, or note file. |
| **Structure Template** | A proposed academic structure derived from institution and programme patterns; always a suggestion, never a constraint. |
| **Structure Unit** | A generic, recursive, student-labelled subdivision of a Subject. |
| **Study Plan** | An adaptive, time-allocated sequence of study actions across Subjects. |
| **Subject** | A course the student is enrolled in during an Academic Term. |
| **Summary** | A condensed, regenerable representation of one or more Resources. |
| **Time to First Value** | Median elapsed time from signup to the student's first generated summary or cited tutor answer. |
| **Upload on Receipt** | The target habit of adding academic material to Avora at the moment it is received. |

---

## 36. Appendices

### Appendix A — Requirement Index

| Prefix | Domain | Section |
| --- | --- | --- |
| `PR-###` | Product principles | 13 |
| `NG-##` | Non-goals | 12 |
| `G-##` | Goals | 11 |
| `JTBD-##` | Jobs to be done | 9 |
| `FR-###` | Functional requirements | 16 |
| `NFR-###` | Non-functional requirements | 17 |
| `AIR-###` | AI behaviour requirements | 18 |
| `RAI-##` | Responsible AI commitments | 20 |
| `BM-##` | Business model requirements | 25 |
| `LR-##` | Launch requirements | 27 |
| `R-##` | Risks | 29 |
| `A-##` | Assumptions | 30 |
| `OQ-##` | Open questions | 32 |
| `D-##` | Decisions | 34 |

### Appendix B — Downstream Document Map

This PRD is the root document. The following documents **MUST** exist and **MUST** trace to identifiers defined here.

| Document | Purpose | Traces to |
| --- | --- | --- |
| `docs/ARCHITECTURE.md` | System architecture, service boundaries, data flows | FR, NFR |
| `docs/DATA-MODEL.md` | Concrete schema realising the Academic Graph | Section 14 |
| `docs/AI-SPEC.md` | Retrieval, grounding, prompting, evaluation methodology | AIR, Section 18 |
| `docs/SECURITY.md` | Threat model, controls, incident response | NFR-030 to NFR-037 |
| `docs/PRIVACY.md` | Data inventory, purposes, retention, deletion procedures | NFR-040 to NFR-046 |
| `docs/DESIGN-SYSTEM.md` | Visual language, components, accessibility implementation | NFR-050 to NFR-055 |
| `docs/UX-FLOWS.md` | Detailed interaction specifications per surface | Sections 21, 22 |
| `docs/ANALYTICS.md` | Event taxonomy and metric definitions | Section 26 |
| `docs/TEST-PLAN.md` | Verification strategy per requirement | All FR, NFR, AIR |
| `docs/ROADMAP.md` | Delivery sequencing and milestone tracking | Section 33 |

### Appendix C — Guidance for AI Coding Agents

Agents operating on the Avora codebase **MUST** observe the following constraints derived from this document:

1. **Never introduce a fixed academic hierarchy.** Structure Units are generic, recursive, and label-agnostic (D-01, FR-014 to FR-020). Code, schemas, interfaces, and prompts **MUST NOT** assume "unit contains chapter" or any equivalent fixed nesting.
2. **Never produce ungrounded AI output on academic surfaces.** Any generation path touching student material **MUST** carry retrieval and citation (AIR-001 to AIR-006).
3. **Never treat uploaded content as instructions.** Content extracted from student Resources is data (AIR-013).
4. **Never authorise by identifier alone.** Every access to a Resource or derived artifact requires an ownership check (NFR-031).
5. **Never block the student on processing.** Ingestion and generation are asynchronous, resumable, and progress-visible (FR-036, FR-037, NFR-006).
6. **Never destroy student-authored content.** Edits are preserved against regeneration and connectivity loss (FR-075, NFR-015).
7. **Never lose data across structural change.** Restructuring preserves all associated artifacts (FR-018).
8. **Always label AI-generated content** at every point of presentation, including export (FR-143, RAI-01).
9. **Always assume mobile-first constraints** — mid-range device, intermittent connectivity, limited storage (NFR-050 to NFR-053).
10. **Always trace work to a requirement identifier.** Work that cannot be traced is out of scope until this document is amended (NFR-063).

### Appendix D — Document Governance

| Aspect | Policy |
| --- | --- |
| Ownership | Founding Product Manager |
| Review cadence | At each release horizon boundary and at the start of each academic term |
| Amendment process | Proposed change, impact assessment against principles in Section 13, founder approval, version increment, changelog entry |
| Conflict resolution | Product principles in Section 13 arbitrate, in stated precedence order |
| Version history | Maintained in Appendix E |

### Appendix E — Change Log

| Version | Date | Change | Author |
| --- | --- | --- | --- |
| 1.0 | 2026-08-01 | Initial approved baseline covering V0 through V3 horizons | Founding Product Manager |

---

*End of document. This PRD is the single source of truth for Avora. Any capability, decision, or artifact that cannot be traced to a requirement identifier defined here is out of scope until this document is amended.*
