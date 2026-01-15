import { getShipments } from '@/lib/data';
import { ShipmentList } from '@/components/shipment-list';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Package } from 'lucide-react';

export default async function Home() {
  // We fetch the initial data on the server.
  // The ShipmentList component will handle subsequent refreshes on the client.
  const shipments = await getShipments();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-primary font-headline">
              Shipment Pulse
            </h1>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<ShipmentListSkeleton />}>
          <ShipmentList initialShipments={shipments} />
        </Suspense>
      </main>
    </div>
  );
}

function ShipmentListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <Skeleton className="h-10 w-36" />
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-6 border rounded-lg bg-card">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-3 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="md:col-span-4 space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
              <Skeleton className="h-5 w-full" />
            </div>
            <div className="md:col-span-5 grid grid-cols-4 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
