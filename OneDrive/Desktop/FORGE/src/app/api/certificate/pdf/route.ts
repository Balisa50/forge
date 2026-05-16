import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsPDF } from "jspdf";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "Verification code required" }, { status: 400 });

  const cert = await prisma.certificate.findUnique({
    where: { verifyCode: code },
    include: { user: { select: { name: true } } },
  });

  if (!cert) return NextResponse.json({ error: "Certificate not found" }, { status: 404 });

  // Read stored grade/score from roadmap description if available
  const roadmap = await prisma.roadmap.findUnique({
    where: { id: cert.roadmapId },
    select: { description: true },
  });

  let grade = "P";
  let gradeLabel = "COMPLETED";
  let avgScore = 0;

  try {
    const data = JSON.parse(roadmap?.description ?? "{}");
    if (data.grade) grade = data.grade;
    if (data.gradeLabel) gradeLabel = data.gradeLabel;
    if (data.avgScore) avgScore = data.avgScore;
  } catch { /* use defaults */ }

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  // Background
  doc.setFillColor(6, 6, 8);
  doc.rect(0, 0, w, h, "F");

  // Border
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(1);
  doc.rect(8, 8, w - 16, h - 16, "S");
  doc.setLineWidth(0.3);
  doc.rect(11, 11, w - 22, h - 22, "S");

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(245, 158, 11);
  doc.text("THE FORGE", w / 2, 25, { align: "center" });

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 160);
  doc.text("CERTIFICATE OF VERIFIED MASTERY", w / 2, 32, { align: "center" });

  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.5);
  doc.line(w / 2 - 40, 36, w / 2 + 40, 36);

  // Name
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text(cert.user.name, w / 2, 52, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(150, 150, 160);
  doc.text("has successfully completed", w / 2, 60, { align: "center" });

  doc.setFontSize(18);
  doc.setTextColor(245, 158, 11);
  doc.text(cert.title, w / 2, 70, { align: "center" });

  // Grade badge
  doc.setFontSize(36);
  doc.setTextColor(255, 255, 255);
  doc.text(grade, w / 2, 90, { align: "center" });
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 160);
  doc.text(gradeLabel, w / 2, 96, { align: "center" });

  // Stats row
  const statsY = 110;
  const statsData = [
    { label: "TASKS", value: String(cert.totalTasks) },
    { label: "HOURS", value: String(cert.totalHours) },
    { label: "AVG SCORE", value: avgScore > 0 ? `${avgScore}/10` : "—" },
    { label: "PASS RATE", value: `${Math.round(cert.passRate * 100)}%` },
  ];
  const colW = (w - 60) / statsData.length;
  statsData.forEach((stat, i) => {
    const x = 30 + colW * i + colW / 2;
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(stat.value, x, statsY, { align: "center" });
    doc.setFontSize(6);
    doc.setTextColor(100, 100, 110);
    doc.text(stat.label, x, statsY + 5, { align: "center" });
  });

  // Footer
  const footerY = h - 20;
  doc.setFontSize(6);
  doc.setTextColor(80, 80, 90);
  doc.text(`Issued: ${cert.issuedAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, 20, footerY);
  doc.text(`Verification Code: ${cert.verifyCode}`, w / 2, footerY, { align: "center" });
  doc.text("theforge.app/verify/" + cert.verifyCode, w - 20, footerY, { align: "right" });

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="forge-certificate-${cert.verifyCode}.pdf"`,
    },
  });
}
