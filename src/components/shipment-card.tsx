import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import type { Shipment, ShipmentNode as ShipmentNodeType } from '@/lib/types';
import { Calendar, Clock, CheckCircle, XCircle, Anchor, MapPin, Truck, Package, Plane, Building2, ShieldCheck, Shield, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CommentBox } from '@/components/comment-box';

const StatusIndicator = ({ status }: { status: string }) => {
  if (!status || status === 'N/A') return <span className="text-sm text-muted-foreground">N/A</span>;
  const isRed = status.toLowerCase() === 'red';
  return (
    <div className="flex items-center gap-2">
      <span className={cn('h-3 w-3 rounded-full shrink-0', isRed ? 'bg-destructive' : 'bg-chart-2')}></span>
      <span className={cn('font-semibold', isRed ? 'text-destructive' : 'text-chart-2')}>
        {status}
      </span>
    </div>
  );
};

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) => (
  <div className="flex items-start text-sm">
    <Icon className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground shrink-0" />
    <div className="flex flex-wrap items-baseline">
      <span className="font-medium text-muted-foreground mr-1.5">{label}:</span> 
      <span className="text-foreground">{value || 'N/A'}</span>
    </div>
  </div>
);

const DateItem = ({ label, ideal, actual, forceIdeal }: { label: string, ideal: string, actual: string, forceIdeal?: boolean }) => {
    const isDelayed = actual && actual !== 'N/A' && ideal && ideal !== 'N/A' && new Date(actual) > new Date(ideal);

    if (forceIdeal) {
      return (
        <div className="flex flex-col p-2 rounded-md bg-muted/50">
            <p className="text-xs text-muted-foreground font-semibold">{label}</p>
            <div className="mt-1">
                <p className="text-xs text-muted-foreground/80">Ideal</p>
                <p className="text-sm font-bold text-foreground">{ideal || 'N/A'}</p>
            </div>
        </div>
      )
    }
    
    return (
        <div className="flex flex-col p-2 rounded-md bg-muted/50">
            <p className="text-xs text-muted-foreground font-semibold flex justify-between items-center">
              <span>{label}</span>
              {isDelayed && <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">Delayed</Badge>}
            </p>
            <div className="mt-1">
                <p className="text-xs text-muted-foreground/80">Ideal</p>
                <p className="text-sm font-medium text-foreground">{ideal || 'N/A'}</p>
            </div>
            <div className="mt-1.5">
                <p className="text-xs text-muted-foreground/80">Actual</p>
                <p className={cn("text-sm font-bold", isDelayed ? 'text-destructive' : 'text-chart-2')}>{actual || 'N/A'}</p>
            </div>
        </div>
    );
};

export function ShipmentCard({ shipment }: { shipment: Shipment }) {
  const timelineWithoutDelivered = shipment.timeline.filter(node => node.name !== 'Shipment Delivered');
  
  return (
    <AccordionItem value={shipment.scancode} className="border-none">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl focus-within:shadow-xl data-[state=open]:shadow-xl">
        <AccordionTrigger className="p-4 hover:no-underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg group">
          <div className="w-full text-left">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-4 items-start w-full">
              <div className="md:col-span-3">
                <p className="text-sm text-muted-foreground">Scancode</p>
                <p className="font-bold text-lg text-primary group-hover:text-accent transition-colors">{shipment.scancode}</p>
                <p className="text-sm font-medium text-foreground">{shipment.company}</p>
              </div>

              <div className="md:col-span-4 space-y-2.5">
                <DetailItem icon={Package} label="Service" value={shipment.serviceType} />
                <DetailItem icon={Building2} label="ERP Status" value={shipment.erpStatus} />
                <DetailItem icon={MapPin} label="Country" value={shipment.country} />
                <DetailItem icon={Anchor} label="Injection Port" value={shipment.injectionPort} />
                <DetailItem icon={Calendar} label="Node Avail. Day" value={shipment.nodeAvailableDay} />
                 <div className="flex items-start gap-4 pt-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-muted-foreground w-16">Overall:</span>
                      <StatusIndicator status={shipment.overFlag} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-muted-foreground w-16">Node:</span>
                      <StatusIndicator status={shipment.nodeFlag} />
                    </div>
                </div>
              </div>

              <div className="md:col-span-5 grid grid-cols-2 lg:grid-cols-4 gap-2">
                <DateItem label="Pickup" ideal={shipment.pickupIdealDate} actual={shipment.pickupActualDate} />
                <DateItem label="Gateway" ideal={shipment.connectedToGatewayIdealDate} actual={shipment.connectedToGatewayActualDate} />
                <DateItem label="Injected" ideal={shipment.injectedIdealDate} actual={shipment.injectedActualDate} />
                <DateItem label="Delivered" ideal={shipment.deliveredIdealDate} actual={shipment.deliveredActualDate} forceIdeal={true} />
              </div>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="p-6 bg-muted/30 border-t">
            <h3 className="text-lg font-semibold mb-6 text-primary font-headline">Shipment Timeline</h3>
            <div className="relative pl-4">
              <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-border -translate-x-1/2"></div>
              {timelineWithoutDelivered.length > 0 ? (
                timelineWithoutDelivered.map((node, index) => (
                  <TimelineNode key={index} shipmentScancode={shipment.scancode} node={node} isLast={index === timelineWithoutDelivered.length - 1} />
                ))
              ) : (
                <p className="text-muted-foreground">No timeline data available for this shipment.</p>
              )}
            </div>
          </div>
        </AccordionContent>
      </Card>
    </AccordionItem>
  );
}

const timelineIcons: { [key: string]: React.ElementType } = {
  'Pickup': Truck,
  'Shipment Accepted at Hub': Building2,
  'Shipment at Origin Customs': Shield,
  'Shipment Connected to Gateway Country': Plane,
  'Flight Landed': Plane,
  'Shipment Cleared at Destination Customs': ShieldCheck,
  'Shipment Injected': Anchor,
  'Shipment In-Transit': Truck,
  'Shipment Delivered': Home,
}

const TimelineNode = ({ node, isLast, shipmentScancode }: { node: ShipmentNodeType, isLast: boolean, shipmentScancode: string }) => {
    const hasActual = node.actualDate && node.actualDate !== 'N/A';
    const isDelayed = hasActual && node.idealDate && node.idealDate !== 'N/A' && new Date(node.actualDate) > new Date(node.idealDate);
    const NodeIcon = timelineIcons[node.name] || Package;

    return (
        <div className={cn('flex gap-4 items-start', !isLast ? 'pb-8' : '')}>
            <div className="relative z-10 flex items-center justify-center bg-background rounded-full h-8 w-8 ring-4 ring-background shrink-0">
                <div className="relative h-6 w-6 flex items-center justify-center">
                    <NodeIcon className={cn("h-5 w-5", hasActual ? "text-primary" : "text-muted-foreground")} />
                </div>
            </div>
            <div className="flex-1 pt-1">
                <div className="font-semibold text-foreground flex items-center gap-2">
                    {node.name}
                    {hasActual && (isDelayed ? <Badge variant="destructive">Delayed</Badge> : <Badge className="bg-chart-2 text-primary-foreground hover:bg-chart-2/90">On Time</Badge>)}
                </div>
                <div className="flex flex-col sm:flex-row sm:gap-6 text-sm mt-1">
                    <p className="text-muted-foreground">
                        <span className="font-medium">Ideal:</span> {node.idealDate}
                    </p>
                    <p className={hasActual ? (isDelayed ? 'text-destructive' : 'text-chart-2') : 'text-muted-foreground'}>
                        <span className="font-medium">Actual:</span> {node.actualDate}
                    </p>
                </div>
                <CommentBox shipmentScancode={shipmentScancode} nodeName={node.name} />
            </div>
        </div>
    );
}
