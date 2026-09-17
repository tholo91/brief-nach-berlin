import { NextResponse } from "next/server";
import { z } from "zod";
import { searchAlternativeRecipients } from "@/lib/lookup/recipientSearch";

const requestSchema = z
  .object({
    level: z.enum(["Bund", "Land"]),
    plz: z.string().regex(/^\d{5}$/),
    party: z.string().trim().max(80).optional(),
    query: z.string().trim().max(120).optional(),
    offset: z.number().int().min(0).max(5000).optional(),
  })
  .strict();

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  return NextResponse.json(searchAlternativeRecipients(parsed.data));
}
