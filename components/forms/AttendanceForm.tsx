"use client";

import { useEffect, useState, startTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  attendanceSchema,
  AttendanceSchema,
} from "@/lib/formValidationSchemas";
import { useActionState } from "react";
import { createAttendance } from "@/lib/actions";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/stateful-button";

const STATUS_OPTIONS = [
  { value: "PRESENT", label: "Present" },
  { value: "ABSENT", label: "Absent" },
  { value: "LATE", label: "Late" },
  { value: "EXCUSED", label: "Excused" },
];

const AttendanceForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  relatedData?: {
    classes?: Array<{ id: number; name: string }>;
    students?: Array<{
      id: string;
      name: string;
      surname: string;
      classId?: number;
    }>;
    lessons?: Array<{ id: number; name: string }>;
  };
}) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AttendanceSchema>({
    resolver: zodResolver(attendanceSchema as any),
    defaultValues: {
      classId: data?.classId ?? undefined,
      lessonId: data?.lessonId ?? undefined,
      date: data?.date
        ? new Date(data.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      records: data?.records ?? [],
    } as any,
  });

  const [state, formAction] = useActionState(createAttendance, {
    success: false,
    error: false,
  });

  useEffect(() => {
    if (state.success) {
      toast("Attendance saved");
      setOpen(false);
      router.refresh();
    }
  }, [state.success, setOpen, router]);

  const classes = relatedData?.classes ?? [];
  const students = relatedData?.students ?? [];

  const selectedClassId = watch("classId");

  const [filteredStudents, setFilteredStudents] = useState<typeof students>([]);

  useEffect(() => {
    if (selectedClassId) {
      const fs = students.filter(
        (s) => String(s.classId) === String(selectedClassId)
      );
      setFilteredStudents(fs);

      const currentRecords = watch("records");
      if (!currentRecords || currentRecords.length === 0 || data == null) {
        const init = fs.map((s) => ({
          studentId: s.id,
          status: "ABSENT" as const,
        }));
        setValue("records", init);
      }
    } else {
      setFilteredStudents([]);
      setValue("records", []);
    }
  }, [selectedClassId, students]);

  const onSubmit = handleSubmit((formData) => {
    const payload: any = {
      ...formData,
      date: new Date(formData.date).toISOString(),
    };
    startTransition(() => {
      formAction(payload);
    });
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold text-center">
        {type === "create" ? "Record Attendance" : "Edit Attendance"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-xs text-gray-500">Class</label>
          <Controller
            name="classId"
            control={control}
            render={({ field }) => (
              <Select
                options={classes.map((c) => ({ value: c.id, label: c.name }))}
                value={
                  field.value
                    ? {
                        value: field.value,
                        label: classes.find((c) => c.id === field.value)?.name,
                      }
                    : null
                }
                onChange={(opt: any) =>
                  field.onChange(opt ? Number(opt.value) : undefined)
                }
                isClearable
              />
            )}
          />
          {errors.classId && (
            <p className="text-xs text-red-400">{errors.classId.message}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-500">Date</label>
          <input
            type="date"
            {...register("date")}
            className="border rounded p-2"
          />
          {errors.date && (
            <p className="text-xs text-red-400">
              {(errors.date as any).message}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-500">Lesson (optional)</label>
          <Controller
            name="lessonId"
            control={control}
            render={({ field }) => (
              <Select
                options={(relatedData?.lessons ?? []).map((l) => ({
                  value: l.id,
                  label: l.name,
                }))}
                value={
                  field.value
                    ? {
                        value: field.value,
                        label: (relatedData?.lessons ?? []).find(
                          (l) => l.id === field.value
                        )?.name,
                      }
                    : null
                }
                onChange={(opt: any) =>
                  field.onChange(opt ? Number(opt.value) : undefined)
                }
                isClearable
              />
            )}
          />
        </div>
      </div>

      <div className="mt-2">
        <h2 className="text-sm font-medium">Students</h2>
        <div className="max-h-72 overflow-auto mt-2 space-y-2">
          {filteredStudents.length === 0 && (
            <div className="text-sm text-gray-500">
              Select a class to load students
            </div>
          )}
          {filteredStudents.map((s, idx) => (
            <div
              key={s.id}
              className="flex items-center gap-4 p-2 border rounded"
            >
              <div className="w-48">
                {s.name} {s.surname}
              </div>

              <Controller
                name={`records.${idx}.status` as any}
                control={control}
                render={({ field }) => (
                  <select {...field} className="border p-1">
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                )}
              />

              <Controller
                name={`records.${idx}.note` as any}
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    placeholder="Note (optional)"
                    className="border p-1 flex-1"
                  />
                )}
              />

              <input
                type="hidden"
                {...register(`records.${idx}.studentId` as any)}
                value={s.id}
              />
            </div>
          ))}
        </div>
      </div>

      {state.error && (
        <p className="text-xs text-red-400 text-center">
          {state.message || "Something went wrong"}
        </p>
      )}

      <div className="flex justify-center">
        <Button
          type="submit"
          className="bg-classYellow px-4 py-2 rounded cursor-pointer"
        >
          {type === "create" ? "Save Attendance" : "Update Attendance"}
        </Button>
      </div>
    </form>
  );
};

export default AttendanceForm;
