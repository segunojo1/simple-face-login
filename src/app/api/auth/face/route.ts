import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { bestMatchIndex } from "@/lib/face";

const THRESHOLD = 0.6; // Adjust based on empirical tests

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { descriptor } = body as { descriptor: number[] };

    if (!Array.isArray(descriptor) || descriptor.length === 0) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const rows = await sql`
      SELECT u.id as user_id, u.name, u.email, f.descriptor
      FROM users u
      JOIN face_embeddings f ON f.user_id = u.id
    ` as { user_id: string; name: string; email: string; descriptor: number[] }[];

    const descriptors = rows.map((r) => r.descriptor);
    const match = bestMatchIndex(descriptor, descriptors);

    if (!match || match.distance > THRESHOLD) {
      return NextResponse.json({ ok: false, reason: "no_match", distance: match?.distance ?? null }, { status: 401 });
    }

    const matched = rows[match.index];

    // For demo, return the user. In real apps, create a session/JWT.
    return NextResponse.json({ ok: true, user: { id: matched.user_id, name: matched.name, email: matched.email }, distance: match.distance });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
