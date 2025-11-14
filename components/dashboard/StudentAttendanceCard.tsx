import { getAttendanceReport } from "@/lib/actions";

const StudentAttendanceCard = async ({ id }: { id: string }) => {
  const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString();
  const res = await getAttendanceReport({ dateFrom: startOfYear });

  const rows: Array<any> = res?.success ? res.data ?? [] : [];

  const studentRows = rows.filter((r) => String(r.studentId ?? r.student?.id ?? "") === String(id));

  const totalDays = studentRows.length;
  const presentDays = studentRows.filter((day) => {
    if (day?.status !== undefined && day?.status !== null) {
      return String(day.status).toUpperCase() === "PRESENT";
    }
    if ("present" in day) return Boolean(day.present);
    return false;
  }).length;

  const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : null;

  return (
    <div className="">
      <h1 className="text-xl font-semibold">{percentage !== null ? `${percentage}%` : "-"}</h1>
      <span className="text-sm text-gray-400">Attendance</span>
    </div>
  );
};

export default StudentAttendanceCard;
