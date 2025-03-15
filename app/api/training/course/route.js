import { trainingControllers } from "@/controller/training/trainingControllers";

export const GET = async (req) => trainingControllers.getAllCourses(req);
