import { useQuery } from "@tanstack/react-query";
import api from "@/config/api";
import { Department, Course } from "@/types";

export const useDepartments = () => {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data } = await api.get("/departments");
      return data as Department[];
    },
  });
};

export const useCourses = (departmentId?: number) => {
  return useQuery({
    queryKey: ["courses", departmentId],
    queryFn: async () => {
      if (!departmentId) return [];
      const { data } = await api.get(`/departments/${departmentId}/courses`);
      return data as Course[];
    },
    enabled: !!departmentId,
  });
};

export const useAllCourses = () => {
  return useQuery({
    queryKey: ["allCourses"],
    queryFn: async () => {
      const { data } = await api.get("/courses");
      return data as Course[];
    },
  });
};