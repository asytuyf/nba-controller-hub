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
    return NextResponse.json({ error: "No API key configured. Add BALLDONTLIE_API_KEY to .env.local and restart server." }, { status: 500 });
  }

  console.log("API Key present:", API_KEY.substring(0, 8) + "...");

  try {
    // Get recent games - include today and tomorrow (timezone buffer)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 1); // Include tomorrow for timezone issues
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    const url = `${API_BASE}/games?team_ids[]=${teamId}&start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}&per_page=50`;

    console.log("Fetching games:", url);

    const response = await fetch(url, {
      headers: {
        "Authorization": API_KEY,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Balldontlie error:", response.status, errorText);
      return NextResponse.json(
        { error: "Balldontlie API error", status: response.status, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Sort by date descending (most recent first)
    if (data.data) {
      data.data.sort((a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 });
  }
}
