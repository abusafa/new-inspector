import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatDateTime } from '@/lib/utils';
import type { Inspection } from '@/lib/api';
import { 
  FileText, 
  Calendar, 
  User, 
  MapPin, 
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Download,
  Copy,
  ExternalLink
} from 'lucide-react';

interface InspectionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inspection: Inspection | null;
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'in-progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'not-started':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function getStatusIcon(status: string) {
  switch (status.toLowerCase()) {
    case 'completed':
      return CheckCircle2;
    case 'in-progress':
      return Clock;
    default:
      return AlertCircle;
  }
}

function JsonViewer({ data, title }: { data: any; title: string }) {
  if (!data) {
    return (
      <div className="text-sm text-muted-foreground italic">
        No {title.toLowerCase()} data available
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">{title}</h4>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Copy className="h-3 w-3 mr-1" />
            Copy
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
        </div>
      </div>
      <div className="bg-muted p-3 rounded-md">
        <pre className="text-xs overflow-x-auto max-h-40">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export function InspectionDetailModal({ open, onOpenChange, inspection }: InspectionDetailModalProps) {
  if (!inspection) return null;

  const StatusIcon = getStatusIcon(inspection.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Inspection Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">
                  {inspection.inspectionId}
                </h3>
                <Badge className={getStatusColor(inspection.status)}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {inspection.status.replace('-', ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Order: {inspection.order}</span>
                <span>•</span>
                <span>
                  {inspection.required ? (
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Optional</Badge>
                  )}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in App
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <Separator />

          {/* Key Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-mono">{inspection.inspectionId}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Work Order:</span>
                  <span className="font-mono">{inspection.workOrderId}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Template:</span>
                  <span className="font-mono">{inspection.templateId}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Completed:</span>
                  <span>
                    {inspection.completedAt 
                      ? formatDateTime(inspection.completedAt)
                      : 'Not completed'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Related Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {inspection.template && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Template:</span>
                      <span className="font-medium">{inspection.template.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground pl-6">
                      {inspection.template.description}
                    </div>
                  </div>
                )}
                
                {inspection.workOrder && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Work Order:</span>
                      <span className="font-medium">{inspection.workOrder.title}</span>
                    </div>
                    <div className="text-xs text-muted-foreground pl-6">
                      Assigned to: {inspection.workOrder.assignedTo}
                    </div>
                    {inspection.workOrder.location && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground pl-6">
                        <MapPin className="h-3 w-3" />
                        <span>{inspection.workOrder.location}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results Data */}
          {inspection.resultJson && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Inspection Results</CardTitle>
                <CardDescription>
                  Captured data and responses from the inspection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JsonViewer data={inspection.resultJson} title="Results Data" />
              </CardContent>
            </Card>
          )}

          {/* Template Schema */}
          {inspection.template?.schemaJson && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Template Schema</CardTitle>
                <CardDescription>
                  Structure and configuration of the inspection template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JsonViewer data={inspection.template.schemaJson} title="Template Schema" />
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Inspection ID: {inspection.inspectionId}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                View Template
              </Button>
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Work Order
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
