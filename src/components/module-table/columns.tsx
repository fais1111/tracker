"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableRowActions } from "./data-table-row-actions";
import type { Module } from "@/lib/types";

export const columns: ColumnDef<Module>[] = [
  {
    accessorKey: "moduleNo",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Module No.
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2 font-medium">
          <span>{row.getValue("moduleNo")}</span>
        </div>
      );
    },
    size: 200,
  },
  {
    accessorKey: "yard",
    header: "Yard",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    size: 100,
  },
  {
    accessorKey: "location",
    header: "Location",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    size: 100,
  },
  {
    accessorKey: "rfloDate",
    header: "RFLO Date",
    cell: ({ row }) => {
      const date = row.getValue("rfloDate");
      if (!date) return <span className="text-muted-foreground">N/A</span>;
      try {
        const d = new Date(date as string);
        const utcDate = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1);
        return <span>{format(utcDate, "dd-MMM-yy")}</span>;
      } catch (e) {
        return <span className="text-destructive">Invalid Date</span>
      }
    },
    size: 120,
  },
  {
    accessorKey: "shipmentNo",
    header: "Shipment No#",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    size: 150,
  },
  {
    accessorKey: "rfloDateStatus",
    header: "RFLO Status",
    cell: ({ row }) => {
      const status = row.getValue("rfloDateStatus") as Module["rfloDateStatus"];
      const variant: "default" | "secondary" | "outline" =
        status === "Date Confirmed" ? "default" : status === "1st Quarter-2026" ? "secondary" : "outline";
      return <Badge variant={variant}>{status}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    size: 150,
  },
  {
    accessorKey: "yardReport",
    header: "Yard Report",
    cell: ({ row }) => {
      const report: string = row.getValue("yardReport");
      return <div className="truncate max-w-[250px]">{report || "-"}</div>
    },
    size: 250,
  },
  {
    accessorKey: "islandReport",
    header: "Island Report",
    cell: ({ row }) => {
      const report: string = row.getValue("islandReport");
      return <div className="truncate max-w-[250px]">{report || "-"}</div>
    },
    size: 250,
  },
  {
    id: "combinedReport",
    header: "Combined Report",
    cell: ({ row }) => {
      const yardReport = row.original.yardReport;
      const islandReport = row.original.islandReport;
      const combined = [yardReport, islandReport].filter(Boolean).join(" | ");
      return <div className="truncate max-w-[300px]">{combined || "-"}</div>;
    },
    size: 300,
  },
  {
    accessorKey: 'signedReport',
    header: 'Signed Report',
    cell: function Cell({ row }) {
      const module = row.original;
      return (
        <Checkbox
          checked={!!module.signedReport}
          aria-label="Signed report"
          disabled 
        />
      );
    },
    size: 100,
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
    size: 50,
    enableHiding: false,
  },
];
