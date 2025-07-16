import React, { useState, useMemo } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  FileText,
  Calendar,
  DollarSign,
  User,
  X,
  Save,
  Upload,
  Clipboard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useToast } from "../contexts/ToastContext";
import { useNotifications } from "../contexts/NotificationContext";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  isSameDay,
  parseISO,
} from "date-fns";

export type ProjectStatus =
  | "in_progress"
  | "started"
  | "complete"
  | "incomplete";

export type ProjectPriority = "low" | "medium" | "high" | "urgent";

export type Project = {
  id: string;
  name: string;
  description: string;
  projectFrom: string;
  amount: number;
  files: File[];
  status: ProjectStatus;
  priority: ProjectPriority;
  createdAt: string;
  dueDate?: string;
};

const Board: React.FC = () => {
  const { showToast } = useToast();
  const { addNotification } = useNotifications();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    projectFrom: "",
    amount: "",
    status: "started" as ProjectStatus,
    priority: "medium" as ProjectPriority,
    dueDate: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Calculate week dates
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday start
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i));
    }
    return days;
  }, [weekStart]);

  // Group projects by date
  const projectsByDate = useMemo(() => {
    const grouped: { [key: string]: Project[] } = {};

    projects.forEach((project) => {
      let projectDate;
      try {
        // Handle both ISO date strings and date-only strings
        if (project.dueDate) {
          projectDate = project.dueDate.includes("T")
            ? parseISO(project.dueDate)
            : new Date(project.dueDate + "T00:00:00");
        } else {
          projectDate = project.createdAt.includes("T")
            ? parseISO(project.createdAt)
            : new Date(project.createdAt + "T00:00:00");
        }

        const dateKey = format(projectDate, "yyyy-MM-dd");

        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(project);
      } catch (error) {
        console.error("Error parsing date for project:", project, error);
        // Fallback to today's date if parsing fails
        const dateKey = format(new Date(), "yyyy-MM-dd");
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(project);
      }
    });

    return grouped;
  }, [projects]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      projectFrom: "",
      amount: "",
      status: "started",
      priority: "medium",
      dueDate: "",
    });
    setSelectedFiles([]);
    setShowAddForm(false);
    setEditingProject(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.projectFrom.trim() ||
      !formData.amount
    ) {
      showToast("error", "Please fill in all required fields");
      return;
    }

    const projectData: Project = {
      id: editingProject?.id || Date.now().toString(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      projectFrom: formData.projectFrom.trim(),
      amount: parseFloat(formData.amount),
      files: selectedFiles,
      status: formData.status,
      priority: formData.priority,
      createdAt:
        editingProject?.createdAt || new Date().toISOString().split("T")[0],
      dueDate: formData.dueDate || undefined,
    };

    if (editingProject) {
      const oldProject = projects.find((p) => p.id === editingProject.id);
      setProjects((prev) =>
        prev.map((p) => (p.id === editingProject.id ? projectData : p)),
      );

      // Check if status changed to complete
      if (
        oldProject &&
        oldProject.status !== "complete" &&
        projectData.status === "complete"
      ) {
        addNotification(
          projectData.id,
          projectData.name,
          `Your project "${projectData.name}" has been marked as completed! Click to transfer Rs. ${projectData.amount.toLocaleString()} to your account.`,
        );
      }

      showToast("success", "Project updated successfully");
    } else {
      setProjects((prev) => [...prev, projectData]);
      showToast("success", "Project added successfully");
    }

    resetForm();
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      projectFrom: project.projectFrom,
      amount: project.amount.toString(),
      status: project.status,
      priority: project.priority,
      dueDate: project.dueDate || "",
    });
    setSelectedFiles(project.files);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      showToast("success", "Project deleted successfully");
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case "complete":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "started":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "incomplete":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusLabel = (status: ProjectStatus) => {
    switch (status) {
      case "in_progress":
        return "In Progress";
      case "started":
        return "Started";
      case "complete":
        return "Complete";
      case "incomplete":
        return "Incomplete";
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: ProjectPriority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getPriorityLabel = (priority: ProjectPriority) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeek((prev) => addDays(prev, direction === "next" ? 7 : -7));
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gold font-['DM_Sans']">
          Project Board
        </h1>
        {projects.length > 0 && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Project</span>
          </button>
        )}
      </div>

      {/* Add Project Button for First Project */}
      {projects.length === 0 && !showAddForm && (
        <div className="text-center py-8">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors mx-auto"
          >
            <Plus className="h-5 w-5" />
            <span>Add Your First Project</span>
          </button>
        </div>
      )}

      {/* Calendar Navigation */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateWeek("prev")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>

            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {format(weekStart, "MMM dd")} - {format(weekEnd, "MMM dd, yyyy")}
            </h2>

            <button
              onClick={() => navigateWeek("next")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Add/Edit Project Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingProject ? "Edit Project" : "Add New Project"}
            </h2>
            <button
              onClick={resetForm}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter project name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project From *
                </label>
                <input
                  type="text"
                  value={formData.projectFrom}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      projectFrom: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Client or company name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter project description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount *
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Project amount"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as ProjectStatus,
                    }))
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="started">Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="complete">Complete</option>
                  <option value="incomplete">Incomplete</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      priority: e.target.value as ProjectPriority,
                    }))
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dueDate: e.target.value,
                    }))
                  }
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white [&::-webkit-calendar-picker-indicator]:invert-0 dark:[&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Files
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {selectedFiles.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedFiles.length} file(s) selected
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                <Save className="h-5 w-5" />
                <span>{editingProject ? "Update Project" : "Add Project"}</span>
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
            >
              <div className="text-center">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {format(day, "EEE")}
                </div>
                <div
                  className={`text-lg font-semibold mt-1 ${
                    isSameDay(day, new Date())
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {format(day, "d")}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 min-h-[500px]">
          {weekDays.map((day, index) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayProjects = projectsByDate[dateKey] || [];

            return (
              <div
                key={index}
                className="p-3 border-r border-gray-200 dark:border-gray-700 last:border-r-0 min-h-[500px] w-40"
              >
                <div className="space-y-2">
                  {dayProjects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-3 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                          {project.name}
                        </h4>
                        <div className="flex items-center space-x-1 ml-2">
                          <button
                            onClick={() => handleEdit(project)}
                            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(project.id)}
                            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-600 dark:text-gray-300 truncate">
                            {project.projectFrom}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-3 w-3 text-gray-400" />
                          <span className="text-xs font-medium text-gray-900 dark:text-white">
                            Rs. {project.amount.toLocaleString()}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
                            >
                              {getStatusLabel(project.status)}
                            </span>

                            {project.files.length > 0 && (
                              <div className="flex items-center space-x-1">
                                <FileText className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {project.files.length}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}
                            >
                              {getPriorityLabel(project.priority)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {projects.length === 0 && !showAddForm && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Clipboard className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No projects yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Get started by adding your first project to the board.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Your First Project</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Board;
