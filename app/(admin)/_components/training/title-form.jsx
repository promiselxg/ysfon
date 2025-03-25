"use client";
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormMessage,
  FormField,
  FormItem,
  FormDescription,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiCall } from "@/lib/utils/api";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title is required",
  }),
});

const TitleForm = ({ initialData, courseId }) => {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [course, setCourse] = useState("");

  const toggleEdit = () => setIsEditing((current) => !current);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const { isSubmitting, isValid } = form.formState;

  useEffect(() => {
    form.reset(initialData);
  }, [initialData, form]);

  const onSubmit = async (values) => {
    try {
      const response = await apiCall("PATCH", `/training/course/${courseId}`, {
        title: values.title,
        userId: user.id,
      });
      if (response) {
        toast.success(`${response.message}`);
        toggleEdit();
        setCourse((prev) => ({ ...prev, title: values.title }));
      }
    } catch (error) {
      toast?.error("Something went wrong!", {
        description: `${error?.message}`,
      });
    }
  };

  return (
    <>
      <div className="mt-6 border bg-slate-100 rounded-md p-4 transition-all">
        <div className="font-medium flex items-center justify-between">
          Course title
          <Button
            variant="ghost"
            onClick={() => toggleEdit()}
            className=" cursor-pointer"
          >
            {isEditing ? (
              <>Cancel</>
            ) : (
              <>
                <Pencil className="h-4 w-4 cursor-pointer" />
                Edit title
              </>
            )}
          </Button>
        </div>
        {!isEditing && (
          <p
            className={cn(
              "text-sm mt-2",
              !initialData.title && "text-slate-500 italic"
            )}
          >
            {course ? course.title : initialData.title}
          </p>
        )}
        {isEditing && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 mt-4"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder="eg: 'Advanced web development"
                        className="shadow bg-white"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-sm ml-2 italic -mt-1">
                      edit course title.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center gap-x-2">
                <Button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  className="cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className=" animate-spin" /> please wait...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </>
  );
};

export default TitleForm;
