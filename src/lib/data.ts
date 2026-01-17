import { Shipment, ShipmentNode } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';


// Column mapping based on user request and CSV file structure.
// Indices are 0-based.
const COLS = {
    SCANCODE: 0, // A
    COMPANY: 1, // B
    ERP_STATUS: 4, // E
    SERVICE_TYPE: 5, // F
    INJECTION_PORT: 8, // I
    COUNTRY: 9, // J

    PICKUP_IDEAL: 39, // AN
    PICKUP_ACTUAL: 40, // AO
    HUB_IDEAL: 41, // AP
    HUB_ACTUAL: 42, // AQ
    ORIGIN_CUSTOMS_IDEAL: 43, // AR
    ORIGIN_CUSTOMS_ACTUAL: 44, // AS
    GATEWAY_IDEAL: 45, // AT
    GATEWAY_ACTUAL: 46, // AU
    LANDED_IDEAL: 47, // AV
    LANDED_ACTUAL: 48, // AW
    DEST_CUSTOMS_IDEAL: 49, // AX
    DEST_CUSTOMS_ACTUAL: 50, // AY
    INJECTED_IDEAL: 51, // AZ
    INJECTED_ACTUAL: 52, // BA
    INTRANSIT_IDEAL: 53, // BB
    INTRANSIT_ACTUAL: 54, // BC
    DELIVERED_IDEAL: 55, // BD
    DELIVERED_ACTUAL: 56, // BE
    OVER_FLAG: 57, // BE is actual delivery. User mentioned BF for over flag. Let's adjust.
    // User mentioned: BF for Over flag, BG for Node Available day, BH for Node Flag.
    // CSV headers are different. Let's trust user's column letters.
    // A=0, ..., Z=25, AA=26, ... AZ=51, BA=52... BF=57, BG=58, BH=59
    BF_OVER_FLAG: 57,
    BG_NODE_AVAILABLE_DAY: 58,
    BH_NODE_FLAG: 59,
    CONSOLE_MAWB: 60, // BI
    DELIVERY_TRACKING_ID: 61, // BJ
    CARRIER_NAME: 62, // BK
    DELIVERED_EXPECTED: 64, // BM
};

const timelineNodesConfig = [
    { name: 'Pickup', ideal: COLS.PICKUP_IDEAL, actual: COLS.PICKUP_ACTUAL },
    { name: 'Shipment Accepted at Hub', ideal: COLS.HUB_IDEAL, actual: COLS.HUB_ACTUAL },
    { name: 'Shipment at Origin Customs', ideal: COLS.ORIGIN_CUSTOMS_IDEAL, actual: COLS.ORIGIN_CUSTOMS_ACTUAL },
    { name: 'Shipment Connected to Gateway Country', ideal: COLS.GATEWAY_IDEAL, actual: COLS.GATEWAY_ACTUAL },
    { name: 'Flight Landed', ideal: COLS.LANDED_IDEAL, actual: COLS.LANDED_ACTUAL },
    { name: 'Shipment Cleared at Destination Customs', ideal: COLS.DEST_CUSTOMS_IDEAL, actual: COLS.DEST_CUSTOMS_ACTUAL },
    { name: 'Shipment Injected', ideal: COLS.INJECTED_IDEAL, actual: COLS.INJECTED_ACTUAL },
    { name: 'Shipment In-Transit', ideal: COLS.INTRANSIT_IDEAL, actual: COLS.INTRANSIT_ACTUAL },
    { name: 'Shipment Delivered', ideal: COLS.DELIVERED_IDEAL, actual: COLS.DELIVERED_ACTUAL },
];

function parseCsv(csvText: string): string[][] {
  const rows = csvText.trim().split('\n');
  return rows.map(row => row.split(',').map(field => field.trim()));
}

export async function getShipments(): Promise<Shipment[]> {
    const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQsgiRSINyq1kprwpooVIbkEDDwghluoUBshcm69Bo4JWj5lsqkvgCqEePlWCqvK4NwXYaqZJGGEUfD/pub?gid=1457513&single=true&output=csv';
    
    try {
        const response = await fetch(url, {
            next: { tags: ['shipments'] },
        });

        if (!response.ok) {
            console.error(`Failed to fetch CSV: ${response.statusText}`);
            return [];
        }

        const csvText = await response.text();
        const rows = parseCsv(csvText).slice(2); // Skip header rows

        const shipments: Shipment[] = rows.map(columns => {
            
            const timeline: ShipmentNode[] = timelineNodesConfig
              .map(node => ({
                  name: node.name,
                  idealDate: columns[node.ideal] || 'N/A',
                  actualDate: columns[node.actual] || 'N/A',
              }))
              // Only include nodes that have at least one date
              .filter(node => (node.idealDate && node.idealDate !== 'N/A') || (node.actualDate && node.actualDate !== 'N/A'));

            return {
                scancode: columns[COLS.SCANCODE] || 'N/A',
                company: columns[COLS.COMPANY] || 'N/A',
                erpStatus: columns[COLS.ERP_STATUS] || 'N/A',
                serviceType: columns[COLS.SERVICE_TYPE] || 'N/A',
                injectionPort: columns[COLS.INJECTION_PORT] || 'N/A',
                country: columns[COLS.COUNTRY] || 'N/A',
                pickupIdealDate: columns[COLS.PICKUP_IDEAL] || 'N/A',
                pickupActualDate: columns[COLS.PICKUP_ACTUAL] || 'N/A',
                connectedToGatewayIdealDate: columns[COLS.GATEWAY_IDEAL] || 'N/A',
                connectedToGatewayActualDate: columns[COLS.GATEWAY_ACTUAL] || 'N/A',
                injectedIdealDate: columns[COLS.INJECTED_IDEAL] || 'N/A',
                injectedActualDate: columns[COLS.INJECTED_ACTUAL] || 'N/A',
                deliveredIdealDate: columns[COLS.DELIVERED_IDEAL] || 'N/A',
                deliveredActualDate: columns[COLS.DELIVERED_ACTUAL] || 'N/A',
                expectedDeliveryDate: columns[COLS.DELIVERED_EXPECTED] || 'N/A',
                overFlag: columns[COLS.BF_OVER_FLAG] || 'N/A',
                nodeAvailableDay: columns[COLS.BG_NODE_AVAILABLE_DAY] || 'N/A',
                nodeFlag: columns[COLS.BH_NODE_FLAG] || 'N/A',
                consoleMawb: columns[COLS.CONSOLE_MAWB] || 'N/A',
                deliveryTrackingId: columns[COLS.DELIVERY_TRACKING_ID] || 'N/A',
                carrierName: columns[COLS.CARRIER_NAME] || 'N/A',
                timeline: timeline
            };
        }).filter(shipment => shipment.scancode && shipment.scancode !== 'N/A');
        
        return shipments;
    } catch (error) {
        console.error("Error fetching or parsing shipment data:", error);
        // In case of error, return an empty array to prevent app crash
        return [];
    }
}
