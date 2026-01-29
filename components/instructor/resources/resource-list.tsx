import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCourses } from "@/lib/hooks/use-courses";
import { useEffect, useState } from "react";
import { Resource } from "@/lib/types/course";
import { fetchResourcesByLessonId, deleteResource } from "@/lib/api/resources";
import { toast } from "react-toastify";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";

export function ResourceList({ lessonId }: { lessonId: string }) {
  const { resources, loadResources, isLoading } = useCourses();
  const [lessonResources, setLessonResources] = useState<Resource[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchResourcesByLessonId(lessonId);
        setLessonResources(data);
      } catch (error) {
        toast.error("Failed to fetch resources");
      }
    };
    fetchData();
  }, [lessonId, loadResources]);

  const handleDelete = async (resourceId: string) => {
    try {
      await deleteResource(resourceId);
      setLessonResources((prev) => prev.filter((r) => r._id !== resourceId));
      toast.success("Resource deleted");
    } catch {
      toast.error("Failed to delete resource");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }
  console.log("Lesson Resources:", lessonResources);

  return (
    <div className="rounded-md border">
      {lessonResources.length === 0 ? (
        <div className="p-2 md:p-4 text-center text-gray-500">
          No resources available for this lesson.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Resource</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size (MB)</TableHead>
              <TableHead>Downloads</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lessonResources.map((resource) => (
              <TableRow key={resource._id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <FileIcon className="h-4 w-4 md:block hidden" />
                    <span className="whitespace-nowrap">{resource.title}</span>
                  </div>
                </TableCell>
                <TableCell className="uppercase text-xs">
                  {resource.resource_type}
                </TableCell>
                <TableCell>
                  {resource.file_size / 1024 / 1024 >= 1024
                    ? (resource.file_size / 1024 / 1024 / 1024).toPrecision(3) +
                      " Gb"
                    : resource.file_size / 1024 >= 1024
                      ? (resource.file_size / 1024 / 1024).toPrecision(3) +
                        " Mb"
                      : resource.file_size >= 1024
                        ? (resource.file_size / 1024).toPrecision(3) + " Kb"
                        : resource.file_size.toPrecision(3) + " B"}
                </TableCell>
                <TableCell>{resource.download_count}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>

                    <DeleteConfirmDialog
                      title="Delete Resource"
                      description="This resource will be permanently deleted. This action cannot be undone."
                      onConfirm={() => handleDelete(resource._id)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
