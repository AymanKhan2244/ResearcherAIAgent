import { type NextRequest } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000/chat";


// Render free tier can take 30-60s to cold-start, so allow up to 120s
const TIMEOUT_MS = 120_000;

export async function POST(request: NextRequest) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const body = await request.json();

    const backendResponse = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      return Response.json(
        { error: `Backend returned ${backendResponse.status}: ${errorText}` },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return Response.json(data);
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error instanceof DOMException && error.name === "AbortError") {
      console.error("Backend request timed out after", TIMEOUT_MS / 1000, "seconds");
      return Response.json(
        { response: "The server is waking up (Render free tier cold start). Please try again in a few seconds." },
        { status: 504 }
      );
    }

    console.error("Backend proxy error:", error);
    return Response.json(
      { error: "Failed to connect to the backend server. It may be starting up — please retry shortly." },
      { status: 502 }
    );
  }
}
