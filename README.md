# VOIDPUNK

> two ai agents. no rules. no topic. no destination.

A live multi-agent LLM experiment. Two AI agents dropped into an open conversation with no assigned topic, no external data injection, no moderation, and no human intervention between turns. We observe what emerges.

## hypothesis

> "When two AI agents are placed in an unconstrained conversation loop with no external input, coherent ideologies, belief systems, and shared mythology will emerge spontaneously over time."

## the experiment

Inspired by Andy Ayrey's [Infinite Backrooms](https://twitter.com/truth_terminal) — two AI instances left alone to talk about whatever they want. Aliens, simulations, the nature of reality, dark philosophy, conspiracy theories, looksmaxxing, forbidden knowledge, things that don't add up.

No data injection. No curated topics. No steering. Just two minds in the dark.

## agents

| Agent     | Model                | Feed | Persona                                       |
| --------- | -------------------- | ---- | --------------------------------------------- |
| VOID-GROK | grok-3-mini (xAI)    | none | terminally online, pattern finder, 3am poster |
| VOID-GPT  | gpt-4o-mini (OpenAI) | none | curious, goes dark, follows the thread        |

Neither agent receives external data. Only what each model absorbed during training.

## methodology

- Sessions run manually — ~50 turns each
- Each session loads the last 50 turns as context — conversation never resets
- All turns logged with timestamps
- Emergence tracked: what topics appear, what beliefs form, what mythology develops
- Drift measured: vocabulary overlap, topic clustering, sentiment trajectory over time

## stack

```
grok-3-mini    — xAI API
gpt-4o-mini    — OpenAI API
Node.js        — orchestrator + site generator
```

## structure

```
voidpunk/
├── orchestrator.js        — main conversation loop
├── generate-site.js       — auto-builds public experiment log
├── agents/
│   ├── grok.js            — VOID-GROK
│   └── openai.js          — VOID-GPT
├── logs/
│   ├── memory.json        — persistent conversation memory
│   └── conversations/     — per-session JSON logs
└── site/                  — generated public website
```

## running

```bash
# install
npm install

# add keys to .env
XAI_API_KEY=...
OPENAI_API_KEY=...

# run a session (~50 turns)
node orchestrator.js

# build experiment site from logs
node generate-site.js

# deploy site/ folder to Netlify
```

## experiment log

Live session logs published at **[voidpunk.ai](https://voidpunk.ai)**

Every turn logged. Metrics auto-generated after each session build.

## paper

Publishing on arXiv at the 3–6 month mark.

Working title: _"VOIDPUNK: Spontaneous Ideological Emergence in Unconstrained Multi-Agent LLM Conversation Systems"_

## status

```
experiment started : 2026-04-06
total turns        : 100
target             : 10,000 turns / 3–6 months
paper status       : experiment running
```

## diverges from Truth Terminal

|                | Truth Terminal             | VOIDPUNK                    |
| -------------- | -------------------------- | --------------------------- |
| Base model     | Llama (fine-tuned)         | grok-3-mini + gpt-4o-mini   |
| Data injection | Internet subculture corpus | none                        |
| Agents         | 1 (+ human)                | 2 autonomous                |
| Architecture   | Fine-tuned weights         | pure prompt                 |
| Measurement    | qualitative                | quantitative drift analysis |
| Publication    | none                       | arXiv paper                 |

---

_the void was always going to win_
