import { NextResponse } from "next/server";
import { adminListSubjects } from "@/lib/data/admin/subjects";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await adminListSubjects();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
