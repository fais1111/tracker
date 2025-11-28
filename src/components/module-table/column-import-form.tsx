'use client';

import { useTransition } from 'react';
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
import { collection, addDoc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import type { Module } from '@/lib/types';

interface ColumnImportFormProps {
  setOpen: (open: boolean) => void;
}

const columnMapping: { [key: string]: keyof Module } = {
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
    const columnKey = formData.get('column') as keyof typeof columnMapping;
    const data = formData.get('data') as string;
    const lines = data.split('\n').map(line => line.trim()).filter(line => line);

    if (!columnKey || lines.length === 0) {
      toast({
        title: 'Invalid input',
        description: 'Please select a column and paste some data.',
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

        if (targetField === 'moduleNo') {
            // If importing module numbers, assume we are creating new modules
            for (const line of lines) {
                const newModule: Partial<Module> = {
                    moduleNo: line,
                    yard: '',
                    location: '',
                    shipmentDate: '',
                    shipmentNo: '',
                    rfloDateStatus: 'Pending'
                };
                const docRef = addDoc(modulesCollection, newModule);
                // addDoc can't be batched in this way, so we do it individually.
                await addDoc(modulesCollection, newModule);
                createdCount++;
            }
        } else {
            // For other columns, we try to update existing docs based on moduleNo
            // This assumes module numbers already exist. A more robust implementation might be needed.
            const allDocsSnapshot = await getDocs(modulesCollection);
            const existingModules = allDocsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Module }));

            if (lines.length !== existingModules.length && existingModules.length > 0) {
                toast({
                    variant: 'destructive',
                    title: 'Data mismatch',
                    description: `The number of lines pasted (${lines.length}) does not match the number of modules in the database (${existingModules.length}). Please ensure you paste data for all modules.`
                });
                return;
            }

            if (existingModules.length === 0 && lines.length > 0) {
                 for (const line of lines) {
                    const newModule = {
                        [targetField]: line,
                        moduleNo: '', // needs to be filled later
                        yard: '',
                        location: '',
                        shipmentDate: '',
                        shipmentNo: '',
                        rfloDateStatus: 'Pending'
                    };
                    await addDoc(modulesCollection, newModule);
                    createdCount++;
                }
            } else {
                existingModules.forEach((module, index) => {
                    if (lines[index] !== undefined) {
                        const docRef = doc(firestore, 'modules', module.id);
                        batch.update(docRef, { [targetField]: lines[index] });
                        updatedCount++;
                    }
                });
                 await batch.commit();
            }
        }

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
        <Label htmlFor="column">Target Column</Label>
        <Select name="column" required>
          <SelectTrigger id="column">
            <SelectValue placeholder="Select a column to import data into" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(columnMapping).map(key => (
              <SelectItem key={key} value={key}>{key}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="data">Pasted Column Data</Label>
        <Textarea 
          id="data" 
          name="data" 
          required 
          className="min-h-[200px] font-mono text-sm"
          placeholder="Paste your data here, one entry per line."
        />
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
