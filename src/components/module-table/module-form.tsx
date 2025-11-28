'use client';

import { useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveModule } from '@/lib/actions';
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

interface ModuleFormProps {
  module?: Module;
  setOpen: (open: boolean) => void;
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isEditing ? 'Save Changes' : 'Create Module'}
    </Button>
  );
}

export function ModuleForm({ module, setOpen }: ModuleFormProps) {
  const initialState = { success: false, errors: [] };
  const [state, dispatch] = useActionState(saveModule, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.success) {
      toast({
        title: `Module ${module ? 'updated' : 'created'} successfully.`,
      });
      setOpen(false);
    } else if (state.errors && state.errors.length > 0) {
      const formError = state.errors.find(e => e.path?.[0] === 'form');
      if (formError) {
         toast({
          title: 'An error occurred',
          description: formError.message,
          variant: 'destructive',
        });
      }
    }
  }, [state, module, setOpen, toast]);

  const findError = (path: string) => state.errors?.find(e => e.path?.[0] === path)?.message;

  return (
    <form action={dispatch} className="space-y-4">
      {module && <input type="hidden" name="id" value={module.id} />}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="moduleNo">Module No.</Label>
          <Input id="moduleNo" name="moduleNo" defaultValue={module?.moduleNo} />
          {findError('moduleNo') && <p className="text-sm text-destructive mt-1">{findError('moduleNo')}</p>}
        </div>
        <div>
          <Label htmlFor="rfloDate">RFLO Date</Label>
          <Input id="rfloDate" name="rfloDate" type="date" defaultValue={module?.rfloDate} />
        </div>
        <div>
          <Label htmlFor="yard">Yard</Label>
          <Input id="yard" name="yard" defaultValue={module?.yard} />
          {findError('yard') && <p className="text-sm text-destructive mt-1">{findError('yard')}</p>}
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" defaultValue={module?.location} />
          {findError('location') && <p className="text-sm text-destructive mt-1">{findError('location')}</p>}
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
        <Textarea id="yardReport" name="yardReport" defaultValue={module?.yardReport} />
      </div>
      <div>
        <Label htmlFor="islandReport">Island Report</Label>
        <Textarea id="islandReport" name="islandReport" defaultValue={module?.islandReport} />
      </div>

      <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
        <Checkbox id="signedReport" name="signedReport" defaultChecked={module?.signedReport} />
        <div className="space-y-1 leading-none">
          <Label htmlFor="signedReport">Signed Report</Label>
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <SubmitButton isEditing={!!module} />
      </div>
    </form>
  );
}
