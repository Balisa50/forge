/**
 * Direct browser -> Vercel Blob upload authorizer.
 *
 * The CheckinForm calls @vercel/blob/client `upload()`, which hits this route
 * to mint a short-lived client token, then PUTs the file straight to Blob
 * storage. This bypasses Vercel's ~4.5 MB serverless request-body limit, so
 * students can attach large Excel workbooks / PDFs.
 *
 * Requires the BLOB_READ_WRITE_TOKEN env var, which Vercel auto-injects once a
 * Blob store is created for the project (Dashboard -> Storage -> Create -> Blob).
 */
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { MAX_FILE_BYTES } from "@/lib/submission-types";

export async function POST(request: Request): Promise<NextResponse> {
 const body = (await request.json()) as HandleUploadBody;

 try {
 const jsonResponse = await handleUpload({
 body,
 request,
 onBeforeGenerateToken: async () => {
 // Only signed-in users may upload; the size cap and content types are
 // enforced here so a leaked token can't be abused.
 const session = await auth();
 if (!session?.user?.id) {
 throw new Error("You must be signed in to upload.");
 }
 return {
 addRandomSuffix: true,
 maximumSizeInBytes: MAX_FILE_BYTES,
 allowedContentTypes: [
 "image/*",
 "video/*",
 "audio/*",
 "text/*",
 "application/pdf",
 "application/json",
 "application/xml",
 "application/zip",
 "application/octet-stream",
 "application/x-ipynb+json",
 "application/msword",
 "application/vnd.ms-excel",
 "application/vnd.ms-powerpoint",
 "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
 "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
 "application/vnd.openxmlformats-officedocument.presentationml.presentation",
 "application/vnd.oasis.opendocument.text",
 "application/vnd.oasis.opendocument.spreadsheet",
 "application/vnd.oasis.opendocument.presentation",
 ],
 tokenPayload: JSON.stringify({ userId: session.user.id }),
 };
 },
 // Fires via webhook after upload (no-op locally). We don't depend on it, // the client receives the blob URL directly and submits it with the check-in.
 onUploadCompleted: async () => {},
 });

 return NextResponse.json(jsonResponse);
 } catch (error) {
 return NextResponse.json(
 { error: error instanceof Error ? error.message : "Upload failed" },
 { status: 400 },
 );
 }
}
