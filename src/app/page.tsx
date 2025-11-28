'use client';
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { columns } from "@/components/module-table/columns";
import { DataTable } from "@/components/module-table/data-table";
import { collection, query, orderBy } from "firebase/firestore";
import type { Module } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const firestore = useFirestore();
  
  const modulesCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "modules");
  }, [firestore]);

  const modulesQuery = useMemoFirebase(() => {
    if (!modulesCollectionRef) return null;
    return query(modulesCollectionRef, orderBy("moduleNo"));
  }, [modulesCollectionRef]);
  
  const { data: modules, isLoading } = useCollection<Module>(modulesQuery);

  if (isLoading || !modules) {
    return (
      <div className="container mx-auto py-10">
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={modules} />
    </div>
  );
}
