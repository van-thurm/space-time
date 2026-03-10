# Portfolio Case Study Skill

An AI agent skill for generating, reviewing, and refining portfolio case studies — optimized for design leadership, design ops, and creative technology roles.

## What it does

- **Intake + Draft**: Structured Q&A that walks you through project context, professional signals, and an impact calculator to produce a formatted case study draft
- **Review**: Evaluates existing case study content against proven patterns with specific rewrite suggestions
- **Refine**: Targeted before/after rewrites for weak areas

## What's in the box

| File | Purpose |
|---|---|
| `SKILL.md` | Process engine — intake workflow, review rubric, and drafting guidelines |
| `references/portfolio-patterns.md` | Pattern library — identity statements, case study anatomy, voice/tone rules, metrics formulas, vanity metric detection, and role-specific adaptations |

## Key features

**Impact Calculator** — Asks component questions (people affected, time saved, frequency) and computes portfolio-ready metrics statements. Covers time savings, cost impact, scale/reach, adoption, and velocity. Helps construct defensible estimates when hard numbers aren't available.

**Vanity Metric Detection** — Flags output counts and participation numbers (e.g., "70 attendees," "185 deliverables produced") that aren't tied to business impact. Pushes toward metrics that survive a "so what?" test.

**Professional Signals** — Surfaces hiring-manager-readable signals: individual vs team scope, timeline as velocity indicator, context comfort (built from scratch vs navigated existing complexity), and leading vs executing range.

**Role Adaptation** — Maps standard product design case study patterns to design ops, creative technology, and design leadership equivalents. Different metrics vocabulary, different framing, same structural rigor.

## Install

Copy the `SKILL.md` and `references/` directory into your Cursor skills folder:

```
~/.cursor/skills/portfolio-case-study/
├── SKILL.md
└── references/
    └── portfolio-patterns.md
```

The skill triggers when you ask to write case studies, review portfolio content, extract impact metrics, draft project descriptions, or improve portfolio copy.

## Methodology

Patterns derived from competitive analysis of portfolios by designers hired at top-tier enterprise SaaS and tech companies. Content analysis across 8 portfolios and public industry discussion examining structure, tone, word choice, metrics usage, and narrative strategy.

## License

MIT
