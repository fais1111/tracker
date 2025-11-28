import { getModules } from "@/lib/actions";
import { columns } from "@/components/module-table/columns";
import { DataTable } from "@/components/module-table/data-table";

export default async function DashboardPage() {
  const data = await getModules();

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
