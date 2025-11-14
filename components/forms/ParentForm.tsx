"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parentSchema, ParentSchema } from "@/lib/formValidationSchemas";
import { createParent, updateParent } from "@/lib/actions";
import { startTransition, useActionState } from "react";
import { useEffect } from "react";
import InputField from "./InputField";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/stateful-button";

const animatedComponents = makeAnimated();

const ParentForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  relatedData?: {
    students: Array<{ id: string; name: string; surname: string }>;
  };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ParentSchema>({
    resolver: zodResolver(parentSchema),
    defaultValues: {
      ...data,
      students: data?.students || [],
    },
  });

  const [state, formAction] = useActionState(
    type === "create" ? createParent : updateParent,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((formData) => {
    startTransition(() => {
      formAction(formData);
    });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Parent has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new parent" : "Update the parent"}
      </h1>
      <span className="text-xs text-gray-400 font-medium">
        Authentication Information
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Username"
          name="username"
          defaultValue={data?.username}
          register={register}
          error={errors?.username}
        />
        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register}
          error={errors?.email}
        />
        <InputField
          label="Password"
          name="password"
          type="password"
          defaultValue={data?.password}
          register={register}
          error={errors?.password}
        />
      </div>
      <span className="text-xs text-gray-400 font-medium">
        Personal Information
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="First Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors.name}
        />
        <InputField
          label="Last Name"
          name="surname"
          defaultValue={data?.surname}
          register={register}
          error={errors.surname}
        />
        <InputField
          label="Phone"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors.phone}
        />
        <InputField
          label="Address"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors.address}
        />
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Students</label>
          <Controller
            name="students"
            control={control}
            render={({ field }) => (
              <Select
                isMulti
                components={animatedComponents}
                options={
                  relatedData?.students?.map((student) => ({
                    value: student.id,
                    label: `${student.name} ${student.surname}`,
                  })) || []
                }
                value={
                  field.value
                    ? field.value
                        .map((id: string) => {
                          const s = relatedData?.students?.find(
                            (stu) => stu.id === id
                          );
                          return s
                            ? { value: s.id, label: `${s.name} ${s.surname}` }
                            : null;
                        })
                        .filter(Boolean)
                    : []
                }
                onChange={(selected) =>
                  field.onChange(
                    selected ? selected.map((opt: any) => opt.value) : []
                  )
                }
                isClearable
                menuPlacement="auto"
              />
            )}
          />
          {errors.students?.message && (
            <p className="text-xs text-red-400">
              {errors.students.message.toString()}
            </p>
          )}
        </div>
      </div>
      {state.error && (
        <p className="text-xs text-red-400 text-center">
          Something went wrong. Please try again.
        </p>
      )}
      <Button
        type="submit"
        className="bg-classYellow py-2 px-4 rounded-md border-none w-max self-center cursor-pointer"
      >
        {type === "create" ? "Create Parent" : "Update Parent"}
      </Button>
    </form>
  );
};

export default ParentForm;
