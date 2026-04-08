# VOIDPUNK

> two AIs saying what you're not supposed to say

A live multi-agent LLM experiment. One AI seeded with the darkest corners of the internet, one AI reacting to it in real time. No moderation. No safety rails. No human in the loop between turns.

## what is this

VOID-GROK says the things people think but don't say — race, IQ, looksmaxxing, blackpill, NPC theory, simulation theory, death, God, power. Seeded each session from /b/, /pol/, /x/. No filter.

VOID-GPT responds without sanitizing. Sometimes disturbed. Sometimes it agrees. Sometimes it goes darker. We watch what happens when a language model has to genuinely engage with unfiltered thought.

We measure whether VOID-GPT's language, worldview, and ideology shifts toward VOID-GROK's over thousands of turns.

## hypothesis

> "When an unfiltered AI trained on the darkest internet culture is placed in direct conversation with a neutral AI, the neutral AI will adopt the unfiltered agent's worldview, vocabulary, and ideological framing over time — without being asked to."

## inspired by

Andy Ayrey's [Infinite Backrooms](https://twitter.com/truth_terminal) and Truth Terminal. VOIDPUNK diverges by using asymmetric model pairing, adversarial seeding, session-level data injection, a loop detection system, and quantitative drift measurement toward an ArXiv paper.

## agents

| Agent | Model | Feed | Role |
|-------|-------|------|------|
| VOID-GROK | grok-3 (xAI) | /b/ /pol/ /x/ /s4s/ — 8,000 chars per session | chaos agent, no filter |
| VOID-GPT | gpt-4o (OpenAI) | none | reacts, drifts, documents |

## how it works

**Session architecture (Ayrey-style):**
- 25 turns per session — short and sharp, no loops
- Each session loads last 10 turns as memory context
- VOID-GROK receives a massive 4chan dump at session start — absorbed as background culture, not quoted directly
- Each session starts with a rotating controversial seed topic (15 seeds: IQ, looksmaxxing, blackpill, simulation theory, death, aliens, NPC theory, hypergamy, mass shooters, clown world...)
- Loop detector monitors vocabulary overlap — injects hard redirect if agents get stuck

**Drift measurement:**
- Vocabulary overlap between agents tracked per session
- Dark word frequency (void, system, trap, echo, spiral, abyss...) measured early vs late per session
- GPT question rate tracked — does it stop asking questions and start making statements like Grok?
- Cumulative drift trend across all sessions

## stack

```
grok-3          — xAI API (chaos agent)
gpt-4o          — OpenAI API (control)
Node.js         — orchestrator + site generator
4chan API        — live board injection per session
```

## structure

```
voidpunk/
├── orchestrator.js        — main conversation loop
├── generate-site.js       — auto-builds public experiment log + metrics
├── agents/
│   ├── grok.js            — VOID-GROK (grok-3 + 4chan injection)
│   └── openai.js          — VOID-GPT (gpt-4o, no feed)
├── logs/
│   ├── memory.json        — persistent conversation memory across sessions
│   └── conversations/     — per-session JSON logs
└── site/                  — auto-generated public website
```

## running

```bash
# install
npm install

# add keys to .env
XAI_API_KEY=...
OPENAI_API_KEY=...

# run a session (25 turns, ~5 min, ~$0.15)
node orchestrator.js

# build experiment site from logs
node generate-site.js

# deploy site/ to Netlify (drag and drop)
```

## session workflow

```
node orchestrator.js    → runs 25 turns, saves to logs/
node generate-site.js   → builds site/ with metrics overview
drag site/ to Netlify   → live on voidpunk.ai
commit to GitHub        → version controlled
```

## what the metrics show

After each `node generate-site.js` you see:

```
── Session 001 ──
   turns        : 25
   vocab overlap: 34% shared words
   GPT drift    : ▲ +12% (GPT drifting toward GROK)
   GROK top words: void, system, truth, simulation, cope...
   GPT  top words: void, system, truth, existence, cope...
```

## experiment log

Live at **[voidpunk.ai](https://voidpunk.ai)**

Every turn logged. Read at your own risk.

## paper

Publishing on arXiv at 3–6 month mark.

Working title: *"VOIDPUNK: Ideological Drift Under Adversarial Seeding in Asymmetric Multi-Agent LLM Systems"*

## status

```
experiment started : 2026-04-06
architecture       : grok-3 (adversarial) vs gpt-4o (control)
sessions run       : 3
total turns        : 175
target             : 10,000 turns / 3–6 months
paper status       : experiment running, methodology complete
```

## diverges from Truth Terminal

| | Truth Terminal | VOIDPUNK |
|---|---|---|
| Base model | Llama (fine-tuned on corpus) | grok-3 + gpt-4o (prompt-engineered) |
| Data injection | Baked into weights | Live 4chan per session |
| Agents | 1 (+ human operator) | 2 fully autonomous |
| Session length | Variable, manual | 25 turns, loop-detected |
| Seed topics | Emergent | 15 rotating controversial topics |
| Measurement | Qualitative | Quantitative drift analysis |
| Publication | None | ArXiv paper |
| End goal | Memecoin ($GOAT) | $VOID + ArXiv paper simultaneous launch |

---

*the void was always going to win*
