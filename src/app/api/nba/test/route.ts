import { NextResponse } from "next/server";

export async function GET() {
  const API_KEY = process.env.BALLDONTLIE_API_KEY;

  if (!API_KEY) {
    return NextResponse.json({
      status: "error",
      message: "No API key found. Add BALLDONTLIE_API_KEY to .env.local and restart the server.",
      keyFound: false,
    });
  }

  // Test the API key with a simple request
  try {
    const response = await fetch("https://api.balldontlie.io/v1/teams", {
      headers: {
        Authorization: API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        status: "error",
        message: `API key invalid or expired. Status: ${response.status}`,
        keyFound: true,
        keyPreview: API_KEY.substring(0, 8) + "...",
        apiError: errorText,
      });
    }

    const data = await response.json();
    return NextResponse.json({
      status: "success",
      message: "API key is working!",
      keyFound: true,
      keyPreview: API_KEY.substring(0, 8) + "...",
      teamsCount: data.data?.length || 0,
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: `Network error: ${error}`,
      keyFound: true,
      keyPreview: API_KEY.substring(0, 8) + "...",
    });
  }
}
