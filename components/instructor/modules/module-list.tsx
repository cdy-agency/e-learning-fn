"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { LessonList } from "../lessons/lesson-list";
import { useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LessonForm } from "../lessons/lesson-form";

interface Module {
  _id: string;
  title: string;
  description: string;
  order_index: number;
  lessons: any[];
}

export function ModuleList({
  modules,
  courseId,
}: {
  modules: Module[];
  courseId: string;
}) {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full space-y-4"
      value={activeModule || ""}
      onValueChange={(newValue) => setActiveModule(newValue)}
    >
      {modules.map((module) => (
        <AccordionItem
          key={module._id}
          value={module._id}
          className="border rounded-lg p-4"
        >
          <div className="flex md:flex-row flex-col items-start md:items-center justify-start md:justify-between">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-start md:items-center gap-4">
                <div className="flex flex-col gap-5">
                  <h3 className="text-lg text-start font-semibold">{module.title}</h3>
                  <div className="text-sm text-start text-muted-foreground pose">
                    <div dangerouslySetInnerHTML={{ __html: module.description || '' }} />
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <div className="flex md:flex-row flex-col gap-2">
              <Link href={`/instructor/courses/${courseId}/modules/${module._id}/lessons/new`}>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lesson
                </Button>
              </Link>
              
              {/* View Assignments Button */}
              <Link href={`/instructor/assignments/${module._id}`}>
                <Button 
                  variant="outline" 
                  style={{ borderColor: 'green', color: 'blue' }} 
                  size="sm"
                >
                  View Assignments
                </Button>
              </Link>

              {/* Add Assignment Button - Now navigates to a page */}
              <Link href={`/instructor/courses/${courseId}/modules/${module._id}/assignement/new`}>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Assignment
                </Button>
              </Link>
            </div>
          </div>
          <AccordionContent>
            {/* Display lessons only if the module is active */}
            {activeModule === module._id && (
              <div className="mt-4">
                <LessonList lessons={module.lessons} moduleId={module._id} courseId={courseId} />
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}