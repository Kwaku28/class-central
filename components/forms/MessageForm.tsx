"use client";

import { useEffect, startTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller } from "react-hook-form";
import Select from "react-select";
import { useUser } from "@clerk/nextjs";
import { useActionState } from "react";
import { messageSchema, MessageSchema } from "@/lib/formValidationSchemas";
import { createMessage, updateMessage } from "@/lib/actions";

const MessageForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  relatedData?: {
    teachers?: Array<{ id: string; name: string; surname: string }>;
    students?: Array<{ id: string; name: string; surname: string }>;
    parents?: Array<{ id: string; name: string; surname: string }>;
  };
}) => {
  const { user } = useUser();
  const defaultReceiverType = data
    ? data.receiverTeacherId
      ? "teacher"
      : data.receiverStudentId
      ? "student"
      : "parent"
    : "teacher";

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<MessageSchema>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: data?.content || "",
      receiverType: (data && defaultReceiverType) || "teacher",
      receiverId:
        data?.receiverTeacherId ||
        data?.receiverStudentId ||
        data?.receiverParentId ||
        "",
    },
  });

  const [state, formAction] = useActionState(
    type === "create" ? createMessage : updateMessage,
    { success: false, error: false }
  );

  useEffect(() => {
    if (state.success) setOpen(false);
  }, [state, setOpen]);

  const onSubmit = handleSubmit((formData) => {
    const payload: any = { ...formData };
    if (user) {
      const role = (user?.publicMetadata as any)?.role;
      if (role === "admin") {
        payload.senderType = "admin";
      } else if (role === "teacher") {
        payload.senderType = "teacher";
      }
      payload.senderId = user.id;
    }

    startTransition(() => {
      formAction(payload);
    });
  });

  const teachers = relatedData?.teachers ?? [];
  const students = relatedData?.students ?? [];
  const parents = relatedData?.parents ?? [];

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold text-center">
        {type === "create" ? "Create a new message" : "Edit message"}
      </h1>
      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Message</label>
        <textarea
          className="border rounded p-2"
          {...register("content")}
          placeholder="Type your message here."
          rows={4}
        />
        {errors.content && (
          <p className="text-xs text-red-400">{errors.content.message}</p>
        )}
      </div>

      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="text-xs text-gray-500">Receiver Type</label>
          <Controller
            name="receiverType"
            control={control}
            render={({ field }) => {
              const typeOptions = [
                { value: "teacher", label: "Teacher" },
                { value: "student", label: "Student" },
                { value: "parent", label: "Parent" },
              ];

              return (
                <Select
                  options={typeOptions}
                  value={
                    typeOptions.find((o) => o.value === field.value) || null
                  }
                  onChange={(opt: any) => field.onChange(opt ? opt.value : "")}
                  isClearable={false}
                />
              );
            }}
          />
        </div>

        <div className="flex-1">
          <label className="text-xs text-gray-500">Receiver</label>
          <Controller
            name="receiverId"
            control={control}
            render={({ field }) => {
              return (
                <Controller
                  name="receiverType"
                  control={control}
                  render={({ field: rt }) => {
                    const opts =
                      rt.value === "teacher"
                        ? teachers.map((t) => ({
                            value: t.id,
                            label: `${t.name} ${t.surname}`,
                          }))
                        : rt.value === "student"
                        ? students.map((s) => ({
                            value: s.id,
                            label: `${s.name} ${s.surname}`,
                          }))
                        : parents.map((p) => ({
                            value: p.id,
                            label: `${p.name} ${p.surname}`,
                          }));

                    const selected =
                      opts.find((o) => o.value === field.value) || null;

                    return (
                      <Select
                        options={opts}
                        value={selected}
                        onChange={(opt: any) =>
                          field.onChange(opt ? opt.value : "")
                        }
                        isClearable
                      />
                    );
                  }}
                />
              );
            }}
          />
          {errors.receiverId && (
            <p className="text-xs text-red-400">{errors.receiverId.message}</p>
          )}
        </div>
      </div>

      {state.error && (
        <p className="text-xs text-red-400 text-center">
          {state.message || "Something went wrong. Please try again."}
        </p>
      )}

      <div className="flex justify-center">
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded-md"
        >
          {type === "create" ? "Send Message" : "Update Message"}
        </button>
      </div>
    </form>
  );
};

export default MessageForm;
