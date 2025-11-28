"use client";

import { Table } from "@tanstack/react-table";
import { FileDown, PlusCircle, FileText, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { useState, useRef, useTransition } from "react";
import { ModuleForm } from "./module-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { format, isValid } from "date-fns";
import type { Module } from "@/lib/types";
import { useFirestore } from "@/firebase";
import { createModule } from "@/lib/firestore-mutations";
import { useToast } from "@/hooks/use-toast";


interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();


  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableData = table.getFilteredRowModel().rows.map(row => {
        const module = row.original as Module;
        const shipmentDate = module.shipmentDate ? new Date(module.shipmentDate) : null;
        return [
            module.yard,
            module.location,
            module.moduleNo,
            shipmentDate && isValid(shipmentDate) ? format(shipmentDate, "dd-MMM-yy") : "N/A",
            module.shipmentNo,
            module.rfloDateStatus,
        ];
    });

    autoTable(doc, {
      head: [['Yard', 'Location', 'Module No.', 'Shipment Date', 'Shipment No#', 'RFLO Status']],
      body: tableData,
    });
    
    doc.save("modules.pdf");
  };

  const handleExportExcel = () => {
    const tableData = table.getFilteredRowModel().rows.map(row => {
        const module = row.original as Module;
        const shipmentDate = module.shipmentDate ? new Date(module.shipmentDate) : null;
        return {
            'Yard': module.yard,
            'Location': module.location,
            'Module No.': module.moduleNo,
            'Shipment Date': shipmentDate && isValid(shipmentDate) ? format(shipmentDate, "dd-MMM-yy") : "N/A",
            'Shipment No#': module.shipmentNo,
            'RFLO Status': module.rfloDateStatus,
        };
    });

    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Modules");
    XLSX.writeFile(wb, "modules.xlsx");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !firestore) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        startTransition(async () => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: any[] = XLSX.utils.sheet_to_json(worksheet);

                if (json.length === 0) {
                    toast({
                        variant: "destructive",
                        title: "Import Error",
                        description: "The selected Excel file is empty.",
                    });
                    return;
                }

                let importedCount = 0;
                for (const row of json) {
                    const parseDate = (excelDate: any) => {
                      if (!excelDate) return '';
                      // Check if it's an Excel date serial number
                      if (typeof excelDate === 'number') {
                        // Formula to convert Excel serial date to JS Date object
                        const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
                        return date.toISOString().split('T')[0]; // Format to YYYY-MM-DD
                      }
                      // Check if it's a date string
                      if (typeof excelDate === 'string') {
                        const date = new Date(excelDate);
                        if (isValid(date)) {
                          return date.toISOString().split('T')[0];
                        }
                      }
                      return ''; // Return empty for invalid formats
                    }
                    
                    const shipmentDate = parseDate(row['Shipment Date'] || row['SHIPMENT DATE']);

                    const newModule: Omit<Module, 'id'> = {
                        yard: row['Yard'] || '',
                        location: row['Location'] || row['LOCATION'] || '',
                        moduleNo: row['Module No.'] || '',
                        shipmentDate: shipmentDate,
                        shipmentNo: row['Shipment No#'] || '',
                        rfloDateStatus: row['RFLO Date Status'] || row['RFLO Date StatuS'] || 'Pending',
                    };

                    await createModule(firestore, newModule);
                    importedCount++;
                }

                toast({
                    title: "Import Successful",
                    description: `Successfully imported ${importedCount} modules.`,
                });

            } catch (error) {
                console.error("Import failed:", error);
                toast({
                    variant: "destructive",
                    title: "Import Failed",
                    description: error instanceof Error ? error.message : "An unexpected error occurred during import.",
                });
            } finally {
                // Reset file input to allow re-uploading the same file
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        });
    };
    reader.readAsArrayBuffer(file);
  }

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
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".xlsx, .xls"
        />
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isPending}>
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
