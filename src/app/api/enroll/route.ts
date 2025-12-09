import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, descriptor } = body as { name: string; email: string; descriptor: number[] };

    if (!name || !email || !Array.isArray(descriptor) || descriptor.length === 0) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const userRows = await sql`
      INSERT INTO users (name, email)
      VALUES (${name}, ${email})
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    ` as { id: string }[];

    const userId = userRows[0].id;

    // Upsert single embedding per user for simplicity
    await sql`
      INSERT INTO face_embeddings (user_id, descriptor)
      VALUES (${userId}, ${descriptor}::float8[])
      ON CONFLICT (user_id) DO UPDATE SET descriptor = EXCLUDED.descriptor
    `;

    return NextResponse.json({ ok: true, userId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
