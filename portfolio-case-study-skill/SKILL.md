---
name: portfolio-case-study
description: Generate, format, and review portfolio case studies optimized for design leadership hiring. Use when creating case study content, reviewing draft case studies, extracting metrics from project history, or formatting portfolio narratives. Triggers on requests to write case studies, review portfolio content, extract impact metrics, draft project descriptions, or improve portfolio copy. Adapts product design case study conventions for design ops, creative technology, and design leadership roles.
---

# Portfolio Case Study Skill

Generate and review portfolio case studies using patterns derived from competitive analysis of designers hired at top-tier enterprise SaaS and tech companies. See [references/portfolio-patterns.md](references/portfolio-patterns.md) for the full pattern library and evaluation criteria.

## Modes

This skill operates in three modes:

1. **Intake + Draft** — Gather raw material from the user, extract metrics, produce a structured draft
2. **Review** — Evaluate existing case study content against the pattern library
3. **Refine** — Take a draft and sharpen it against specific criteria

Determine the mode from user intent. If unclear, ask.

## Mode 1: Intake + Draft

### Step 1: Context Gathering

Use `AskQuestion` to collect project fundamentals. Ask in batches of 3-4 questions max. Start with:

**Batch 1 — Project Identity:**
- What was the project/initiative? (name and one-line description)
- What was your role and title?
- Who was on the team? (roles and approximate count)
- What was the timeline?

**Batch 2 — Problem and Stakes:**
- What business problem or organizational gap did this address?
- Who felt the pain? (users, teams, leadership, customers)
- What was happening before you got involved? (the "before" state)
- What would have happened if nobody solved this?

**Batch 3 — What You Did:**
- What were the 2-3 most important decisions you made?
- What did you build, ship, establish, or change?
- Where did you face resistance or constraints, and how did you navigate them?
- Who did you need to align or influence?

### Step 2: Professional Signals

Before metrics, surface the signals that hiring managers read between the lines for. Ask using `AskQuestion`:

**Scope and ownership:**
- What parts of this did YOU specifically own versus what the team owned? (Aim for 1-2 things only you could speak to.)
- Did you inherit an existing system or build from scratch? (Signals context comfort.)

**Operating mode:**
- Were you leading, executing, or both? Did that shift over the project? (Range signal.)
- How much context existed when you started — clear brief, rough direction, or ambiguity?

**Velocity:**
- What's the tightest timeline in this story? Any "shipped in X weeks" moments?
- Were there phases — a fast initial push then iteration, or steady build?

Weave these into the draft as exposition, not as a separate section. For guidance on how to surface each signal, see "Professional Signals" in [references/portfolio-patterns.md](references/portfolio-patterns.md).

### Step 3: Impact Calculator

Run a structured metrics interview using `AskQuestion` with multiple-choice options for each question. Read "Metrics Extraction by Role Type" and "Impact Calculator" in [references/portfolio-patterns.md](references/portfolio-patterns.md) before asking.

The goal: turn every qualitative claim into a data-backed statement the reader can scan. Use `AskQuestion` to walk through each impact area with concrete options the user can select from — never open-ended text prompts. Build the multiple-choice options from reasonable ranges based on the context gathered in Steps 1-2.

**Time savings:** Ask for people affected (offer ranges: ~10, ~25, ~50, ~100+), time saved per instance (offer: 15min, 30min, 1hr, 2hrs+), and frequency (daily, weekly, per sprint, per project). Compute total and translate to business language.

**Cost impact:** Ask what the problem cost and what changed. Offer ranges, not blanks.

**Scale and adoption:** Ask for reach — teams, designers, products, users. Offer ranges.

**Before/after:** For every claim, ask "what was the number before and what is it now?" Offer plausible before/after pairs as options.

If the user doesn't have hard numbers, help them construct defensible estimates using the formulas in the reference file. Metrics tell a story — they don't need to be auditable, they need to be honest and directionally right.

**Important:** Always use `AskQuestion` with selectable multiple-choice options throughout the intake process — Steps 1, 2, and 3. Never fall back to asking questions as plain text in the chat. Every question should have 3-5 concrete options plus a "Let me give you different numbers" or "More nuanced" escape hatch.

### Step 4: Draft Generation

Structure the case study using the anatomy from the pattern library. Read "Case Study Anatomy" in [references/portfolio-patterns.md](references/portfolio-patterns.md) before drafting.

**Required elements:**
1. Project header (title, role, team, timeline, tags)
2. Overview (2-3 sentences: what you joined, what you did, what changed)
3. Problem framing (business context, not feature description)
4. 2-4 solution sections (each: decision framed as a response to a challenge)
5. Outcomes (metrics, proof, or credible before/after)

**Tone targets:**
- First person, active voice, past tense
- "I" for decisions and strategy, "We" for team outcomes and launches
- Strong verbs: led, designed, built, shipped, established, shaped, defined, drove
- Never: helped with, assisted, contributed to, was part of
- Business vocabulary over design jargon
- No process narration ("first I did research, then I made wireframes...")
- No tool lists, no design philosophy statements

**Length targets:**
- Overview: 2-3 sentences
- Problem section: 3-5 sentences
- Each solution section: 4-8 sentences
- Outcome section: 2-4 sentences with hard numbers
- Total case study: 600-1200 words

### Step 5: Adaptation Check

After drafting, verify the content against the user's role type. Read "Role Adaptation" in [references/portfolio-patterns.md](references/portfolio-patterns.md).

For design ops / creative technology / design leadership:
- Reframe any "I designed [feature]" language toward "I built [system/process/tool]" or "I established [practice/framework]"
- Ensure metrics use operational vocabulary (adoption, velocity, scale, consolidation) not just product metrics (conversion, retention)
- Check that cross-functional influence is visible — design ops lives at intersections
- Verify that the story shows systems thinking, not just execution

## Mode 2: Review

Read the full pattern library at [references/portfolio-patterns.md](references/portfolio-patterns.md), then evaluate the content against each pattern category. Produce a structured review:

| Category | Rating | Notes |
|----------|--------|-------|
| Identity statement | strong / adequate / weak | ... |
| Problem framing | strong / adequate / weak | ... |
| Voice and tone | strong / adequate / weak | ... |
| Metrics and proof | strong / adequate / weak | ... |
| Professional signals | strong / adequate / weak | ... |
| Structure and scanning | strong / adequate / weak | ... |
| Strategic absence | strong / adequate / weak | ... |
| Role-appropriate framing | strong / adequate / weak | ... |

For each "adequate" or "weak" rating, provide a specific rewrite suggestion with before/after examples.

Flag any of these anti-patterns:
- Process narration ("First I conducted interviews...")
- Tool lists ("Built in Figma, managed in Jira")
- Hedging language ("helped with," "contributed to," "was part of")
- Design philosophy statements ("I believe design should be...")
- Comprehensive breadth over selective depth
- Missing metrics or vague outcomes

## Mode 3: Refine

Take a specific piece of feedback or a weak area from a review and produce targeted rewrites. Show before/after for each change. Preserve the user's voice — improve structure and impact, don't homogenize.

## Quality Bar

The standard is higher than ever. AI tools have raised baseline expectations for polish and organization. Content that would have passed as "fine" two years ago now reads as undercooked. Every section should feel like it was written by someone who thinks clearly, communicates precisely, and respects the reader's time. The case study is proof of the same craft the designer claims to bring to their work.
