import { NextResponse } from "next/server";
import { loadAppState, saveAppState } from "@/lib/db";

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Load all data from SQLite
export async function GET() {
  try {
    const state = loadAppState();
    return NextResponse.json(state, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error("Error loading data:", error);
    return NextResponse.json(
      { error: "Failed to load data", kites: [], currentKiteIndex: 0, currentTheme: "sky" },
      { status: 500 }
    );
  }
}

// POST - Save all data to SQLite
export async function POST(request: Request) {
  try {
    const data = await request.json();
    saveAppState(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving data:", error);
    return NextResponse.json(
      { error: "Failed to save data" },
      { status: 500 }
    );
  }
}
