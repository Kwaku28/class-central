import { getAttendanceReport } from "@/lib/actions";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const classId = url.searchParams.get("classId");
    const dateFrom = url.searchParams.get("dateFrom");
    const dateTo = url.searchParams.get("dateTo");
    const search = url.searchParams.get("search");

    const res = await getAttendanceReport({
      classId: classId ? Number(classId) : undefined,
      dateFrom: dateFrom ?? undefined,
      dateTo: dateTo ?? undefined,
    });

    const rows = (res.success ? (res.data as any[]) : []).filter((r) => {
      if (!search) return true;
      const s = search.toLowerCase();
      const studentName = `${r.student?.name ?? ""} ${r.student?.surname ?? ""}`.toLowerCase();
      return studentName.includes(s) || (r.note ?? "").toLowerCase().includes(s);
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
        "Content-Disposition": `attachment; filename="attendance.csv"`,
      },
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Failed to export attendance" }, { status: 500 });
  }
}
