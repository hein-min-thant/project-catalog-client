import React, { useState, useMemo, useEffect } from "react";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";
import { useNavigate, useParams } from "react-router-dom";
import { Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";

import DefaultLayout from "@/layouts/default";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/config/api";
import { useSupervisors } from "@/hooks/useSupervisors";

// Define the shape of a member
interface Member {
  name: string;
  rollNumber: string;
}

const EditProjectPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [showProjectInfo, setShowProjectInfo] = useState(true);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    body: string;
    benefits: string;
    githubLink: string;
    academic_year: string;
    student_year: string;
    categoryId: string;
    supervisorId: string;
    approvalStatus: string;
    tags: string[];
    members: Member[];
  }>({
    title: "",
    description: "",
    body: "",
    benefits: "",
    githubLink: "",
    academic_year: "",
    student_year: "",
    categoryId: "",
    approvalStatus: "",
    supervisorId: "",
    tags: [],
    members: [{ name: "", rollNumber: "" }],
  });

  const [projectFiles, setProjectFiles] = useState<File[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string>("");

  // Fetch supervisors for dropdown
  const { data: supervisors, isLoading: isLoadingSupervisors } =
    useSupervisors();

  // The provided data for the dropdowns
  const { academicYears, studentYears, categories } = useMemo(() => {
    const years = [];
    const startYear = 2000;
    const currentYear = new Date().getFullYear();

    for (let year = startYear; year <= currentYear; year++) {
      years.push({ key: `${year}-${year + 1}`, label: `${year}-${year + 1}` });
    }

    return {
      academicYears: years.reverse(),
      studentYears: [
        { key: "First Year", label: "First Year" },
        { key: "Second Year", label: "Second Year" },
        { key: "Third Year", label: "Third Year" },
        { key: "Fourth Year", label: "Fourth Year" },
        { key: "Final Year", label: "Final Year" },
        { key: "Master", label: "Master" },
      ],
      categories: [
        { key: "1", label: "Web Development" },
        { key: "2", label: "Mobile App" },
      ],
    };
  }, []);

  // Load existing project
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${id}`);
        const project = res.data;

        // Convert project members to form format
        let members = [{ name: "", rollNumber: "" }];
        try {
          if (
            project.membersJson &&
            project.membersJson !== "[]" &&
            project.membersJson !== ""
          ) {
            const parsedMembers = JSON.parse(project.membersJson);
            members = parsedMembers.map((member: any) => ({
              name: member.name || "",
              rollNumber: member.rollNumber || "",
            }));
          }
        } catch (error) {
          console.error("Error parsing members:", error);
          members = [{ name: "", rollNumber: "" }];
        }

        // Set form data with all fields
        setFormData({
          title: project.title || "",
          description: project.description || "",
          body: project.body || "",
          benefits: project.benefits || "",
          githubLink: project.githubLink || "",
          academic_year: project.academic_year || "",
          student_year: project.student_year || "",
          categoryId: project.categoryId?.toString() || "",
          approvalStatus: "PENDING",
          supervisorId: project.supervisorId?.toString() || "",
          tags: project.tags || [],
          members:
            members.length > 0 ? members : [{ name: "", rollNumber: "" }],
        });
      } catch (error) {
        console.error("Failed to fetch project", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  // Input handlers
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle changes for Select components
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuillChange = (content: string) => {
    setFormData((prev) => ({ ...prev, body: content }));
  };

  // Handle dynamic member inputs
  const handleMemberChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const newMembers = [...formData.members];

    newMembers[index] = { ...newMembers[index], [name]: value };
    setFormData((prev) => ({ ...prev, members: newMembers }));
  };

  const handleAddMember = () => {
    setFormData((prev) => ({
      ...prev,
      members: [...prev.members, { name: "", rollNumber: "" }],
    }));
  };

  const handleRemoveMember = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index),
    }));
  };

  // Handle adding tags
  const handleAddTag = () => {
    if (newTag.trim() !== "") {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setProjectFiles(Array.from(e.target.files));
    }
  };

  // Submit (PUT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    const formDataToSubmit = new FormData();

    // Append all string fields
    Object.keys(formData).forEach((key) => {
      if (key !== "members" && key !== "tags") {
        const value = formData[key as keyof typeof formData];

        if (value !== undefined && value !== null && value !== "") {
          formDataToSubmit.append(key, String(value));
        }
      }
    });

    // Filter out empty members before converting to JSON
    const validMembers = formData.members.filter(
      (member) => member.name || member.rollNumber
    );

    // Convert valid members array to a Map<String, String> format for the backend
    const membersMap = validMembers.reduce(
      (map, member) => {
        if (member.name) {
          map[member.name] = member.rollNumber || "";
        }

        return map;
      },
      {} as { [key: string]: string }
    );

    const membersJsonString = JSON.stringify(membersMap);

    // Only append membersJson if there are valid members to send
    if (validMembers.length > 0) {
      formDataToSubmit.append("membersJson", membersJsonString);
    }

    // Handle tags array - send as JSON string to avoid Spring binding issues
    if (formData.tags.length > 0) {
      formDataToSubmit.append("tagsJson", JSON.stringify(formData.tags));
    }

    projectFiles.forEach((file) => {
      formDataToSubmit.append("projectFiles", file);
    });

    try {
      const res = await api.put(`/projects/${id}`, formDataToSubmit, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 200) {
        setSubmitMessage("Project updated successfully!");
        navigate(`/projects/${id}`);
      } else {
        setSubmitMessage(`Failed: ${res.statusText}`);
      }
    } catch (error: any) {
      setSubmitMessage(
        error.response?.data || "Failed to update project. Try again."
      );
      console.error("Update error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quill toolbar
  const modules = useMemo(
    () => ({
      toolbar: [
        { header: "1" },
        { header: "2" },
        "bold",
        "italic",
        "underline",
        "strike",
        "blockquote",
        "code-block",
        { list: "ordered" },
        { list: "bullet" },
        { script: "sub" },
        { script: "super" },
        { indent: "-1" },
        { indent: "+1" },
        { direction: "rtl" },
        { align: "" },
        { align: "center" },
        { align: "right" },
        { align: "justify" },
        "link",
        "image",
        "video",
      ],
    }),
    []
  );

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex flex-col min-h-screen bg-background">
          <div className="container mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center space-y-4">
                <div className="p-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl">
                  <Spinner className="text-orange-500" size="lg" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Loading Project
                  </h2>
                  <p className="text-default-600">
                    Please wait while we fetch your project details...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <style>{`
        /* Custom styles for ReactQuill */
       .ql-snow.ql-toolbar,
        .ql-snow .ql-toolbar {
          border: none;
          position: sticky;
          top: 0;
          z-index: 10;
          background-color: white;
        }
        .dark .ql-snow.ql-toolbar,
        .dark .ql-snow .ql-toolbar {
          background-color : rgb(30, 41, 59 );
        }

        .dark .ql-toolbar .ql-stroke {
        stroke: white;
    }
        .dark .ql-toolbar .ql-fill{
          fill : white;
        }

        .dark .ql-toolbar .ql-picker {
          color : white;
        }

        .dark .ql-picker-options{
        background-color : rgb(30, 41, 59);
        }
        .ql-container.ql-snow {
          border: none;
          font-size: 16px;
          font-family: "Geist", sans-serif;

        }
        .ql-editor {
          font-family: "Geist", sans-serif;
          -ms-overflow-style: none;
          scrollbar-width: none;
          }
        .ql-container {
          border-radius: 0.5rem;
        }
      `}</style>

      <div
        className={`flex flex-col min-h-screen bg-background  mx-auto
        ${showProjectInfo ? "" : "max-w-5xl"}
        `}
      >
        <div className="container mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
          {/* Enhanced Header Section */}
          <div className="text-center space-y-6 mb-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 dark:from-orange-500/30 dark:to-red-500/30 rounded-2xl">
                <Icon
                  className="h-12 w-12 text-orange-500"
                  icon="mdi:pencil-circle"
                />
              </div>
            </div>
            <div className="flex justify-center items-center gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent mb-4">
                  Edit Project
                </h1>
                <p className="text-lg text-default-600 max-w-2xl mx-auto">
                  Refine your project details and enhance your documentation
                </p>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <Button
              className="border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/50"
              size="sm"
              variant="outline"
              onClick={() => setShowProjectInfo(!showProjectInfo)}
            >
              <Icon
                className="mr-2"
                icon={showProjectInfo ? "mdi:eye-off" : "mdi:eye"}
              />
              {showProjectInfo ? "Hide" : "Show"} Project Information Column
            </Button>
          </div>
          {/* Form */}
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div
              className={`grid gap-8 ${showProjectInfo ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"}`}
            >
              {/* Left Column - General Info */}
              {showProjectInfo && (
                <div className="space-y-6 lg:col-span-1">
                  <Card className="bg-gradient-to-br from-background to-gray-50/50 dark:to-gray-800/50 border-border/50">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                          <Icon
                            className="text-xl text-orange-500"
                            icon="mdi:information-outline"
                          />
                        </div>
                        <div>
                          <CardTitle className="text-xl">
                            Project Information
                          </CardTitle>
                          <CardDescription>
                            Update your project&apos;s core details
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-medium" htmlFor="title">
                          Project Title *
                        </Label>
                        <Input
                          required
                          className="border-orange-200 dark:border-orange-800 focus:border-orange-500 focus:ring-orange-500/20"
                          id="title"
                          name="title"
                          placeholder="e.g., AI-Powered Chatbot"
                          value={formData.title}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-medium" htmlFor="description">
                          Short Description *
                        </Label>
                        <Textarea
                          required
                          className="border-orange-200 dark:border-orange-800 focus:border-orange-500 focus:ring-orange-500/20 min-h-[100px]"
                          id="description"
                          name="description"
                          placeholder="Brief summary of your project"
                          value={formData.description}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-medium" htmlFor="benefits">
                          Benefits (Optional)
                        </Label>
                        <Textarea
                          className="border-orange-200 dark:border-orange-800 focus:border-orange-500 focus:ring-orange-500/20 min-h-[80px]"
                          id="benefits"
                          name="benefits"
                          placeholder="How will this project benefit users or the community?"
                          value={formData.benefits}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-medium" htmlFor="githubLink">
                          GitHub Repository (Optional)
                        </Label>
                        <Input
                          className="border-orange-200 dark:border-orange-800 focus:border-orange-500 focus:ring-orange-500/20"
                          id="githubLink"
                          name="githubLink"
                          placeholder="https://github.com/username/project"
                          value={formData.githubLink}
                          onChange={handleInputChange}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-background to-gray-50/50 dark:to-gray-800/50 border-border/50">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                          <Icon
                            className="text-xl text-orange-500"
                            icon="mdi:cog-outline"
                          />
                        </div>
                        <div>
                          <CardTitle className="text-xl">
                            Project Settings
                          </CardTitle>
                          <CardDescription>
                            Academic details and categorization
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-medium" htmlFor="academic_year">
                          Academic Year *
                        </Label>
                        <Select
                          required
                          value={formData.academic_year}
                          onValueChange={(value) =>
                            handleSelectChange("academic_year", value)
                          }
                        >
                          <SelectTrigger className="bg-background/80 border-orange-200 dark:border-orange-800 focus:border-orange-500 focus:ring-orange-500/20">
                            <SelectValue placeholder="Select academic year" />
                          </SelectTrigger>
                          <SelectContent className="bg-background border border-border shadow-lg">
                            {academicYears.map((year) => (
                              <SelectItem key={year.key} value={year.key}>
                                {year.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-medium" htmlFor="student_year">
                          Student Year *
                        </Label>
                        <Select
                          required
                          value={formData.student_year}
                          onValueChange={(value) =>
                            handleSelectChange("student_year", value)
                          }
                        >
                          <SelectTrigger className="bg-background/80 border-orange-200 dark:border-orange-800 focus:border-orange-500 focus:ring-orange-500/20">
                            <SelectValue placeholder="Select student year" />
                          </SelectTrigger>
                          <SelectContent className="bg-background border border-border shadow-lg">
                            {studentYears.map((year) => (
                              <SelectItem key={year.key} value={year.key}>
                                {year.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-medium" htmlFor="categoryId">
                          Category *
                        </Label>
                        <Select
                          required
                          value={formData.categoryId}
                          onValueChange={(value) =>
                            handleSelectChange("categoryId", value)
                          }
                        >
                          <SelectTrigger className="bg-background/80 border-orange-200 dark:border-orange-800 focus:border-orange-500 focus:ring-orange-500/20">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent className="bg-background border border-border shadow-lg">
                            {categories.map((category) => (
                              <SelectItem
                                key={category.key}
                                value={category.key}
                              >
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-medium" htmlFor="supervisorId">
                          Supervisor (Optional)
                        </Label>
                        <Select
                          value={formData.supervisorId}
                          onValueChange={(value) =>
                            handleSelectChange("supervisorId", value)
                          }
                        >
                          <SelectTrigger className="bg-background/80 border-orange-200 dark:border-orange-800 focus:border-orange-500 focus:ring-orange-500/20">
                            <SelectValue placeholder="Select a supervisor" />
                          </SelectTrigger>
                          <SelectContent className="bg-background border border-border shadow-lg">
                            <SelectItem value="null-supervisor">
                              No supervisor
                            </SelectItem>
                            {isLoadingSupervisors ? (
                              <SelectItem disabled value="loading-placeholder">
                                Loading supervisors...
                              </SelectItem>
                            ) : (
                              supervisors?.map((supervisor) => (
                                <SelectItem
                                  key={supervisor.id}
                                  value={supervisor.id.toString()}
                                >
                                  {supervisor.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-background to-gray-50/50 dark:to-gray-800/50 border-border/50">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                          <Icon
                            className="text-xl text-orange-500"
                            icon="mdi:tag-multiple"
                          />
                        </div>
                        <div>
                          <CardTitle className="text-xl">
                            Technologies & Tags
                          </CardTitle>
                          <CardDescription>
                            Add relevant tags and technologies
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-medium">Add Tags</Label>
                        <div className="flex gap-2">
                          <Input
                            className="border-orange-200 dark:border-orange-800 focus:border-orange-500 focus:ring-orange-500/20"
                            placeholder="e.g., react, spring, ai"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddTag();
                              }
                            }}
                          />
                          <Button
                            className="border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/50"
                            type="button"
                            variant="outline"
                            onClick={handleAddTag}
                          >
                            Add
                          </Button>
                        </div>
                        <p className="text-xs text-default-600">
                          Press Enter or click Add to include tags
                        </p>
                      </div>

                      {formData.tags.length > 0 && (
                        <div className="space-y-2">
                          <Label className="font-medium">Selected Tags</Label>
                          <div className="flex flex-wrap gap-2">
                            {formData.tags.map((tag, index) => (
                              <Badge
                                key={index}
                                className="bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/20 transition-colors cursor-pointer"
                              >
                                <span>{tag}</span>
                                <Button
                                  className="ml-1 p-0 w-auto h-auto hover:bg-transparent"
                                  size="sm"
                                  type="button"
                                  variant="ghost"
                                  onClick={() => handleRemoveTag(index)}
                                >
                                  <Icon className="text-xs" icon="mdi:close" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-background to-gray-50/50 dark:to-gray-800/50 border-border/50">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                          <Icon
                            className="text-xl text-orange-500"
                            icon="mdi:account-group"
                          />
                        </div>
                        <div>
                          <CardTitle className="text-xl">
                            Team Members
                          </CardTitle>
                          <CardDescription>
                            Update your project team members
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {formData.members.map((member, index) => (
                        <div
                          key={index}
                          className="p-3 bg-background/50 rounded-lg border border-border/50 space-y-3"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-default-600">
                              Member {index + 1}
                            </span>
                            {formData.members.length > 1 && (
                              <Button
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                                size="sm"
                                type="button"
                                variant="ghost"
                                onClick={() => handleRemoveMember(index)}
                              >
                                <Icon className="text-sm" icon="mdi:close" />
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label
                                className="text-xs font-medium"
                                htmlFor={`name-${index}`}
                              >
                                Name *
                              </Label>
                              <Input
                                required
                                className="border-orange-200 dark:border-orange-800 focus:border-orange-500 focus:ring-orange-500/20"
                                id={`name-${index}`}
                                name="name"
                                placeholder="Full Name"
                                value={member.name}
                                onChange={(e) => handleMemberChange(index, e)}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label
                                className="text-xs font-medium"
                                htmlFor={`rollNumber-${index}`}
                              >
                                Roll Number
                              </Label>
                              <Input
                                className="border-orange-200 dark:border-orange-800 focus:border-orange-500 focus:ring-orange-500/20"
                                id={`rollNumber-${index}`}
                                name="rollNumber"
                                placeholder="e.g., CS001"
                                value={member.rollNumber}
                                onChange={(e) => handleMemberChange(index, e)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <Button
                        className="w-full border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/50"
                        type="button"
                        variant="outline"
                        onClick={handleAddMember}
                      >
                        <Icon className="mr-2" icon="mdi:plus" />
                        Add Team Member
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-background to-gray-50/50 dark:to-gray-800/50 border-border/50">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div>
                          <CardTitle className="text-xl">
                            Project Files
                          </CardTitle>
                          <CardDescription>
                            Upload additional files or replace existing ones
                            (only zip files allowed due to storage limitations)
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Input
                          multiple
                          className="border-orange-200 dark:border-orange-800 focus:border-orange-500 focus:ring-orange-500/20"
                          id="projectFiles"
                          name="projectFiles"
                          type="file"
                          accept=".zip,application/zip,application/x-zip-compressed"
                          onChange={handleFileChange}
                        />
                        <p className="text-xs text-default-600">
                          Supported formats: PDF, DOC, PPT, Images, and more
                        </p>
                        {projectFiles.length > 0 && (
                          <div className="space-y-1">
                            <Label className="text-sm font-medium">
                              Selected Files ({projectFiles.length})
                            </Label>
                            <div className="space-y-1">
                              {projectFiles.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 text-sm text-default-600 bg-background/50 p-2 rounded"
                                >
                                  <Icon
                                    className="text-orange-500"
                                    icon="mdi:file-document-outline"
                                  />
                                  <span className="truncate">{file.name}</span>
                                  <span className="text-xs text-default-600">
                                    ({(file.size / 1024 / 1024).toFixed(1)} MB)
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Right Column - Project Body Editor */}
              <div
                className={`${showProjectInfo ? "lg:col-span-2" : "w-full"}`}
              >
                <Card className="bg-gradient-to-br from-background to-gray-50/50 dark:to-gray-800/50 border-border/50 h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500/10 rounded-lg">
                        <Icon
                          className="text-xl text-orange-500"
                          icon="mdi:file-document-edit-outline"
                        />
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          Project Documentation
                        </CardTitle>
                        <CardDescription>
                          Edit your comprehensive project report
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-orange-950/50 dark:to-red-950/50 p-4 rounded-lg border border-orange-200/50 dark:border-orange-800/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon
                            className="text-orange-500"
                            icon="mdi:lightbulb-on"
                          />
                          <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                            Editing Tips
                          </span>
                        </div>
                        <ul className="text-sm text-default-600 space-y-1">
                          <li>• Focus on recent changes and improvements</li>
                          <li>• Update results and findings</li>
                          <li>• Add new code snippets or diagrams</li>
                          <li>• Include any lessons learned</li>
                          <li>
                            • <b>Use images smaller than 1MB</b>
                          </li>
                        </ul>
                      </div>

                      <div className="h-[600px] p-6 border border-orange-200 dark:border-orange-800 rounded-lg overflow-hidden">
                        <ReactQuill
                          key="quill-editor"
                          className="h-full"
                          modules={modules}
                          placeholder="Update your project report here... Include recent changes, new findings, and improvements..."
                          theme="snow"
                          value={formData.body}
                          onChange={handleQuillChange}
                        />
                      </div>

                      <div className="text-sm text-default-600 bg-background/50 p-3 rounded-lg border border-border/50">
                        <Icon
                          className="inline mr-1"
                          icon="mdi:information-outline"
                        />
                        Your changes will be saved and the project will be
                        updated immediately.
                      </div>

                      {/* Update Button - Moved under editor */}
                      <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 dark:from-orange-500/10 dark:to-red-500/10 rounded-xl p-6 border border-orange-200/50 dark:border-orange-800/50 mt-6">
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                          <div className="text-center">
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                              Ready to Update Your Project?
                            </h3>
                            <p className="text-default-600 text-sm">
                              Review your changes and save your updates
                            </p>
                          </div>
                          <div className="flex gap-3">
                            {submitMessage && (
                              <Badge
                                className={`px-4 py-2 ${
                                  submitMessage.includes("successfully")
                                    ? "bg-green-500/10 text-green-600 border-green-500/20"
                                    : "bg-red-500/10 text-red-600 border-red-500/20"
                                }`}
                              >
                                {submitMessage}
                              </Badge>
                            )}
                            <Button
                              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                              disabled={isSubmitting}
                              size="lg"
                              type="submit"
                            >
                              {isSubmitting ? (
                                <>
                                  <Spinner className="mr-2" size="sm" />
                                  Updating Project...
                                </>
                              ) : (
                                <>
                                  <Icon
                                    className="mr-2"
                                    icon="mdi:content-save"
                                  />
                                  Update Project
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default EditProjectPage;
