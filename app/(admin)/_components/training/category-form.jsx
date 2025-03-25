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
import { Loader2, Pencil } from "lucide-react";
import { apiCall } from "@/lib/utils/api";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { Combobox } from "@/components/ui/combobox";

const formSchema = z.object({
  categoryId: z.string().min(1),
});

const CategoryForm = ({ initialData, courseId, options }) => {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [currentData, setCurrentData] = useState(
    options.find((option) => option.value === initialData?.categoryId) || null
  );

  const toggleEdit = () => setIsEditing((prev) => !prev);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: initialData?.categoryId || "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  useEffect(() => {
    form.reset({ categoryId: initialData?.categoryId || "" });
    setCurrentData(
      options.find((option) => option.value === initialData?.categoryId) || null
    );
  }, [initialData, form, options]);

  const onSubmit = async (values) => {
    try {
      const response = await apiCall("PATCH", `/training/course/${courseId}`, {
        categoryId: values.categoryId,
        userId: user.id,
      });

      if (response) {
        toast.success(response.message);
        toggleEdit();

        // ✅ Update state with new category
        const updatedCategory = options.find(
          (option) => option.value === values.categoryId
        );
        setCurrentData(updatedCategory || null);

        // ✅ Reset form with new values
        form.reset({ categoryId: values.categoryId });
      }
    } catch (error) {
      toast.error("Something went wrong!", {
        description: error?.message,
      });
    }
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4 transition-all">
      <div className="font-medium flex items-center justify-between">
        Course category
        <Button variant="ghost" onClick={toggleEdit} className="cursor-pointer">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className="h-4 w-4 cursor-pointer" />
              Edit
            </>
          )}
        </Button>
      </div>

      {/* Show the selected category */}
      {!isEditing && (
        <p
          className={cn(
            "text-sm mt-2",
            !currentData ? "text-slate-500 italic" : ""
          )}
        >
          {currentData ? currentData.label : "No category selected"}
        </p>
      )}

      {/* Show the edit form when editing */}
      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Combobox options={options} {...field} />
                  </FormControl>
                  <FormDescription className="text-sm ml-2 italic -mt-1">
                    Edit this course category.
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
                    <Loader2 className="animate-spin" /> Please wait...
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
  );
};

export default CategoryForm;
