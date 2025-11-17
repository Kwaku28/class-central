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
import { Button } from "@/components/ui/stateful-button";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

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
  const role = (user?.publicMetadata as any)?.role;
  const isAdmin = role === "admin";

  const defaultReceiverType = data
    ? data.recipientType?.startsWith("all_")
      ? (data.recipientType.replace("all_", "").replace(/s$/, "") as
          | "teacher"
          | "student"
          | "parent")
      : data.receiverTeacherId
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
    watch,
  } = useForm<MessageSchema>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: data?.content || "",
      receiverType: (data && defaultReceiverType) || "teacher",
      receiverId:
        data?.receiverTeacherId?.toString() ||
        data?.receiverStudentId?.toString() ||
        data?.receiverParentId?.toString() ||
        "",
      sendToAll: Boolean(
        data?.recipientType && String(data.recipientType).startsWith("all_")
      ),
    },
  });

  const sendToAll = watch("sendToAll");

  const [state, formAction] = useActionState(
    type === "create" ? createMessage : updateMessage,
    { success: false, error: false }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Message has been ${type === "create" ? "sent" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const onSubmit = handleSubmit((formData) => {
    const payload: any = { ...formData };

    if (payload.receiverId) {
      payload.receiverId = Number(payload.receiverId);
    }

    if (type === "update" && data?.id) {
      payload.id = data.id;
    }

    if (user) {
      payload.senderId = user.id;
      payload.senderType = isAdmin
        ? "admin"
        : role === "teacher"
        ? "teacher"
        : null;
    }

    startTransition(() => formAction(payload));
  });

  const teachers = relatedData?.teachers ?? [];
  const students = relatedData?.students ?? [];
  const parents = relatedData?.parents ?? [];

  const receiverTypeOptions = isAdmin
    ? [
        { value: "teacher", label: "Teacher" },
        { value: "student", label: "Student" },
        { value: "parent", label: "Parent" },
      ]
    : [
        { value: "teacher", label: "Teacher" },
        { value: "student", label: "Student" },
        { value: "parent", label: "Parent" },
      ];

  const watchReceiverType = watch("receiverType");

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold text-center">
        {type === "create" ? "Create new message" : "Edit message"}
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
              return (
                <Select
                  options={receiverTypeOptions}
                  value={
                    receiverTypeOptions.find((o) => o.value === field.value) ||
                    null
                  }
                  onChange={(opt: any) => field.onChange(opt ? opt.value : "")}
                  isClearable={false}
                />
              );
            }}
          />
        </div>

        {!sendToAll && (
          <div className="flex-1">
            <label className="text-xs text-gray-500">Receiver</label>
            <Controller
              name="receiverId"
              control={control}
              render={({ field }) => {
                const opts =
                  watchReceiverType === "teacher"
                    ? teachers.map((t) => ({
                        value: String(t.id),
                        label: `${t.name} ${t.surname}`,
                      }))
                    : watchReceiverType === "student"
                    ? students.map((s) => ({
                        value: String(s.id),
                        label: `${s.name} ${s.surname}`,
                      }))
                    : parents.map((p) => ({
                        value: String(p.id),
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
            {errors.receiverId && (
              <p className="text-xs text-red-400">
                {errors.receiverId.message}
              </p>
            )}
          </div>
        )}
      </div>

      {isAdmin && (type === "create" || type === "update") && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="sendToAll"
            {...register("sendToAll")}
            className="w-4 h-4 rounded"
          />
          <label htmlFor="sendToAll" className="text-sm text-gray-700">
            Send to all {watchReceiverType}s
          </label>
        </div>
      )}

      {state.error && (
        <p className="text-xs text-red-400 text-center">
          {state.message || "Something went wrong. Please try again."}
        </p>
      )}

      <div className="flex justify-center">
        <Button type="submit" className="bg-classYellow py-2 px-4 rounded-md">
          {type === "create" ? "Send Message" : "Update Message"}
        </Button>
      </div>
    </form>
  );
};

export default MessageForm;
