"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import InputField from "./InputField";
import { classSchema, ClassSchema } from "@/lib/formValidationSchemas";
import { createClass, updateClass } from "@/lib/actions";
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
} from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Select from "react-select";
import makeAnimated from "react-select/animated";

const animatedComponents = makeAnimated();

const ClassForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ClassSchema>({
    resolver: zodResolver(classSchema),
  });

  const [state, formAction] = useActionState(
    type === "create" ? createClass : updateClass,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    startTransition(() => {
      formAction(data);
    });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Subject has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { teachers, grades } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new class" : "Update the class"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Class name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />
        <InputField
          label="Capacity"
          name="capacity"
          defaultValue={data?.capacity}
          register={register}
          error={errors?.capacity}
        />
        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Supervisor</label>
          <Controller
            name="supervisorId"
            control={control}
            defaultValue={data?.teachers || ""}
            render={({ field }) => (
              <Select
                components={animatedComponents}
                options={teachers.map(
                  (teacher: { id: string; name: string; surname: string }) => ({
                    value: teacher.id,
                    label: `${teacher.name} ${teacher.surname}`,
                  })
                )}
                value={
                  field.value
                    ? {
                        value: field.value,
                        label:
                          teachers.find(
                            (t: {
                              id: string;
                              name: string;
                              surname: string;
                            }) => t.id === field.value
                          )?.name +
                          " " +
                          teachers.find(
                            (t: {
                              id: string;
                              name: string;
                              surname: string;
                            }) => t.id === field.value
                          )?.surname,
                      }
                    : null
                }
                onChange={(option) => {
                  if (option && !Array.isArray(option) && "value" in option) {
                    field.onChange(option.value);
                  } else {
                    field.onChange("");
                  }
                }}
                menuPlacement="auto"
              />
            )}
          />
          {errors.supervisorId?.message && (
            <p className="text-xs text-red-400">
              {errors.supervisorId.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Grade</label>
          <Controller
            name="gradeId"
            control={control}
            defaultValue={data?.gradeId || ""}
            render={({ field }) => (
              <Select
                options={grades.map((grade: { id: number; level: number }) => ({
                  value: grade.id,
                  label: grade.level.toString(),
                }))}
                value={
                  field.value
                    ? {
                        value: field.value,
                        label: grades
                          .find(
                            (g: { id: number; level: number }) =>
                              g.id === field.value
                          )
                          ?.level.toString(),
                      }
                    : null
                }
                onChange={(option) => field.onChange(option?.value)}
                menuPlacement="auto"
              />
            )}
          />
          {errors.gradeId?.message && (
            <p className="text-xs text-red-400">
              {errors.gradeId.message.toString()}
            </p>
          )}
        </div>
      </div>
      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      <button
        type="submit"
        className="bg-blue-400 text-white py-2 px-4 rounded-md border-none w-max self-center cursor-pointer"
      >
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default ClassForm;
