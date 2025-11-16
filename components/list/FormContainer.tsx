import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import { auth } from "@clerk/nextjs/server";

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement"
    | "message";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
};

const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let relatedData: any = {};

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  if (type !== "delete") {
    switch (table) {
      case "subject": {
        const subjectTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: subjectTeachers };
        break;
      }
      case "class": {
        const classGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const classTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: classTeachers, grades: classGrades };
        break;
      }
      case "teacher": {
        const teacherSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        relatedData = { subjects: teacherSubjects };
        break;
      }
      case "student": {
        const studentGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const studentClasses = await prisma.class.findMany({
          select: {
            id: true,
            name: true,
            capacity: true,
            gradeId: true,
            _count: { select: { students: true } },
          },
          orderBy: { name: "asc" },
        });
        const studentParents = await prisma.parent.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = {
          classes: studentClasses,
          grades: studentGrades,
          parents: studentParents,
        };
        break;
      }
      case "parent": {
        const parentStudents = await prisma.student.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { students: parentStudents };
        break;
      }
      case "exam": {
        const examLessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
          },
          select: { id: true, subjectId: true, classId: true },
        });
        relatedData = { lessons: examLessons };
        break;
      }
      case "lesson": {
        const [lessonSubjects, lessonClasses, lessonTeachers] =
          await Promise.all([
            prisma.subject.findMany({ select: { id: true, name: true } }),
            prisma.class.findMany({ select: { id: true, name: true } }),
            prisma.teacher.findMany({
              select: { id: true, name: true, surname: true },
            }),
          ]);
        relatedData = {
          subjects: lessonSubjects,
          classes: lessonClasses,
          teachers: lessonTeachers,
        };
        break;
      }
      case "attendance": {
        const [classes, students] = await Promise.all([
          prisma.class.findMany({
            select: { id: true, name: true },
            orderBy: { name: "asc" },
          }),
          prisma.student.findMany({
            select: { id: true, name: true, surname: true, classId: true },
          }),
        ]);
        relatedData = { classes, students };
        break;
      }
      case "message": {
        const [teachers, students, parents] = await Promise.all([
          prisma.teacher.findMany({
            select: { id: true, name: true, surname: true },
            orderBy: { name: "asc" },
          }),
          prisma.student.findMany({
            select: { id: true, name: true, surname: true },
            orderBy: { name: "asc" },
          }),
          prisma.parent.findMany({
            select: { id: true, name: true, surname: true },
            orderBy: { name: "asc" },
          }),
        ]);
        relatedData = { teachers, students, parents };
        break;
      }

      default:
        break;
    }
  }

  return (
    <div className="">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;
