/**
 * SUPABASE SYNC LAYER — Firestore-style per-table backend:
 *
 * Har collection ki apni table hai (id text pk, data jsonb, updated_at):
 *   students, teachers, classes, timetable, attendance, period_attendance,
 *   marks, fees, fee_data, coordinators, assignments, app_settings,
 *   teacher_attendance, teacher_pay, school_location,
 *   notices, school_events, quizzes, quiz_attempts
 *
 * - sbQueueWrite('students', id, data)  → students table upsert
 * - loadCollectionFromSupabase('fees')  → fees table select
 * - subscribeRecords()                  → SARI tables par ek realtime channel
 *
 * DEMO MODE (VITE_DATA_MODE=demo):
 *   Har function LOCAL passthrough hai — writes no-op, loads khali, realtime
 *   off. App 100% browser localStorage par chalti hai. `.env` se flag hatane
 *   par yeh layer wapas live ho jata hai (naye/updated API endpoint ke liye).
 *
 * Data Neon/Firestore se migrate karne ke liye:
 * scripts/migrate-neon-to-supabase.cjs (records + sari tables dono fill karta hai)
 *
 * Cross-device sync WebSocket realtime (postgres_changes) se hota hai —
 * koi polling/heartbeat/quota nahi.
 */
import { L } from './i18n';
import { supabase, isDemoMode } from '../supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

let supabaseHealthy = true;
let supabaseLastError: string | null = null;
export const isSupabaseHealthy = () => supabaseHealthy;
export const getSupabaseLastError = () => supabaseLastError;

/**
 * APP ki sari collections — har ek ki apni Supabase table hai
 * (schema scripts/supabase-schema.sql ke 19 tables se match):
 */
export const KNOWN_TABLES = [
  'students', 'teachers', 'classes', 'timetable', 'attendance',
  'period_attendance', 'marks', 'fees', 'fee_data', 'coordinators',
  'assignments', 'app_settings', 'teacher_attendance', 'teacher_pay',
  'school_location', 'notices', 'school_events', 'quizzes', 'quiz_attempts',
] as const;

// --- Queued writes (batched upsert on conflict) ---
// Ek hi ORDERED queue — write/delete ka order preserve rehta hai aur same id
// par AAKHRI operation hi chalti hai (latest-wins dedup; pehle wala "first-wins"
// dedup latest edit ko drop kar deta tha — islie data save nahi hota tha).
type PendingOp =
  | { col: string; id: string; op: 'set'; data: any }
  | { col: string; id: string; op: 'del' };
const pendingOps: PendingOp[] = [];
let sbTimer: any = null;
let flushInFlight: Promise<boolean> | null = null;
let retryTimer: any = null;
let retryDelay = 2000;

function scheduleFlush() {
  if (sbTimer) clearTimeout(sbTimer);
  sbTimer = setTimeout(() => { flushSupabase(); }, 900);
}

// Flush fail hone par automatic retry (exponential backoff 2s → 30s max,
// success par reset). Pehle sirf "next write/visibility" par retry hota tha.
function scheduleRetry() {
  if (retryTimer) return;
  retryTimer = setTimeout(() => {
    retryTimer = null;
    flushSupabase().then((ok) => {
      if (!ok) {
        retryDelay = Math.min(retryDelay * 2, 30000);
        scheduleRetry();
      }
    });
  }, retryDelay);
}

export function sbQueueWrite(col: string, id: string, data: any) {
  if (isDemoMode()) return; // demo = local storage only
  pendingOps.push({ col, id, op: 'set', data });
  scheduleFlush();
}

export function sbQueueDelete(col: string, id: string) {
  if (isDemoMode()) return; // demo = local storage only
  pendingOps.push({ col, id, op: 'del' });
  scheduleFlush();
}

/** Same id ki multiple ops ho to AAKHRI wali jeet-ti hai (Map insertion-order me). */
function dedupeOps(ops: PendingOp[]): PendingOp[] {
  const byKey = new Map<string, PendingOp>();
  for (const op of ops) byKey.set(`${op.col} ${op.id}`, op);
  return Array.from(byKey.values());
}

/**
 * AUTH RULE — password cloud par NAHI jaata.
 * ID+Password authentication ab Supabase Auth (auth.users + profiles) se hota
 * hai; app record mein password sirf device-local rehta hai (offline fallback).
 * Isliye in tables ke payload se `password` strip kar diya jaata hai (purane
 * rows se bhi pehli write par hat jata hai).
 */
const PASSWORD_TABLES = ['teachers', 'students', 'coordinators'];

function stripPassword(table: string, data: any): any {
  if (!PASSWORD_TABLES.includes(table) || !data || typeof data !== 'object') return data;
  if (!('password' in data)) return data;
  const { password: _password, ...rest } = data as Record<string, any>;
  return rest;
}

/** Ek flush pass: queue splice karke upserts → deletes bhejta hai. */
async function doFlush(): Promise<boolean> {
  const ops = pendingOps.splice(0);
  const unique = dedupeOps(ops);
  try {
    // Per-table groups (har collection ki apni table, onConflict: id)
    const byTable: Record<string, { id: string; data: any }[]> = {};
    const delsByTable: Record<string, string[]> = {};
    for (const op of unique) {
      if (op.op === 'set') {
        if (!byTable[op.col]) byTable[op.col] = [];
        const payload = op.data === undefined ? null : stripPassword(op.col, op.data);
        byTable[op.col].push({ id: String(op.id), data: payload });
      } else {
        if (!delsByTable[op.col]) delsByTable[op.col] = [];
        delsByTable[op.col].push(String(op.id));
      }
    }
    for (const [table, rows] of Object.entries(byTable)) {
      if (rows.length === 0) continue;
      for (let i = 0; i < rows.length; i += 100) {
        const chunk = rows.slice(i, i + 100);
        const { error } = await supabase
          .from(table)
          .upsert(chunk, { onConflict: 'id' });
        if (error) throw error;
      }
    }
    for (const [table, ids] of Object.entries(delsByTable)) {
      if (ids.length === 0) continue;
      const { error } = await supabase
        .from(table)
        .delete()
        .in('id', ids);
      if (error) throw error;
    }
    supabaseHealthy = true;
    supabaseLastError = null;
    retryDelay = 2000;
    return true;
  } catch (e: any) {
    supabaseHealthy = false;
    supabaseLastError = e?.message || 'Supabase write failed';
    console.warn('[Supabase] flush failed (data re-queued):', supabaseLastError);
    // Naye writes ke AAGE purana order wapas lagao — sequence barqarar rahe.
    pendingOps.unshift(...ops);
    scheduleRetry();
    return false;
  }
}

