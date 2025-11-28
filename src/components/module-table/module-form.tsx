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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
    
    // Convert checkbox value correctly
    rawData.signedReport = formData.get('signedReport') === 'on';

    // RFLO Date can be empty, ensure it's a string
    if (!rawData.rfloDate) {
      rawData.rfloDate = '';
    }
    
    // Shipment Date can be empty, ensure it's a string
    if (!rawData.shipmentDate) {
      rawData.shipmentDate = '';
    }

    startTransition(async () => {
      try {
        if (isEditing && module?.id) {
            await updateModule(firestore, module.id, rawData);
            toast({
                title: 'Module updated successfully.',
            });
        } else {
            await createModule(firestore, rawData);
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
      {module && <input type="hidden" name="id" value={module.id} />}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="moduleNo">Module No.</Label>
          <Input id="moduleNo" name="moduleNo" defaultValue={module?.moduleNo} required />
        </div>
         <div>
          <Label htmlFor="shipmentDate">Shipment Date</Label>
          <Input id="shipmentDate" name="shipmentDate" type="date" defaultValue={module?.shipmentDate} />
        </div>
        <div>
          <Label htmlFor="rfloDate">RFLO Date</Label>
          <Input id="rfloDate" name="rfloDate" type="date" defaultValue={module?.rfloDate} />
        </div>
        <div>
          <Label htmlFor="yard">Yard</Label>
          <Input id="yard" name="yard" defaultValue={module?.yard} required />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" defaultValue={module?.location} required />
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
      </div>
      
      <div>
        <Label htmlFor="yardReport">Yard Report</Label>
        <Textarea id="yardReport" name="yardReport" defaultValue={module?.yardReport || ''} />
      </div>
      <div>
        <Label htmlFor="islandReport">Island Report</Label>
        <Textarea id="islandReport" name="islandReport" defaultValue={module?.islandReport || ''} />
      </div>

      <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
        <Checkbox id="signedReport" name="signedReport" defaultChecked={module?.signedReport} />
        <div className="space-y-1 leading-none">
          <Label htmlFor="signedReport">Signed Report</Label>
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
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
