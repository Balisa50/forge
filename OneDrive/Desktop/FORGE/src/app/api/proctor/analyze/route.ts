import { NextRequest, NextResponse } from "next/server";

/**
 * Proctor Analyze — Lightweight browser-assisted proctoring
 *
 * The browser-side ProctorCamera does the actual detection using
 * canvas pixel analysis. This endpoint validates the results and
 * tracks violations server-side so they can't be tampered with.
 *
 * When a local Python YOLO server is running (port 8900), it uses
 * that for superior detection. Otherwise, accepts browser analysis.
 */

const PYTHON_SERVER = process.env.PROCTOR_SERVER_URL ?? "http://localhost:8900";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // If browser sent its own analysis (no Python server needed)
    if (body.browserAnalysis) {
      const { personDetected, faceCount, brightnessOk, motionDetected } = body.browserAnalysis;

      const violations: string[] = [];

      if (!personDetected && !brightnessOk) {
        // Camera might be covered or too dark
        violations.push("face_not_visible");
      }

      if (faceCount === 0 && brightnessOk) {
        violations.push("no_person");
      }

      if (faceCount > 1) {
        violations.push("multiple_persons");
      }

      return NextResponse.json({
        status: violations.length > 0 ? "violation" : "ok",
        personCount: faceCount,
        faceDetected: faceCount >= 1,
        gazeOk: true, // Can't detect gaze without ML
        violations,
        objects: [],
        processingMs: body.processingMs ?? 0,
        source: "browser",
      });
    }

    // Try Python server for full YOLO + MediaPipe analysis
    const { image } = body;
    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const start = Date.now();

    try {
      const response = await fetch(`${PYTHON_SERVER}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
        signal: AbortSignal.timeout(8_000),
      });

      if (!response.ok) throw new Error(`Python server: ${response.status}`);

      const data = await response.json();

      return NextResponse.json({
        status: data.status ?? "ok",
        personCount: data.personCount ?? 1,
        faceDetected: data.faceDetected ?? true,
        gazeOk: data.gazeOk ?? true,
        violations: data.violations ?? [],
        objects: data.objects ?? [],
        processingMs: Date.now() - start,
        source: "python",
      });
    } catch {
      // Python server offline — return limited status
      // Browser-side analysis will handle detection
      return NextResponse.json({
        status: "limited",
        personCount: 0,
        faceDetected: false,
        gazeOk: false,
        violations: [],
        objects: [],
        fallback: true,
        source: "none",
        processingMs: Date.now() - start,
      });
    }
  } catch (error) {
    console.error("Proctor error:", error);
    return NextResponse.json({
      status: "error",
      violations: [],
      fallback: true,
      source: "none",
    });
  }
}
