export type Module = {
  id: string;
  yard: string;
  location: string;
  moduleNo: string;
  shipmentDate: string; // New field
  rfloDate: string;
  shipmentNo: string;
  rfloDateStatus: 'Date Confirmed' | '1st Quarter-2026' | 'Pending';
  yardReport: string;
  islandReport: string;
  signedReport: boolean;
};
