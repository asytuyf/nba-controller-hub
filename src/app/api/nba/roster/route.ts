import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://api.balldontlie.io/v1";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const teamId = searchParams.get("teamId");

  const API_KEY = process.env.BALLDONTLIE_API_KEY;

  if (!teamId) {
    return NextResponse.json({ error: "Missing teamId" }, { status: 400 });
  }

  if (!API_KEY) {
    console.error("BALLDONTLIE_API_KEY not found in environment");
    return NextResponse.json(
      { error: "No API key configured. Add BALLDONTLIE_API_KEY to .env.local and restart server." },
      { status: 500 }
    );
  }

  console.log("Roster API - Key present:", API_KEY.substring(0, 8) + "...");

  try {
    // Use /players endpoint with team_ids filter
    const url = `${API_BASE}/players?team_ids[]=${teamId}&per_page=25`;
    console.log("Fetching roster from:", url);

    const response = await fetch(url, {
      headers: {
        Authorization: API_KEY,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Balldontlie roster error:", response.status, errorText);
      return NextResponse.json(
        { error: `API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Roster response - players count:", data.data?.length || 0);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching roster:", error);
    return NextResponse.json({ error: "Failed to fetch roster" }, { status: 500 });
  }
}
