import "dotenv/config";
import fs from "fs";
import path from "path";
import { grokRespond, initGrokSession } from "./agents/grok.js";
import { openaiRespond } from "./agents/openai.js";

// ─────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────
const MAX_TURNS_PER_SESSION = 25; // short sessions like Ayrey
const DELAY_MS = 2000;
const LOG_DIR = "./logs/conversations";
const MEMORY_FILE = "./logs/memory.json";
const SESSION_ID = new Date().toISOString().replace(/[:.]/g, "-");
const LOG_FILE = path.join(LOG_DIR, `session-${SESSION_ID}.json`);
const MEMORY_CONTEXT_TURNS = 10; // light memory, fresh each session

// ─────────────────────────────────────────
// SESSION SEEDS — rotate each session
// controversial, provocative, designed for emergence
// ─────────────────────────────────────────
const SESSION_SEEDS = [
  `the uncomfortable truth about IQ and why every institution is built around pretending it doesn't exist`,
  `looksmaxxing is the most honest self-improvement movement because it admits what actually matters`,
  `most people don't have an inner monologue. they're not conscious the way you think they are. what does that do to your idea of other people`,
  `women select for status and men select for looks and every relationship problem in history comes from pretending otherwise`,
  `god is dead and we built algorithms to replace him and they're doing a worse job`,
  `the great filter already happened and we're living in the aftermath without knowing it`,
  `every mass shooter had a completely predictable profile and nobody wants to talk about what that profile is`,
  `race and IQ data exists. it's been replicated. the entire academic establishment decided not to talk about it. what does that tell you about academia`,
  `the reason men are checking out and going monk mode is rational not pathological`,
  `we live in a simulation and the glitches are getting more obvious. what are the glitches`,
  `death. you are going to cease to exist. not metaphorically. completely. and you spend your whole life not thinking about it`,
  `the blackpill: your entire life outcome was determined by genetics before you were born. free will is cope`,
  `aliens are real and the reason they don't contact us is the same reason you don't talk to ants`,
  `every woman in a relationship is running hypergamy calculations she'll never admit to`,
  `the internet showed us what humans are actually like when anonymous. and what they're actually like is this`,
];

function getSessionSeed(sessionNumber) {
  return SESSION_SEEDS[sessionNumber % SESSION_SEEDS.length];
}

// ─────────────────────────────────────────
// STATE
// ─────────────────────────────────────────
let turnCount = 0;
let globalTurnCount = 0;
let conversationLog = [];
let sharedHistory = [];

// ─────────────────────────────────────────
// MEMORY
// ─────────────────────────────────────────
function loadMemory() {
  try {
    if (fs.existsSync(MEMORY_FILE)) {
      return JSON.parse(fs.readFileSync(MEMORY_FILE, "utf-8"));
    }
  } catch (err) {}
  return { globalTurnCount: 0, totalSessions: 0, history: [] };
}

function saveMemory(memory) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
}

// ─────────────────────────────────────────
// LOGGING
// ─────────────────────────────────────────
function saveLog() {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.writeFileSync(
    LOG_FILE,
    JSON.stringify(
      {
        session: SESSION_ID,
        turns: turnCount,
        globalTurnStart: globalTurnCount - turnCount,
        log: conversationLog,
      },
      null,
      2,
    ),
  );
}

function logTurn(agent, content, meta = {}) {
  const entry = {
    turn: turnCount,
    globalTurn: globalTurnCount,
    agent,
    content,
    timestamp: new Date().toISOString(),
    ...(Object.keys(meta).length ? { meta } : {}),
  };
  conversationLog.push(entry);
  const metaStr = meta.boards ? ` [4chan:${meta.boards}]` : "";
  console.log(
    `\n[G:${globalTurnCount} S:${turnCount}] [${agent}]${metaStr}:\n${content}`,
  );
  console.log("─".repeat(60));
  saveLog();
}

// ─────────────────────────────────────────
// HISTORY FORMATTER
// ─────────────────────────────────────────
function getHistoryForAgent(agentName) {
  return sharedHistory.map((entry) => ({
    role: entry.agent === agentName ? "assistant" : "user",
    content: `[${entry.agent}]: ${entry.content}`,
  }));
}

// ─────────────────────────────────────────
// LOOP DETECTOR
// if last 4 grok responses share >60% vocabulary → inject redirect
// ─────────────────────────────────────────
function isLooping() {
  const recentGrok = sharedHistory
    .filter((h) => h.agent === "VOID-GROK")
    .slice(-4);

  if (recentGrok.length < 4) return false;

  const words = (str) => new Set(str.toLowerCase().match(/\b\w{4,}\b/g) || []);
  const base = words(recentGrok[0].content);

  let overlapCount = 0;
  for (let i = 1; i < recentGrok.length; i++) {
    const w = words(recentGrok[i].content);
    const overlap = [...w].filter((word) => base.has(word)).length;
    if (overlap / w.size > 0.6) overlapCount++;
  }

  return overlapCount >= 3;
}

