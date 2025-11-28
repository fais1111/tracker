"use client";

import { Table } from "@tanstack/react-table";
import { FileDown, PlusCircle, FileText, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { useState } from "react";
import { ModuleForm } from "./module-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import type { Module } from "@/lib/types";


interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableData = table.getFilteredRowModel().rows.map(row => {
        const module = row.original as Module;
        return [
            module.moduleNo,
            module.yard,
            module.location,
            module.rfloDate ? format(new Date(module.rfloDate), "dd-MMM-yy") : "N/A",
            module.shipmentNo,
            module.rfloDateStatus,
            module.yardReport,
            module.islandReport,
            module.signedReport ? "Yes" : "No"
        ];
    });

    autoTable(doc, {
      head: [['Module No.', 'Yard', 'Location', 'RFLO Date', 'Shipment No#', 'RFLO Status', 'Yard Report', 'Island Report', 'Signed']],
      body: tableData,
    });
    
    doc.save("modules.pdf");
  };

  const handleExportExcel = () => {
    const tableData = table.getFilteredRowModel().rows.map(row => {
        const module = row.original as Module;
        return {
            'Module No.': module.moduleNo,
            'Yard': module.yard,
            'Location': module.location,
            'RFLO Date': module.rfloDate ? format(new Date(module.rfloDate), "dd-MMM-yy") : "N/A",
            'Shipment No#': module.shipmentNo,
            'RFLO Status': module.rfloDateStatus,
            'Yard Report': module.yardReport,
            'Island Report': module.islandReport,
            'Signed Report': module.signedReport ? "Yes" : "No"
        };
    });

    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Modules");
    XLSX.writeFile(wb, "modules.xlsx");
  };

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
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={handleExportPDF}>
          <FileText className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportExcel}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export Excel
        </Button>
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
