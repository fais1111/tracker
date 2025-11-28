export type Module = {
  id: string;
  yard: string;
  location: string;
  moduleNo: string;
  rfloDate: string;
  shipmentNo: string;
  rfloDateStatus: 'Date Confirmed' | '1st Quarter-2026' | 'Pending';
  yardReport: string;
  islandReport: string;
  signedReport: boolean;
};