/**
 * Pending queue ko foran flush karta hai. Success = true.
 * Fail par data re-queue + auto-retry hota hai; actual error
 * getSupabaseLastError() se mil sakta hai (App banner ke liye).
 *
 * NOTE (race fix): pehle wala code flush chalne par fake `return true` deta
 * tha aur timer bhi reschedule nahi hota — naye queued writes bina bheje
 * "strand" reh jaati the. Ab sab callers in-flight flush ka ASLI result
 * wait karte hain aur baaki bacha hua ek aur pass me jaata hai.
 */
export async function flushSupabase(): Promise<boolean> {
  if (isDemoMode()) return true; // demo = no-op, hamesha "success"
  for (let guard = 0; guard < 10; guard++) {
    if (flushInFlight) {
      const ok = await flushInFlight;
      if (!ok) return false; // fail → re-queued + retry scheduled
      if (pendingOps.length === 0) return true;
      continue; // flush ke dauran naye ops queue hue → ek aur pass
    }
    if (pendingOps.length === 0) return true;
    const p = doFlush().finally(() => { flushInFlight = null; });
    flushInFlight = p;
    const ok = await p;
    if (!ok) return false;
    if (pendingOps.length === 0) return true;
  }
  return pendingOps.length === 0; // guard: lagatar writers ke beech spin na ho
}

// Flush pending writes before tab close/hide.
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => { flushSupabase(); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushSupabase();
  });
}

/** Sari known tables load karke collection ke hisaab se group karta hai (App ka init path). */
export async function loadAllFromSupabase(): Promise<Record<string, any[]>> {
  if (isDemoMode()) return {}; // demo = local storage se data aata hai
  try {
    const out: Record<string, any[]> = {};
    await Promise.all(KNOWN_TABLES.map(async (table) => {
      const { data, error } = await supabase.from(table).select('id,data');
      if (error) {
        if ((error as any)?.code === 'PGRST205') {
          console.warn(`[Supabase] table "${table}" is missing — run scripts/supabase-schema.sql in the SQL Editor.`);
        } else {
          console.warn(`[Supabase] load "${table}" failed:`, (error as any).message);
        }
        out[table] = [];
        return;
      }
      out[table] = (data || []).map((r: any) => {
        let rowData = r.data;
        if (typeof rowData === 'string') { try { rowData = JSON.parse(rowData); } catch { rowData = {}; } }
        rowData = rowData || {};
        return { ...rowData, id: rowData.id !== undefined ? rowData.id : r.id };
      });
    }));
    supabaseHealthy = true;
    return out;
  } catch (e: any) {
    supabaseHealthy = false;
    supabaseLastError = e?.message || 'Supabase load failed';
    console.warn('[Supabase] loadAllFromSupabase failed:', supabaseLastError);
    return {};
  }
}

/** Kisi ek collection (= apni table) ka data load karo (null agar fail). */
export async function loadCollectionFromSupabase(col: string): Promise<any[] | null> {
  if (isDemoMode()) return []; // demo = local storage se data
  try {
    const { data, error } = await supabase
      .from(col)
      .select('id,data');
    if (error) throw error;
    return (data || []).map((r: any) => {
      let rowData = r.data;
      if (typeof rowData === 'string') { try { rowData = JSON.parse(rowData); } catch { rowData = {}; } }
      rowData = rowData || {};
      return { ...rowData, id: rowData.id !== undefined ? rowData.id : r.id } as any;
    });
  } catch (e: any) {
    supabaseHealthy = false;
    supabaseLastError = e?.message || 'Supabase load failed';
    console.warn('[Supabase] loadCollectionFromSupabase failed:', supabaseLastError);
    return null;
  }
}

/**
 * ONE realtime channel — SARI tables par koi bhi INSERT/UPDATE/DELETE
 * sab connected devices ko push hota hai (WebSocket). Firebase ki 20s polling
 * / heartbeat ka koi sahara nahi chahiye.
 */
let channelSeq = 0;
export function subscribeRecords(onEvent: (payload: any) => void): () => void {
  if (isDemoMode()) return () => {}; // demo = realtime off
  // Har call ka APNA channel — same naam par supabase-js channel reuse karta hai
  // aur pehli subscribe ke baad naye .on() callbacks par throw karta hai.
  const channel: RealtimeChannel = supabase.channel(`demo-school-${++channelSeq}`);
  for (const table of KNOWN_TABLES) {
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table } as any,
      (payload: any) => {
        try { onEvent({ ...payload, table }); } catch (e) { console.warn('[Supabase] realtime handler error:', e); }
      }
    );
  }
  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') console.log('[Sync:RT] Supabase realtime channel subscribed (all tables)');
    else if (status === 'CHANNEL_ERROR') console.warn('[Sync:RT] Supabase realtime channel error');
  });
  return () => { supabase.removeChannel(channel).catch(() => {}); };
}