'use client';

import { Table } from '@tanstack/react-table';
import { FileDown, PlusCircle, FileText, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTableViewOptions } from './data-table-view-options';
import { useState, useRef, useTransition } from 'react';
import { ModuleForm } from './module-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format, isValid, parse } from 'date-fns';
import type { Module } from '@/lib/types';
import { useFirestore } from '@/firebase';
import { createModule } from '@/lib/firestore-mutations';
import { useToast } from '@/hooks/use-toast';
import * as pdfjs from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.entry';

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
      const shipmentDate = module.shipmentDate;
      return [
        module.yard,
        module.location,
        module.moduleNo,
        shipmentDate,
        module.shipmentNo,
        module.rfloDateStatus,
      ];
    });

    autoTable(doc, {
      head: [['Yard', 'Location', 'Module No.', 'Shipment Date', 'Shipment No#', 'RFLO Status']],
      body: tableData,
    });

    doc.save('modules.pdf');
  };

  const handleExportExcel = () => {
    const tableData = table.getFilteredRowModel().rows.map(row => {
      const module = row.original as Module;
      return {
        Yard: module.yard,
        Location: module.location,
        'Module No.': module.moduleNo,
        'Shipment Date': module.shipmentDate,
        'Shipment No#': module.shipmentNo,
        'RFLO Status': module.rfloDateStatus,
      };
    });

    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Modules');
    XLSX.writeFile(wb, 'modules.xlsx');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !firestore) return;

    if (file.type === 'application/pdf') {
      handlePdfImport(file);
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please upload a PDF file.',
      });
    }
  };

  const handlePdfImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      startTransition(async () => {
        try {
          const typedarray = new Uint8Array(e.target?.result as ArrayBuffer);
          const pdf = await pdfjs.getDocument(typedarray).promise;
          let importedCount = 0;

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const text = textContent.items.map((s: any) => s.str).join(' ');
            
            // This is a simplified regex and may need adjustment for your specific PDF layout
            const rows = text.match(/.+/g) || [];

            for (const rowText of rows) {
               // Simple split by multiple spaces, assuming columns are well-separated
               const columns = rowText.split(/\s{2,}/).map(s => s.trim());
               if (columns.length >= 5) { // Check for minimum number of columns
                const newModule: Omit<Module, 'id'> = {
                    yard: columns[0] || '',
                    location: columns[1] || '',
                    moduleNo: columns[2] || '',
                    shipmentDate: columns[3] || '',
                    shipmentNo: columns[4] || '',
                    rfloDateStatus: columns[5] || 'Pending',
                };
                // Basic validation to skip header rows
                if (newModule.moduleNo && newModule.moduleNo.toLowerCase() !== 'module no.') {
                  await createModule(firestore, newModule);
                  importedCount++;
                }
              }
            }
          }

          if (importedCount > 0) {
            toast({
              title: 'Import Successful',
              description: `Successfully imported ${importedCount} modules from the PDF.`,
            });
          } else {
            toast({
              variant: 'destructive',
              title: 'Import Failed',
              description: 'Could not find any valid module data in the PDF. Please check the file format.',
            });
          }

        } catch (error) {
          console.error('PDF Import failed:', error);
          toast({
            variant: 'destructive',
            title: 'Import Failed',
            description: error instanceof Error ? error.message : 'An unexpected error occurred during PDF import.',
          });
        } finally {
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      });
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter by Module No..."
          value={(table.getColumn('moduleNo')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('moduleNo')?.setFilterValue(event.target.value)
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
          accept=".pdf"
        />
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isPending}>
          <FileDown className="mr-2 h-4 w-4" />
          Import PDF
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
