"use client";

import DescriptionForm from "@/app/(admin)/_components/training/description-form";
import TitleForm from "@/app/(admin)/_components/training/title-form";
import { apiCall } from "@/lib/utils/api";
import { isValidUUID } from "@/lib/utils/validateUUID";
import { useAuthStore } from "@/store/authStore";
import { redirect, useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const CourseEditPage = () => {
  const [course, setCourse] = useState({});
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const { user } = useAuthStore();

  if (!params) return null;

  const { courseId } = params;

  // 1. Check if courseId is valid
  if (!isValidUUID(courseId)) {
    redirect("/dashboard");
  }

  // 2. Check if user exists
  if (!user) {
    redirect("/auth/login");
  }

  const requiredFields = [
    course.title,
    course.description,
    course.imageUrl,
    course.categoryId,
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completedText = `(${completedFields}/${totalFields})`;

  const fetchCourseInfo = async () => {
    try {
      setLoading(true);
      const response = await apiCall("GET", `/training/course/${courseId}`);
      if (!response || Object.keys(response).length === 0) {
        redirect("/dashboard");
      }
      setCourse(response?.course);
    } catch (error) {
      console.log(error);
      //redirect("/dashboardz");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseInfo();
  }, [courseId]);

  // Show loading state while fetching
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  // Ensure course exists before rendering content
  if (!course) {
    redirect("/dashboard");
  }

  return (
    <div className="p-6 bg-muted h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-y-2">
          <h1 className="text-2xl font-medium">Course setup</h1>
          <span className="text-sm text-slate-700">
            Complete all fields {completedText}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
        <div>
          <div className="flex items-center gap-x-2">
            <h2 className="text-xl">Customize your course</h2>
          </div>
          <TitleForm initialData={course} courseId={course.id} />
          <DescriptionForm initialData={course} courseId={course.id} />
        </div>
      </div>
    </div>
  );
};

export default CourseEditPage;
