// Reconstruct the "what PetPrompt knows" context: project memory + recent conversation.
// Everything is budgeted to keep the refinement call fast and cheap.
import { homedir } from 'node:os';
import { join } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';

const MEM_BUDGET = 1500; // chars of memory to include
const MSG_CHARS = 400; // max chars per conversation message
const CONV_BUDGET = 2500; // total chars of conversation to include

function readTrunc(path, budget) {
  try {
    if (path && existsSync(path)) {
      const t = readFileSync(path, 'utf8').trim();
      return t.length > budget ? t.slice(0, budget) + '\n…(truncated)' : t;
    }
  } catch {
    /* ignore unreadable files */
  }
  return '';
}

// Read the memory the current session would see: project + user CLAUDE.md and the
// auto-memory index, mirroring Claude Code's memory locations.
export function readMemory(cwd) {
  const home = homedir();
  const projDir = (cwd || '').replace(/[\\/]/g, '-'); // Claude Code project-dir convention
  const candidates = [
    join(cwd || '.', 'CLAUDE.md'),
    join(cwd || '.', '.claude', 'CLAUDE.md'),
    join(home, '.claude', 'CLAUDE.md'),
    join(home, '.claude', 'projects', projDir, 'memory', 'MEMORY.md'),
  ];
  const parts = [];
  let used = 0;
  for (const p of candidates) {
    if (used >= MEM_BUDGET) break;
    const t = readTrunc(p, MEM_BUDGET - used);
    if (t) {
      parts.push(t);
      used += t.length;
    }
  }
  return parts.join('\n---\n');
}

function extractText(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .filter((p) => p && (p.type === 'text' || typeof p.text === 'string'))
      .map((p) => p.text || '')
      .join(' ');
  }
  return '';
}

// Parse the session transcript (JSONL) defensively and return the last N user/assistant
// text turns, newest-biased and budgeted. Schema isn't officially documented, so we
// probe several common field shapes and skip anything we can't read.
export function readTranscript(path, maxMessages) {
  if (!path || !existsSync(path)) return '';
  let lines;
  try {
    lines = readFileSync(path, 'utf8').split('\n');
  } catch {
    return '';
  }
  const msgs = [];
  for (const line of lines) {
    const s = line.trim();
    if (!s) continue;
    let obj;
    try {
      obj = JSON.parse(s);
    } catch {
      continue;
    }
    const role =
      obj.role ||
      obj.message?.role ||
      (obj.type === 'assistant' ? 'assistant' : obj.type === 'user' ? 'user' : null);
    if (role !== 'user' && role !== 'assistant') continue;
    const text = extractText(obj.message?.content ?? obj.content ?? obj.text ?? '').trim();
    if (!text) continue;
    msgs.push({ role, text });
  }

  const recent = msgs.slice(-maxMessages);
  const out = [];
  let used = 0;
  for (let i = recent.length - 1; i >= 0; i--) {
    const m = recent[i];
    const t = m.text.length > MSG_CHARS ? m.text.slice(0, MSG_CHARS) + '…' : m.text;
    const entry = `${m.role === 'user' ? 'User' : 'Assistant'}: ${t}`;
    if (used + entry.length > CONV_BUDGET) break;
    out.unshift(entry);
    used += entry.length;
  }
  return out.join('\n');
}
