'use client';

import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createModule, updateModule } from '@/lib/firestore-mutations';
import type { Module } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFirestore } from '@/firebase';

interface ModuleFormProps {
  module?: Module;
  setOpen: (open: boolean) => void;
}

export function ModuleForm({ module, setOpen }: ModuleFormProps) {
  const isEditing = !!module;
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firestore) {
      toast({
        title: 'An error occurred',
        description: 'Firestore is not available. Please try again later.',
        variant: 'destructive',
      });
      return;
    }
    
    const formData = new FormData(event.currentTarget);
    const rawData: any = Object.fromEntries(formData.entries());

    // We don't need the `id` field in the data itself.
    delete rawData.id;

    startTransition(() => {
      try {
        const moduleNo = rawData.moduleNo;
        if (!moduleNo) {
            throw new Error("Module No. is required.");
        }

        if (isEditing && module?.id) {
            // For updates, the ID is the original module number.
            updateModule(firestore, module.id, rawData);
            toast({
                title: 'Module updated successfully.',
            });
        } else {
            // For creation, the data object itself contains the new module number.
            createModule(firestore, rawData);
            toast({
                title: 'Module created successfully.',
            });
        }
        setOpen(false);
      } catch (error) {
        console.error("Failed to save module:", error);
        toast({
          title: 'An error occurred',
          description: error instanceof Error ? error.message : 'Could not save the module. Please try again.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* The ID for an existing module is its moduleNo */}
      {module && <input type="hidden" name="id" value={module.id} />}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="moduleNo">Module No.</Label>
          <Input id="moduleNo" name="moduleNo" defaultValue={module?.moduleNo} required disabled={isEditing} />
        </div>
         <div>
          <Label htmlFor="shipmentDate">Shipment Date</Label>
          <Input id="shipmentDate" name="shipmentDate" defaultValue={module?.shipmentDate} />
        </div>
        <div>
          <Label htmlFor="yard">Yard</Label>
          <Input id="yard" name="yard" defaultValue={module?.yard} />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" defaultValue={module?.location} />
        </div>
        <div>
          <Label htmlFor="shipmentNo">Shipment No#</Label>
          <Input id="shipmentNo" name="shipmentNo" defaultValue={module?.shipmentNo} />
        </div>
        <div>
          <Label htmlFor="rfloDateStatus">RFLO Date Status</Label>
          <Select name="rfloDateStatus" defaultValue={module?.rfloDateStatus || 'Pending'}>
            <SelectTrigger id="rfloDateStatus">
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Date Confirmed">Date Confirmed</SelectItem>
              <SelectItem value="1st Quarter-2026">1st Quarter-2026</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2 border-t pt-4 mt-2">
            <h4 className="text-sm font-medium mb-2">Reports</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="yardReport">Yard Report</Label>
                    <Input id="yardReport" name="yardReport" defaultValue={module?.yardReport} placeholder="Name - YYYY-MM-DD" />
                </div>
                <div>
                    <Label htmlFor="islandReport">Island Report</Label>
                    <Input id="islandReport" name="islandReport" defaultValue={module?.islandReport} placeholder="Name - YYYY-MM-DD" />
                </div>
                <div>
                    <Label htmlFor="combinedReport">Combined Report</Label>
                    <Input id="combinedReport" name="combinedReport" defaultValue={module?.combinedReport} placeholder="Name - YYYY-MM-DD" />
                </div>
                <div>
                    <Label htmlFor="signed">Signed</Label>
                    <Input id="signed" name="signed" defaultValue={module?.signed} placeholder="Name - YYYY-MM-DD" />
                </div>
            </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Save Changes' : 'Create Module'}
        </Button>
      </div>
    </form>
  );
}
