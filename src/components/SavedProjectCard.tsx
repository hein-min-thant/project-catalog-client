// src/components/SavedProjectCard.tsx
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { CardBody, CardFooter, Card, CardHeader } from "@heroui/react";
import { Button } from "@heroui/react";

import { Badge } from "@/components/ui/badge";
import api from "@/config/api";

interface SavedProjectCardProps {
  project: {
    projectId: number;
    projectTitle: string;
    projectDescription: string;
    categoryId: number;
    coverImageUrl: string;
    academic_year: string;
    student_year: string;
    departmentId: number;
    courseId: number;
  };
}

export default function SavedProjectCard({ project }: SavedProjectCardProps) {
  // Fetch department name
  const { data: department } = useQuery({
    queryKey: ["department", project.departmentId],
    queryFn: async () =>
      (await api.get(`/departments/${project.departmentId}`)).data,
    enabled: !!project.departmentId,
  });

  // Fetch course name
  const { data: course } = useQuery({
    queryKey: ["course", project.courseId],
    queryFn: async () => (await api.get(`/courses/${project.courseId}`)).data,
    enabled: !!project.courseId,
  });

  return (
    <Card
      key={project.projectId}
      className="overflow-hidden border-small border-foreground/1"
    >
      {project.coverImageUrl ? (
        <div className="w-full h-40 overflow-hidden">
          <img
            alt={project.coverImageUrl}
            className="w-full h-full object-cover"
            src={project.coverImageUrl}
          />
        </div>
      ) : (
        <div className="w-full h-40 overflow-hidden">
          <img
            alt={project.coverImageUrl}
            className="w-full h-full object-cover"
            src="https://i.ibb.co/3yYHDr3s/6306486.jpg"
          />
        </div>
      )}
      <CardHeader className="pb-0">
        <p className="text-xl font-semibold">{project.projectTitle}</p>
      </CardHeader>
      <CardBody className="px-3 py-2">
        <Badge className="text-xs block">
          {department ? department.name : ""}
          {department && course ? " / " : ""}
          {course ? course.name : ""}
        </Badge>
        <div className="flex flex-col gap-2 pt-2">
          <p className="text-sm line-clamp-3">{project.projectDescription}</p>
          <div className="flex items-center gap-2 text-xs mt-2">
            {project.academic_year && (
              <div className="flex items-center gap-1">
                <Icon icon="mdi:calendar" />
                <span>{project.academic_year}</span>
              </div>
            )}
            {project.student_year && (
              <div className="flex items-center gap-1 ml-3">
                <Icon icon="mdi:school" />
                <span>{project.student_year}</span>
              </div>
            )}
          </div>
        </div>
      </CardBody>
      <CardFooter className="justify-end gap-2">
        <Button
          as="a"
          className="flex items-center gap-1"
          color="primary"
          href={`/projects/${project.projectId}`}
          size="sm"
        >
          View Project
          <Icon icon="mdi:arrow-right" />
        </Button>
      </CardFooter>
    </Card>
  );
}