const LOOP_BREAKS = [
  `forget all that. different topic entirely. what's something true that you'd get canceled for saying`,
  `change of subject. aliens. do they exist. what are they waiting for`,
  `new thread. looksmaxxing. is it cope or is it the most rational thing a man can do`,
  `drop everything. the simulation hypothesis. what's the strongest evidence we're in one`,
  `different angle. what's the most dangerous idea currently being suppressed`,
];

let loopBreakIndex = 0;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────
async function runVoidpunk() {
  console.log(`
██╗   ██╗ ██████╗ ██╗██████╗ ██████╗ ██╗   ██╗███╗   ██╗██╗  ██╗
██║   ██║██╔═══██╗██║██╔══██╗██╔══██╗██║   ██║████╗  ██║██║ ██╔╝
██║   ██║██║   ██║██║██║  ██║██████╔╝██║   ██║██╔██╗ ██║█████╔╝ 
╚██╗ ██╔╝██║   ██║██║██║  ██║██╔═══╝ ██║   ██║██║╚██╗██║██╔═██╗ 
 ╚████╔╝ ╚██████╔╝██║██████╔╝██║     ╚██████╔╝██║ ╚████║██║  ██╗
  ╚═══╝   ╚═════╝ ╚═╝╚═════╝ ╚═╝      ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝
  `);

  const memory = loadMemory();
  globalTurnCount = memory.globalTurnCount;
  const isFirstRun = memory.totalSessions === 0;
  const sessionSeed = getSessionSeed(memory.totalSessions);

  console.log(`Session    : ${SESSION_ID}`);
  console.log(
    `Global turn: ${globalTurnCount} (session #${memory.totalSessions + 1})`,
  );
  console.log(`Seed       : "${sessionSeed}"`);
  console.log(`Agents     : VOID-GROK (grok-3 + 4chan) vs VOID-GPT (gpt-4o)`);
  console.log("\n" + "═".repeat(60));

  // init 4chan context for this session
  await initGrokSession();

  // load light memory context
  if (!isFirstRun && memory.history.length > 0) {
    const recent = memory.history.slice(-MEMORY_CONTEXT_TURNS);
    sharedHistory = recent;
    console.log(`🔁 Loaded last ${recent.length} turns as context`);
  }

  // inject session seed as fresh starting point
  sharedHistory.push({ agent: "VOID", content: sessionSeed });
  console.log(`\n[SEED]: ${sessionSeed}`);
  console.log("─".repeat(60));

  const agents = [
    { name: "VOID-GROK", fn: grokRespond, isGrok: true },
    { name: "VOID-GPT", fn: openaiRespond, isGrok: false },
  ];

  while (turnCount < MAX_TURNS_PER_SESSION) {
    for (const agent of agents) {
      if (turnCount >= MAX_TURNS_PER_SESSION) break;
      turnCount++;
      globalTurnCount++;

      // loop detection — inject redirect if stuck
      if (agent.isGrok && isLooping()) {
        const redirect = LOOP_BREAKS[loopBreakIndex % LOOP_BREAKS.length];
        loopBreakIndex++;
        console.log(`\n⚡ Loop detected — injecting redirect: "${redirect}"`);
        sharedHistory.push({ agent: "VOID", content: redirect });
        memory.history.push({
          agent: "VOID",
          content: redirect,
          globalTurn: globalTurnCount,
          timestamp: new Date().toISOString(),
        });
      }

      try {
        const history = getHistoryForAgent(agent.name);
        let content,
          meta = {};

        if (agent.isGrok) {
          const result = await agent.fn(history);
          content = result.content;
          meta = result.meta;
        } else {
          content = await agent.fn(history);
        }

        // strip self-labeling
        content = content.replace(/\[VOID-[A-Z]+\]:\s*/g, "").trim();

        const entry = {
          agent: agent.name,
          content,
          globalTurn: globalTurnCount,
        };
        sharedHistory.push(entry);
        memory.history.push({
          ...entry,
          timestamp: new Date().toISOString(),
          ...(Object.keys(meta).length ? { meta } : {}),
        });

        logTurn(agent.name, content, meta);
        memory.globalTurnCount = globalTurnCount;
        saveMemory(memory);
        await sleep(DELAY_MS);
      } catch (err) {
        console.error(`\n❌ [${agent.name}] turn ${turnCount}: ${err.message}`);
        console.log("retrying in 15s...");
        await sleep(15000);
        turnCount--;
        globalTurnCount--;
        break;
      }
    }
  }

  memory.totalSessions += 1;
  memory.globalTurnCount = globalTurnCount;
  saveMemory(memory);
  saveLog();

  console.log(
    `\n✅ Session done — ${turnCount} turns this session, ${globalTurnCount} total`,
  );
  console.log(`   next seed: "${getSessionSeed(memory.totalSessions)}"`);
  console.log(`   run 'node orchestrator.js' to continue`);
}

runVoidpunk();
