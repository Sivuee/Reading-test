import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// Storage helpers
// In production, swap saveSession() / getSessions() for your real DB calls
// (e.g. Postgres via Prisma, Supabase, MongoDB, etc.)
// ---------------------------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "sessions.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf8");
}

function saveSession(session: unknown) {
  ensureDataDir();
  const existing = JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) as unknown[];
  existing.push({ ...( session as object), savedAt: Date.now() });
  fs.writeFileSync(DATA_FILE, JSON.stringify(existing, null, 2), "utf8");
}

function getSessions() {
  ensureDataDir();
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

// ---------------------------------------------------------------------------
// POST /api/sessions  — save a completed reading session
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body?.sessionId || !body?.participantId) {
      return NextResponse.json(
        { error: "Missing required fields: sessionId, participantId" },
        { status: 400 }
      );
    }

    saveSession(body);

    return NextResponse.json({ ok: true, sessionId: body.sessionId }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/sessions]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// GET /api/sessions  — retrieve all saved sessions (researcher endpoint)
// ---------------------------------------------------------------------------
export async function GET() {
  try {
    const sessions = getSessions();
    return NextResponse.json({ sessions, count: sessions.length });
  } catch (err) {
    console.error("[GET /api/sessions]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
