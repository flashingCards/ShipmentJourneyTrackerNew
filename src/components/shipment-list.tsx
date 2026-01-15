'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Accordion } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { RefreshCw, Inbox } from 'lucide-react';
import { refreshData } from '@/app/actions';
import type { Shipment } from '@/lib/types';
import { ShipmentCard } from '@/components/shipment-card';

export function ShipmentList({ initialShipments }: { initialShipments: Shipment[] }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRefresh = () => {
    startTransition(() => {
      refreshData().then(() => {
        router.refresh();
      });
    });
  };

  return (
    <div className="w-full">
      <div className="flex justify-end mb-6">
        <Button onClick={handleRefresh} disabled={isPending} variant="outline" className="bg-background">
          <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
          {isPending ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>
      {initialShipments && initialShipments.length > 0 ? (
        <Accordion type="single" collapsible className="w-full space-y-4">
          {initialShipments.map((shipment) => (
            <ShipmentCard key={shipment.scancode} shipment={shipment} />
          ))}
        </Accordion>
      ) : (
        <div className="text-center py-20 border rounded-lg bg-card shadow-sm">
          <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No Shipments Found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Could not retrieve shipment data. Please try refreshing.
          </p>
        </div>
      )}
    </div>
  );
}
