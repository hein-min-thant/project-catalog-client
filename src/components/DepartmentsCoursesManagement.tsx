/* eslint-disable jsx-a11y/label-has-associated-control */
import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api from "@/config/api";
import { Department, Course } from "@/types";
import {
  useDepartments,
  useAllCourses,
} from "@/hooks/useDepartmentsAndCourses";

// Departments and Courses Management Component
const DepartmentsCoursesManagement = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"departments" | "courses">(
    "departments"
  );
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Dialog states
  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [isDeleteDepartmentDialogOpen, setIsDeleteDepartmentDialogOpen] =
    useState(false);
  const [isDeleteCourseDialogOpen, setIsDeleteCourseDialogOpen] =
    useState(false);

  // Form states
  const [departmentForm, setDepartmentForm] = useState({ name: "" });
  const [courseForm, setCourseForm] = useState({
    name: "",
    code: "",
    department: { id: "" },
  });

  // Fetch data
  const { data: departments, isLoading: departmentsLoading } = useDepartments();
  const { data: allCourses, isLoading: coursesLoading } = useAllCourses();

  // Filtered data
  const filteredDepartments = useMemo(() => {
    if (!departments) return [];
    return departments.filter((dept) =>
      dept.name.toLowerCase().includes(departmentSearch.toLowerCase())
    );
  }, [departments, departmentSearch]);

  const filteredCourses = useMemo(() => {
    if (!allCourses) return [];
    return allCourses.filter(
      (course) =>
        course.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
        course.code.toLowerCase().includes(courseSearch.toLowerCase()) ||
        course.department.name
          .toLowerCase()
          .includes(courseSearch.toLowerCase())
    );
  }, [allCourses, courseSearch]);

  // Department mutations
  const createDepartmentMutation = useMutation({
    mutationFn: (data: { name: string }) => api.post("/departments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setIsDepartmentDialogOpen(false);
      setDepartmentForm({ name: "" });
    },
  });

  const updateDepartmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string } }) =>
      api.put(`/departments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setIsDepartmentDialogOpen(false);
      setSelectedDepartment(null);
      setDepartmentForm({ name: "" });
    },
  });

  const deleteDepartmentMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/departments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["allCourses"] });
      setIsDeleteDepartmentDialogOpen(false);
      setSelectedDepartment(null);
    },
  });

  // Course mutations
  const createCourseMutation = useMutation({
    mutationFn: (data: {
      name: string;
      code: string;
      department: { id: number };
    }) => api.post("/courses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allCourses"] });
      setIsCourseDialogOpen(false);
      setCourseForm({ name: "", code: "", department: { id: "" } });
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { name: string; code: string; department: { id: number } };
    }) => api.put(`/courses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allCourses"] });
      setIsCourseDialogOpen(false);
      setSelectedCourse(null);
      setCourseForm({ name: "", code: "", department: { id: "" } });
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/courses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allCourses"] });
      setIsDeleteCourseDialogOpen(false);
      setSelectedCourse(null);
    },
  });

  // Handlers
  const handleCreateDepartment = () => {
    setSelectedDepartment(null);
    setDepartmentForm({ name: "" });
    setIsDepartmentDialogOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setDepartmentForm({ name: department.name });
    setIsDepartmentDialogOpen(true);
  };

  const handleDeleteDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setIsDeleteDepartmentDialogOpen(true);
  };

  const handleCreateCourse = () => {
    setSelectedCourse(null);
    setCourseForm({ name: "", code: "", department: { id: "" } });
    setIsCourseDialogOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setCourseForm({
      name: course.name,
      code: course.code,
      department: { id: course.department.id.toString() },
    });
    setIsCourseDialogOpen(true);
  };

  const handleDeleteCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsDeleteCourseDialogOpen(true);
  };

  const submitDepartment = () => {
    if (!departmentForm.name.trim()) return;

    if (selectedDepartment) {
      updateDepartmentMutation.mutate({
        id: selectedDepartment.id,
        data: departmentForm,
      });
    } else {
      createDepartmentMutation.mutate(departmentForm);
    }
  };

  const submitCourse = () => {
    if (
      !courseForm.name.trim() ||
      !courseForm.code.trim() ||
      !courseForm.department.id
    )
      return;

    const payload = {
      name: courseForm.name,
      code: courseForm.code,
      department: { id: Number(courseForm.department.id) },
    };

    if (selectedCourse) {
      updateCourseMutation.mutate({
        id: selectedCourse.id,
        data: payload,
      });
    } else {
      createCourseMutation.mutate(payload);
    }
  };

  const confirmDeleteDepartment = () => {
    if (selectedDepartment) {
      deleteDepartmentMutation.mutate(selectedDepartment.id);
    }
  };

  const confirmDeleteCourse = () => {
    if (selectedCourse) {
      deleteCourseMutation.mutate(selectedCourse.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with tabs */}
      <Card className="bg-gradient-to-br from-background to-gray-50/50 dark:to-gray-800/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Icon className="text-xl text-cyan-500" icon="mdi:school" />
            </div>
            <div>
              <CardTitle className="text-2xl">
                Department & Course Management
              </CardTitle>
              <CardDescription>
                Manage departments and courses for project classification
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "departments" | "courses")
            }
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="departments"
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" icon="mdi:office-building" />
                Departments ({filteredDepartments.length})
              </TabsTrigger>
              <TabsTrigger value="courses" className="flex items-center gap-2">
                <Icon className="w-4 h-4" icon="mdi:book-open-page-variant" />
                Courses ({filteredCourses.length})
              </TabsTrigger>
            </TabsList>

            {/* Departments Tab */}
            <TabsContent value="departments" className="mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Icon
                      className="text-cyan-500 text-sm"
                      icon="mdi:magnify"
                    />
                    Search Departments
                  </label>
                  <Input
                    className="bg-background/80 border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 focus:ring-cyan-500/20 max-w-xs"
                    placeholder="Search by name..."
                    value={departmentSearch}
                    onChange={(e) => setDepartmentSearch(e.target.value)}
                  />
                </div>
                <Button
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                  onClick={handleCreateDepartment}
                >
                  <Icon className="w-4 h-4 mr-2" icon="mdi:plus" />
                  Add Department
                </Button>
              </div>

              {departmentsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-16 h-16 border-4 border-cyan-200 dark:border-cyan-800 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Loading Departments...
                    </h3>
                  </div>
                </div>
              ) : filteredDepartments.length === 0 ? (
                <Card className="bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50">
                  <CardContent className="p-12 text-center">
                    <Icon
                      className="w-16 h-16 mx-auto mb-6 text-gray-400 dark:text-gray-500"
                      icon="mdi:office-building"
                    />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {departmentSearch
                        ? "No matching departments"
                        : "No departments found"}
                    </h3>
                    <p className="text-default-600 mb-6 max-w-md mx-auto">
                      {departmentSearch
                        ? "No departments found matching your search criteria."
                        : "There are currently no departments in the system."}
                    </p>
                    {!departmentSearch && (
                      <Button
                        className="border-cyan-500 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/50"
                        variant="outline"
                        onClick={handleCreateDepartment}
                      >
                        Create First Department
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredDepartments.map((department) => (
                    <Card
                      key={department.id}
                      className="group bg-gradient-to-br from-background to-gray-50/50 dark:to-gray-800/50"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                              <Icon
                                className="text-white text-lg"
                                icon="mdi:office-building"
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                {department.name}
                              </h3>
                              <p className="text-default-600 text-sm">
                                {allCourses?.filter(
                                  (c) => c.department.id === department.id
                                ).length || 0}{" "}
                                courses
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            className="border-cyan-500 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 flex-1"
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditDepartment(department)}
                          >
                            <Icon className="w-4 h-4 mr-1" icon="mdi:pencil" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="text-white"
                            onClick={() => handleDeleteDepartment(department)}
                          >
                            <Icon className="w-4 h-4 mr-1" icon="mdi:delete" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses" className="mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Icon
                      className="text-cyan-500 text-sm"
                      icon="mdi:magnify"
                    />
                    Search Courses
                  </label>
                  <Input
                    className="bg-background/80 border-cyan-200 dark:border-cyan-800 focus:border-cyan-500 focus:ring-cyan-500/20 max-w-xs"
                    placeholder="Search by name, code, or department..."
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                  />
                </div>
                <Button
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                  onClick={handleCreateCourse}
                >
                  <Icon className="w-4 h-4 mr-2" icon="mdi:plus" />
                  Add Course
                </Button>
              </div>

              {coursesLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-16 h-16 border-4 border-cyan-200 dark:border-cyan-800 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Loading Courses...
                    </h3>
                  </div>
                </div>
              ) : filteredCourses.length === 0 ? (
                <Card className="bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50">
                  <CardContent className="p-12 text-center">
                    <Icon
                      className="w-16 h-16 mx-auto mb-6 text-gray-400 dark:text-gray-500"
                      icon="mdi:book-open-page-variant"
                    />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {courseSearch
                        ? "No matching courses"
                        : "No courses found"}
                    </h3>
                    <p className="text-default-600 mb-6 max-w-md mx-auto">
                      {courseSearch
                        ? "No courses found matching your search criteria."
                        : "There are currently no courses in the system."}
                    </p>
                    {!courseSearch && (
                      <Button
                        className="border-cyan-500 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/50"
                        variant="outline"
                        onClick={handleCreateCourse}
                      >
                        Create First Course
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredCourses.map((course) => (
                    <Card
                      key={course.id}
                      className="group bg-gradient-to-br from-background to-gray-50/50 dark:to-gray-800/50"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                              <Icon
                                className="text-white text-lg"
                                icon="mdi:book-open-page-variant"
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                {course.name}
                              </h3>
                              <p className="text-default-600 text-sm">
                                Code:{" "}
                                <Badge className="bg-cyan-500/10 text-cyan-600 border-cyan-500/20 ml-1">
                                  {course.code}
                                </Badge>
                              </p>
                              <p className="text-default-600 text-sm mt-1">
                                Department: {course.department.name}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              className="border-cyan-500 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/50"
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditCourse(course)}
                            >
                              <Icon
                                className="w-4 h-4 mr-1"
                                icon="mdi:pencil"
                              />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="text-white"
                              onClick={() => handleDeleteCourse(course)}
                            >
                              <Icon
                                className="w-4 h-4 mr-1"
                                icon="mdi:delete"
                              />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Department Dialog */}
      <Dialog
        open={isDepartmentDialogOpen}
        onOpenChange={setIsDepartmentDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDepartment ? "Edit Department" : "Create Department"}
            </DialogTitle>
            <DialogDescription>
              {selectedDepartment
                ? "Update department information"
                : "Add a new department to the system"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="departmentName">
                Department Name *
              </label>
              <Input
                id="departmentName"
                placeholder="Enter department name"
                value={departmentForm.name}
                onChange={(e) => setDepartmentForm({ name: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDepartmentDialogOpen(false)}
              className="mb-4"
            >
              Cancel
            </Button>
            <Button
              disabled={
                !departmentForm.name.trim() ||
                createDepartmentMutation.isPending ||
                updateDepartmentMutation.isPending
              }
              onClick={submitDepartment}
            >
              {createDepartmentMutation.isPending ||
              updateDepartmentMutation.isPending ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  {selectedDepartment ? "Updating..." : "Creating..."}
                </>
              ) : selectedDepartment ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Course Dialog */}
      <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedCourse ? "Edit Course" : "Create Course"}
            </DialogTitle>
            <DialogDescription>
              {selectedCourse
                ? "Update course information"
                : "Add a new course to the system"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="courseName">
                Course Name *
              </label>
              <Input
                id="courseName"
                placeholder="Enter course name"
                value={courseForm.name}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="courseCode">
                Course Code *
              </label>
              <Input
                id="courseCode"
                placeholder="Enter course code (e.g., CS101)"
                value={courseForm.code}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, code: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="departmentSelect">
                Department *
              </label>
              <Select
                value={courseForm.department.id}
                onValueChange={(value) =>
                  setCourseForm({
                    ...courseForm,
                    department: { ...courseForm.department, id: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments?.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCourseDialogOpen(false)}
              className="mb-4"
            >
              Cancel
            </Button>
            <Button
              disabled={
                !courseForm.name.trim() ||
                !courseForm.code.trim() ||
                !courseForm.department.id ||
                createCourseMutation.isPending ||
                updateCourseMutation.isPending
              }
              onClick={submitCourse}
            >
              {createCourseMutation.isPending ||
              updateCourseMutation.isPending ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  {selectedCourse ? "Updating..." : "Creating..."}
                </>
              ) : selectedCourse ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Department Dialog */}
      <Dialog
        open={isDeleteDepartmentDialogOpen}
        onOpenChange={setIsDeleteDepartmentDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedDepartment?.name}
              &quot;? This will also delete all courses associated with this
              department. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDepartmentDialogOpen(false)}
              className="mb-4"
            >
              Cancel
            </Button>
            <Button
              disabled={deleteDepartmentMutation.isPending}
              variant="destructive"
              className="text-white"
              onClick={confirmDeleteDepartment}
            >
              {deleteDepartmentMutation.isPending ? (
                <>
                  <Spinner size="sm" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Course Dialog */}
      <Dialog
        open={isDeleteCourseDialogOpen}
        onOpenChange={setIsDeleteCourseDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedCourse?.name}&quot;
              ({selectedCourse?.code})? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteCourseDialogOpen(false)}
              className="mb-4"
            >
              Cancel
            </Button>
            <Button
              disabled={deleteCourseMutation.isPending}
              variant="destructive"
              className="text-white"
              onClick={confirmDeleteCourse}
            >
              {deleteCourseMutation.isPending ? (
                <>
                  <Spinner size="sm" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentsCoursesManagement;
