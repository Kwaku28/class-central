import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const classId = url.searchParams.get("classId");
    const dateFrom = url.searchParams.get("dateFrom");
    const dateTo = url.searchParams.get("dateTo");
    const search = url.searchParams.get("search");

    const where: any = {};
    if (classId) where.classId = Number(classId);
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }
    if (search) {
      where.OR = [
        { student: { name: { contains: search, mode: "insensitive" } } },
        { student: { surname: { contains: search, mode: "insensitive" } } },
        { note: { contains: search, mode: "insensitive" } },
      ];
    }

    const rows = await prisma.attendance.findMany({
      where,
      include: { student: { select: { id: true, name: true, surname: true } }, class: { select: { id: true, name: true } } },
      orderBy: { date: "desc" },
    });

    const header = ["date", "student_id", "student_name", "class_id", "class_name", "status", "note"];
    const csv = [
      header.join(","),
      ...rows.map((r) =>
        [
          new Date(r.date).toISOString().split("T")[0],
          `"${r.student?.id ?? ""}"`,
          `"${(r.student ? `${r.student.name} ${r.student.surname}` : "").replace(/"/g, '""')}"`,
          r.class?.id ?? "",
          `"${(r.class?.name ?? "").replace(/"/g, '""')}"`,
          r.status,
          `"${(r.note ?? "").replace(/"/g, '""')}"`,
        ].join(",")
      ),
    ].join("\n");

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="attendance_export_${new Date().toISOString().slice(0,10)}.csv"`,
      },
    });
  } catch (err) {
    console.error("Export attendance failed:", err);
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}
