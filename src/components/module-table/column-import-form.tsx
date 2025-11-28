'use client';

import { useTransition } from 'react';
import { doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { collection } from 'firebase/firestore';
import type { Module } from '@/lib/types';
import { Input } from '../ui/input';

interface ColumnImportFormProps {
  setOpen: (open: boolean) => void;
}

// All fields are updatable.
const columnMapping: { [key: string]: keyof Omit<Module, 'id'> } = {
  'Yard': 'yard',
  'Location': 'location',
  'Module No.': 'moduleNo',
  'Shipment Date': 'shipmentDate',
  'Shipment No#': 'shipmentNo',
  'RFLO Date Status': 'rfloDateStatus'
};

export function ColumnImportForm({ setOpen }: ColumnImportFormProps) {
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
    const moduleNosData = formData.get('moduleNos') as string;
    const valuesData = formData.get('values') as string;
    const columnKey = formData.get('column') as keyof typeof columnMapping;

    const moduleNos = moduleNosData.split('\n').map(line => line.trim()).filter(line => line);
    const values = valuesData.split('\n').map(line => line.trim()).filter(line => line);
    
    if (!columnKey || moduleNos.length === 0 || values.length === 0) {
      toast({
        title: 'Invalid input',
        description: 'Please select a column and provide data for both Module No. and the target column.',
        variant: 'destructive',
      });
      return;
    }

    if (moduleNos.length !== values.length) {
        toast({
            title: 'Data mismatch',
            description: 'The number of lines for Module No. and the target column data must be the same.',
            variant: 'destructive',
        });
        return;
    }
    
    const targetField = columnMapping[columnKey];
    
    startTransition(async () => {
      try {
        const modulesCollection = collection(firestore, 'modules');
        const batch = writeBatch(firestore);
        let updatedCount = 0;
        let createdCount = 0;

        for (let i = 0; i < moduleNos.length; i++) {
          const moduleNo = moduleNos[i];
          const value = values[i];
          const docRef = doc(modulesCollection, moduleNo); // Use moduleNo as the document ID
          
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            // Document exists, update it
            batch.update(docRef, { [targetField]: value });
            updatedCount++;
          } else {
            // Document doesn't exist, create it with all fields
            const newModule: Omit<Module, 'id'> = {
                moduleNo: '',
                yard: '',
                location: '',
                shipmentDate: '',
                shipmentNo: '',
                rfloDateStatus: 'Pending'
            };
            
            // Set the fields we know
            newModule.moduleNo = moduleNo;
            newModule[targetField] = value as any; // Cast as any because targetField is dynamic

            batch.set(docRef, newModule);
            createdCount++;
          }
        }
        
        await batch.commit();

        toast({
          title: 'Import Successful',
          description: `Created ${createdCount} and updated ${updatedCount} modules.`,
        });
        setOpen(false);

      } catch (error) {
        console.error("Failed to import data:", error);
        toast({
          title: 'An error occurred',
          description: error instanceof Error ? error.message : 'Could not import the data. Please try again.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="column">Target Column to Update/Create</Label>
        <Select name="column" required>
          <SelectTrigger id="column">
            <SelectValue placeholder="Select a column" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(columnMapping).map(key => (
              <SelectItem key={key} value={key}>{key}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="moduleNos">Module No. (One per line)</Label>
          <Textarea 
            id="moduleNos" 
            name="moduleNos" 
            required 
            className="min-h-[200px] font-mono text-sm"
            placeholder="Paste module numbers here."
          />
        </div>
        <div>
          <Label htmlFor="values">Values for Target Column (One per line)</Label>
          <Textarea 
            id="values" 
            name="values" 
            required 
            className="min-h-[200px] font-mono text-sm"
            placeholder="Paste corresponding values here."
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Import Column
        </Button>
      </div>
    </form>
  );
}
