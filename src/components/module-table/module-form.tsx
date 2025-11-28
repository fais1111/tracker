"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { addModule, updateModule } from "@/lib/actions";
import type { Module } from "@/lib/types";

const formSchema = z.object({
  yard: z.string().min(1, "Yard is required."),
  location: z.string().min(1, "Location is required."),
  moduleNo: z.string().min(1, "Module No. is required."),
  rfloDate: z.string().optional(),
  shipmentNo: z.string().optional(),
  rfloDateStatus: z.enum(["Date Confirmed", "1st Quarter-2026", "Pending"]),
  yardReport: z.string().optional(),
  islandReport: z.string().optional(),
  byWhom: z.string().optional(),
});

type ModuleFormValues = z.infer<typeof formSchema>;

interface ModuleFormProps {
  module?: Module;
  setOpen: (open: boolean) => void;
}

export function ModuleForm({ module, setOpen }: ModuleFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ModuleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      yard: module?.yard || "",
      location: module?.location || "",
      moduleNo: module?.moduleNo || "",
      rfloDate: module?.rfloDate || "",
      shipmentNo: module?.shipmentNo || "",
      rfloDateStatus: module?.rfloDateStatus || "Pending",
      yardReport: module?.yardReport || "",
      islandReport: module?.islandReport || "",
      byWhom: module?.byWhom || "",
    },
  });

  const onSubmit = (values: ModuleFormValues) => {
    startTransition(async () => {
      const result = module
        ? await updateModule({ id: module.id, ...values })
        : await addModule(values);

      if (result.success) {
        setOpen(false);
        toast({
          title: `Module ${module ? "updated" : "added"} successfully.`,
        });
      } else {
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="moduleNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Module No.</FormLabel>
                <FormControl>
                  <Input placeholder="GH5100-PAR-11" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rfloDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RFLO Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="yard"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Yard</FormLabel>
                <FormControl>
                  <Input placeholder="TCNMK" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="GOP" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="shipmentNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shipment No#</FormLabel>
                <FormControl>
                  <Input placeholder="Ship #1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rfloDateStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RFLO Date Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Date Confirmed">Date Confirmed</SelectItem>
                    <SelectItem value="1st Quarter-2026">1st Quarter-2026</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="yardReport"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Yard Report</FormLabel>
              <FormControl>
                <Textarea placeholder="Add progress notes for the yard..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="islandReport"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Island Report</FormLabel>
              <FormControl>
                <Textarea placeholder="Add progress notes for the island..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={form.control}
            name="byWhom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Updated By</FormLabel>
                <FormControl>
                  <Input placeholder="User name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {module ? "Save Changes" : "Create Module"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
