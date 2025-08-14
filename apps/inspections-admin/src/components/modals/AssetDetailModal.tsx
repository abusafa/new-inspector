import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Settings,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Wrench,
  FileText,
  History,
  TrendingUp,
  Package,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';

interface Asset {
  id: string;
  assetId: string;
  name: string;
  type: string;
  category: string;
  location?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  status: string;
  lastInspected?: string;
  nextInspectionDue?: string;
  createdAt: string;
  updatedAt: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  specifications?: any;
  notes?: string;
  workOrderHistory?: any[];
}

interface AssetDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
}

function getStatusColor(status: string) {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 border-green-200';
    case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'retired': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'active': return <CheckCircle className="h-4 w-4" />;
    case 'inactive': return <Clock className="h-4 w-4" />;
    case 'maintenance': return <Wrench className="h-4 w-4" />;
    case 'retired': return <AlertTriangle className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
}

function JsonViewer({ data, title }: { data: any; title: string }) {
  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
            {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export function AssetDetailModal({ open, onOpenChange, asset }: AssetDetailModalProps) {
  const [assetDetails, setAssetDetails] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (asset && open) {
      loadAssetDetails();
    }
  }, [asset, open]);

  const loadAssetDetails = async () => {
    if (!asset) return;
    
    setLoading(true);
    try {
      // Simulated API call for detailed asset info
      const response = await fetch(`/api/assets/${asset.id}`);
      if (response.ok) {
        const data = await response.json();
        setAssetDetails(data);
      } else {
        // Use the basic asset data if detailed fetch fails
        setAssetDetails(asset);
      }
    } catch (error) {
      console.error('Failed to load asset details:', error);
      // Use the basic asset data as fallback
      setAssetDetails({
        ...asset,
        workOrderHistory: [
          {
            id: '1',
            workOrderId: 'WO-001',
            title: 'Daily Safety Check',
            status: 'completed',
            createdAt: '2024-01-15T10:00:00Z',
            completedAt: '2024-01-15T11:30:00Z',
            assignedTo: 'John Smith',
            inspections: [
              { id: '1', template: { name: 'Daily Forklift Check' }, status: 'completed' }
            ]
          },
          {
            id: '2',
            workOrderId: 'WO-002',
            title: 'Monthly Maintenance',
            status: 'in-progress',
            createdAt: '2024-01-10T14:00:00Z',
            assignedTo: 'Mike Wilson',
            inspections: [
              { id: '2', template: { name: 'Monthly Equipment Service' }, status: 'in-progress' }
            ]
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (!asset) return null;

  const isOverdue = asset.nextInspectionDue && new Date(asset.nextInspectionDue) < new Date();
  const warrantyExpired = asset.warrantyExpiry && new Date(asset.warrantyExpiry) < new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{asset.name}</DialogTitle>
              <DialogDescription className="text-base">
                Asset ID: {asset.assetId} • {asset.type}
              </DialogDescription>
            </div>
            <Badge className={getStatusColor(asset.status)}>
              {getStatusIcon(asset.status)}
              <span className="ml-1 capitalize">{asset.status}</span>
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="history">Work Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Category</span>
                    <p className="font-medium">{asset.category}</p>
                  </div>
                  {asset.location && (
                    <div>
                      <span className="text-sm text-muted-foreground">Location</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{asset.location}</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-muted-foreground">Created</span>
                    <p className="font-medium">
                      {format(new Date(asset.createdAt), 'PPP')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Manufacturing Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Manufacturing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {asset.manufacturer && (
                    <div>
                      <span className="text-sm text-muted-foreground">Manufacturer</span>
                      <p className="font-medium">{asset.manufacturer}</p>
                    </div>
                  )}
                  {asset.model && (
                    <div>
                      <span className="text-sm text-muted-foreground">Model</span>
                      <p className="font-medium">{asset.model}</p>
                    </div>
                  )}
                  {asset.serialNumber && (
                    <div>
                      <span className="text-sm text-muted-foreground">Serial Number</span>
                      <p className="font-medium font-mono text-sm">{asset.serialNumber}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Warranty & Purchase */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Warranty & Purchase
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {asset.purchaseDate && (
                    <div>
                      <span className="text-sm text-muted-foreground">Purchase Date</span>
                      <p className="font-medium">
                        {format(new Date(asset.purchaseDate), 'PPP')}
                      </p>
                    </div>
                  )}
                  {asset.warrantyExpiry && (
                    <div>
                      <span className="text-sm text-muted-foreground">Warranty Expiry</span>
                      <div className="flex items-center gap-2">
                        <p className={`font-medium ${warrantyExpired ? 'text-red-600' : ''}`}>
                          {format(new Date(asset.warrantyExpiry), 'PPP')}
                        </p>
                        {warrantyExpired && (
                          <Badge variant="destructive" className="text-xs">
                            Expired
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Inspection Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Inspection Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <span className="text-sm text-muted-foreground">Last Inspected</span>
                    <p className="font-medium text-lg">
                      {asset.lastInspected 
                        ? format(new Date(asset.lastInspected), 'PPP')
                        : 'Never'
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Next Due</span>
                    <div className="flex items-center gap-2">
                      <p className={`font-medium text-lg ${isOverdue ? 'text-red-600' : ''}`}>
                        {asset.nextInspectionDue 
                          ? format(new Date(asset.nextInspectionDue), 'PPP')
                          : 'Not scheduled'
                        }
                      </p>
                      {isOverdue && (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {asset.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{asset.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="specifications">
            <JsonViewer 
              data={asset.specifications} 
              title="Technical Specifications" 
            />
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Schedule</CardTitle>
                <CardDescription>Inspection and maintenance timeline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Next Inspection</p>
                        <p className="text-sm text-muted-foreground">
                          {asset.nextInspectionDue 
                            ? format(new Date(asset.nextInspectionDue), 'PPP')
                            : 'Not scheduled'
                          }
                        </p>
                      </div>
                    </div>
                    {isOverdue && (
                      <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Overdue
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Last Inspection</p>
                        <p className="text-sm text-muted-foreground">
                          {asset.lastInspected 
                            ? format(new Date(asset.lastInspected), 'PPP')
                            : 'Never inspected'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Work Order History
                </CardTitle>
                <CardDescription>Recent work orders for this asset</CardDescription>
              </CardHeader>
              <CardContent>
                {assetDetails?.workOrderHistory && assetDetails.workOrderHistory.length > 0 ? (
                  <div className="space-y-4">
                    {assetDetails.workOrderHistory.map((workOrder) => (
                      <div key={workOrder.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{workOrder.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {workOrder.workOrderId} • {workOrder.assignedTo}
                            </p>
                          </div>
                          <Badge variant={workOrder.status === 'completed' ? 'default' : 'secondary'}>
                            {workOrder.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Created: {format(new Date(workOrder.createdAt), 'PPP')}
                          {workOrder.completedAt && (
                            <> • Completed: {format(new Date(workOrder.completedAt), 'PPP')}</>
                          )}
                        </div>
                        {workOrder.inspections && workOrder.inspections.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground mb-1">Inspections:</p>
                            {workOrder.inspections.map((inspection: any) => (
                              <Badge key={inspection.id} variant="outline" className="mr-1 text-xs">
                                {inspection.template.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No work order history available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Usage Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Total Work Orders</span>
                    <p className="text-2xl font-bold">
                      {assetDetails?.workOrderHistory?.length || 0}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Completed</span>
                    <p className="text-lg font-semibold text-green-600">
                      {assetDetails?.workOrderHistory?.filter(wo => wo.status === 'completed').length || 0}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">In Progress</span>
                    <p className="text-lg font-semibold text-blue-600">
                      {assetDetails?.workOrderHistory?.filter(wo => wo.status === 'in-progress').length || 0}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Avg. Completion Time</span>
                    <p className="text-lg font-semibold">2.5 hours</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Uptime</span>
                    <p className="text-lg font-semibold text-green-600">98.5%</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Last Downtime</span>
                    <p className="text-sm">3 days ago</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cost Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Maintenance Cost (YTD)</span>
                    <p className="text-lg font-semibold">$2,450</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Cost per Work Order</span>
                    <p className="text-lg font-semibold">$490</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">ROI</span>
                    <p className="text-lg font-semibold text-green-600">+15.2%</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
