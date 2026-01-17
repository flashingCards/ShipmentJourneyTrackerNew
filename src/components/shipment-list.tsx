'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Accordion } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { RefreshCw, Inbox } from 'lucide-react';
import { refreshData } from '@/app/actions';
import type { Shipment } from '@/lib/types';
import { ShipmentCard } from '@/components/shipment-card';

interface ShipmentListProps {
  groupedShipments: Record<string, Shipment[]>;
  individualShipments: Shipment[];
}

export function ShipmentList({ groupedShipments, individualShipments }: ShipmentListProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRefresh = () => {
    startTransition(() => {
      refreshData().then(() => {
        router.refresh();
      });
    });
  };

  const hasGroupedShipments = Object.keys(groupedShipments).length > 0;
  const hasIndividualShipments = individualShipments.length > 0;

  return (
    <div className="w-full">
      <div className="flex justify-center mb-6">
        <Button onClick={handleRefresh} disabled={isPending} variant="outline" className="bg-background">
          <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
          {isPending ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {!hasGroupedShipments && !hasIndividualShipments ? (
        <div className="text-center py-20 border rounded-lg bg-card shadow-sm">
          <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No Shipments Found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Could not retrieve shipment data. Please try refreshing.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {hasGroupedShipments &&
            Object.entries(groupedShipments).map(([consoleMawb, shipments]) => (
              <div key={consoleMawb}>
                <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-primary/90">
                  Console MAWB: <span className="font-bold text-primary">{consoleMawb}</span>
                </h2>
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {shipments.map((shipment) => (
                    <ShipmentCard key={shipment.scancode} shipment={shipment} />
                  ))}
                </Accordion>
              </div>
            ))}

          {hasIndividualShipments && (
            <div>
              {hasGroupedShipments && (
                <h2 className="text-xl font-semibold mt-12 mb-4 border-b pb-2 text-primary/90">
                  Individual Shipments
                </h2>
              )}
              <Accordion type="single" collapsible className="w-full space-y-4">
                {individualShipments.map((shipment) => (
                  <ShipmentCard key={shipment.scancode} shipment={shipment} />
                ))}
              </Accordion>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
