"use client";

import { Table } from "@tanstack/react-table";
import { FileDown, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { DataTableViewOptions } from "./data-table-view-options";
import { useState } from "react";
import { ModuleForm } from "./module-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter by Module No..."
          value={(table.getColumn("moduleNo")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("moduleNo")?.setFilterValue(event.target.value)
          }
          className="h-10 w-[150px] lg:w-[250px]"
        />
        {/* Add more filters here if needed */}
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm">
          <FileDown className="mr-2 h-4 w-4" />
          Import
        </Button>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Module
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Module</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new module to the database.
              </DialogDescription>
            </DialogHeader>
            <ModuleForm setOpen={setIsCreateOpen} />
          </DialogContent>
        </Dialog>
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
