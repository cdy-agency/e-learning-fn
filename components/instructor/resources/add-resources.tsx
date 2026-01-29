'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { uploadResource } from '@/lib/api/resources'
import { toast } from 'react-toastify'
import { formSchema } from '@/types/schemas/file.schema'


export const AddResourceForm = ({ lessonId, onSuccess }: { lessonId: string, onSuccess: () => void })=> {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      resource_type: "pdf",
    },
  })

  const onSubmit = async(values: z.infer<typeof formSchema>) =>{
    setIsLoading(true)
    const formData = new FormData()
    formData.append('title', values.title)
    formData.append('resource_type', values.resource_type)
    formData.append('file', values.file)
    formData.append('lesson_id', lessonId)

    try {
      console.log('Submitting form with values:', values)
      console.log('Lesson ID:', lessonId)
      console.log('File:', values.file)
      console.log('Resource Type:', values.resource_type)
      console.log('Title:', values.title)
      const response = await uploadResource(lessonId, values.title, values.resource_type, values.file)
      toast.success(response.message || 'Resource added')
      onSuccess()
      form.reset()
    } catch (error) {
      toast.error('failed to add resources')

      console.error('Error creating resource:', error)
     
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter resource title" {...field} />
              </FormControl>
              <FormDescription>
                This is the title of your resource.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="resource_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resource Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a resource type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="doc">Document</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Select the type of resource you&apos;re uploading.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>File</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  onChange={(e) => field.onChange(e.target.files?.[0])}
                />
              </FormControl>
              <FormDescription>
                Upload your resource file here.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className='bg-blue-700 text-white'>
          {isLoading ? "Adding..." : "Add Resource"}
        </Button>
      </form>
    </Form>
  )
}