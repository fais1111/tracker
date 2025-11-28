export type Module = {
  id: string;
  yard: string;
  location: string;
  moduleNo: string;
  shipmentDate: string;
  shipmentNo: string;
  surveyStatusYard: 'Done' | 'Not Done';
  surveyStatusIsland: 'Done' | 'Not Done';
  yardReport: string;
  islandReport: string;
  combinedReport: string;
  signed: string;
};
