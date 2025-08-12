import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  User, 
  Clock, 
  CheckCircle2, 
  PlayCircle, 
  AlertCircle,
  FileText,
  Star,
  Navigation
} from 'lucide-react';
import { WorkOrder, WorkOrderInspection, InspectionTemplate } from '@/types/inspection';

interface WorkOrderDetailProps {
  workOrder: WorkOrder;
  onBack: () => void;
  onStartInspection: (inspection: WorkOrderInspection, template: InspectionTemplate) => void;
  getTemplate: (templateId: string) => InspectionTemplate | undefined;
}

export function WorkOrderDetail({ workOrder, onBack, onStartInspection, getTemplate }: WorkOrderDetailProps) {
  const getStatusColor = (status: WorkOrder['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getPriorityColor = (priority: WorkOrder['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getInspectionStatusIcon = (status: WorkOrderInspection['status']) => {
    switch (status) {
      case 'completed':
        return CheckCircle2;
      case 'in-progress':
        return PlayCircle;
      default:
        return AlertCircle;
    }
  };

  const getInspectionStatusColor = (status: WorkOrderInspection['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'in-progress':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const calculateProgress = () => {
    const completed = workOrder.inspections.filter(i => i.status === 'completed').length;
    return workOrder.inspections.length > 0 ? (completed / workOrder.inspections.length) * 100 : 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openDirections = (location: string) => {
    const encodedLocation = encodeURIComponent(location);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedLocation}`;
    window.open(mapsUrl, '_blank');
  };

  const progress = calculateProgress();
  const completedInspections = workOrder.inspections.filter(i => i.status === 'completed').length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Work Orders
        </Button>
      </div>

      {/* Work Order Overview */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-xl font-semibold mb-2 leading-tight">{workOrder.title}</h1>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                {workOrder.description}
              </p>
            </div>
            <div className="flex flex-col gap-2 items-end ml-4 flex-shrink-0">
              <Badge className={getStatusColor(workOrder.status)}>
                {workOrder.status.replace('-', ' ').toUpperCase()}
              </Badge>
              <Badge className={getPriorityColor(workOrder.priority)}>
                {workOrder.priority.toUpperCase()} PRIORITY
              </Badge>
            </div>
          </div>
          
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-6 text-sm">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">Assigned To</div>
                <div className="text-slate-600">{workOrder.assigned_to}</div>
              </div>
            </div>
            
            {workOrder.location && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">Location</div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 text-sm">{workOrder.location}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-blue-100"
                      onClick={() => openDirections(workOrder.location!)}
                      title="Get directions"
                    >
                      <Navigation className="h-4 w-4 text-blue-600" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">Created</div>
                <div className="text-slate-600 text-sm">{formatDate(workOrder.created_at)}</div>
              </div>
            </div>
            
            {workOrder.due_date && (
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">Due Date</div>
                  <div className="text-slate-600 text-sm">{formatDate(workOrder.due_date)}</div>
                </div>
              </div>
            )}
          </div>

          <Separator className="my-6" />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">Overall Progress</span>
              <span className="text-slate-600 text-sm">
                {completedInspections} of {workOrder.inspections.length} completed
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Inspections List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Inspections ({workOrder.inspections.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {workOrder.inspections
              .sort((a, b) => a.order - b.order)
              .map((inspection) => {
                const StatusIcon = getInspectionStatusIcon(inspection.status);
                const template = getTemplate(inspection.template_id);
                
                return (
                  <Card 
                    key={inspection.inspection_id} 
                    className="cursor-pointer transition-all duration-200 active:scale-[0.98] hover:shadow-md border border-border hover:border-blue-300"
                    onClick={() => {
                      if (inspection.status !== 'completed' && template) {
                        onStartInspection(inspection, template);
                      }
                    }}
                  >
                    <CardContent className="p-3">
                      {/* Header Row */}
                      <div className="flex items-start gap-2 mb-2">
                        <div className={`p-1.5 rounded-full flex-shrink-0 ${getInspectionStatusColor(inspection.status)}`}>
                          <StatusIcon className="h-3 w-3" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm leading-tight mb-1 flex items-center gap-1">
                            {inspection.template_name}
                            {inspection.required && (
                              <Star className="h-3 w-3 text-red-500 fill-current flex-shrink-0" />
                            )}
                          </h3>
                          
                          {/* Status and Result Badges */}
                          <div className="flex items-center gap-1.5 mb-2">
                            <Badge 
                              variant={inspection.status === 'completed' ? 'default' : 'secondary'}
                              className="text-xs px-2 py-0.5"
                            >
                              {inspection.status.replace('-', ' ').toUpperCase()}
                            </Badge>
                            
                            {inspection.status === 'completed' && inspection.result && (
                              <Badge 
                                className={`text-xs px-2 py-0.5 ${
                                  inspection.result.passed 
                                    ? 'bg-green-100 text-green-800 border-green-200' 
                                    : 'bg-red-100 text-red-800 border-red-200'
                                }`}
                                variant="secondary"
                              >
                                {inspection.result.passed ? 'PASSED' : 'FAILED'}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Button */}
                        {inspection.status !== 'completed' && template && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onStartInspection(inspection, template);
                            }}
                            className="flex items-center gap-1 text-xs px-3 py-1 h-7 flex-shrink-0"
                          >
                            <PlayCircle className="h-3 w-3" />
                            {inspection.status === 'in-progress' ? 'Continue' : 'Start'}
                          </Button>
                        )}
                      </div>
                      
                      {/* Completion Info */}
                      {inspection.completed_at && (
                        <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Completed: {formatDate(inspection.completed_at)}
                          {inspection.result && (
                            <span className="ml-2">
                              Score: {inspection.result.total_score}/{inspection.result.max_score}
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}