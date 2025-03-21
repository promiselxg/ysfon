import React from "react";
import CourseTitle from "../../../_components/training/form-course-title";

const TrainingPage = () => {
  return (
    <>
      <div className="flex w-full">
        <div className="w-full flex  items-center justify-center h-[calc(100vh-64px)]">
          <div className="p-5 w-full flex max-w-5xl mx-auto md:items-center md:justify-center">
            <CourseTitle />
          </div>
        </div>
      </div>
    </>
  );
};

export default TrainingPage;
