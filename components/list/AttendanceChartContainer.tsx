import Image from "next/image";
import AttendanceChart from "../dashboard/AttendanceChart";
import { getAttendanceReport } from "@/lib/actions";

const AttendanceChartContainer = async () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const lastMonday = new Date(today);
  lastMonday.setDate(today.getDate() - daysSinceMonday);

  const res = await getAttendanceReport({
    dateFrom: lastMonday.toISOString(),
    dateTo: today.toISOString(),
  });

  const rows: Array<any> = res?.success ? res.data ?? [] : [];

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  const attendanceMap: { [key: string]: { present: number; absent: number } } = {
    Mon: { present: 0, absent: 0 },
    Tue: { present: 0, absent: 0 },
    Wed: { present: 0, absent: 0 },
    Thu: { present: 0, absent: 0 },
    Fri: { present: 0, absent: 0 },
  };

  rows.forEach((item) => {
    const itemDate = new Date(item.date);
    const dow = itemDate.getDay();

    // only count Mon-Fri
    if (dow >= 1 && dow <= 5) {
      const dayName = daysOfWeek[dow - 1];

      let isPresent = false;
      if (item?.status !== undefined && item?.status !== null) {
        isPresent = String(item.status).toUpperCase() === "PRESENT";
      } else if ("present" in item) {
        isPresent = Boolean(item.present);
      }

      if (isPresent) attendanceMap[dayName].present += 1;
      else attendanceMap[dayName].absent += 1;
    }
  });

  const data = daysOfWeek.map((day) => ({
    name: day,
    present: attendanceMap[day].present,
    absent: attendanceMap[day].absent,
  }));

  return (
    <div className="bg-white rounded-lg p-4 h-full">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Attendance</h1>
        <Image src="/icons/moreDark.png" alt="" width={20} height={20} />
      </div>
      <AttendanceChart data={data} />
    </div>
  );
};

export default AttendanceChartContainer;
