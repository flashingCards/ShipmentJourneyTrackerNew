export type ShipmentNode = {
  name: string;
  idealDate: string;
  actualDate: string;
};

export type Shipment = {
  scancode: string;
  company: string;
  erpStatus: string;
  serviceType: string;
  injectionPort: string;
  country: string;
  
  pickupIdealDate: string;
  pickupActualDate: string;
  
  connectedToGatewayIdealDate: string;
  connectedToGatewayActualDate: string;

  injectedIdealDate: string;
  injectedActualDate: string;

  deliveredIdealDate: string;
  deliveredActualDate: string;

  overFlag: string;
  nodeAvailableDay: string;
  nodeFlag: string;

  timeline: ShipmentNode[];
};

export interface NodeComment {
  id: string;
  authorName: string;
  message: string;
  createdAt: any; // Using `any` for Firebase Timestamp flexibility
  nodeName: string;
}
