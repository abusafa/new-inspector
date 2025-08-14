import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  ClipboardList, 
  FileText, 
  Settings,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Search
} from 'lucide-react';
import { api, type Inspection, type InspectionTemplate, type WorkOrder } from '@/lib/api';
import { useTemplates, useWorkOrders } from '@/hooks/useApi';
import { formatDate } from '@/lib/utils';

interface InspectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inspection?: Inspection | null;
  onSave: () => void;
}

interface InspectionFormData {
  inspectionId: string;
  workOrderId: string;
  templateId: string;
  status: 'not-started' | 'in-progress' | 'completed';
  required: boolean;
  order: number;
  assignedTo?: string;
  dueDate?: string;
  notes?: string;
}

export function InspectionModal({ open, onOpenChange, inspection, onSave }: InspectionModalProps) {
  const { toast } = useToast();
  const { data: templates, loading: templatesLoading } = useTemplates();
  const { data: workOrders, loading: workOrdersLoading } = useWorkOrders();
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<InspectionFormData>({
    inspectionId: '',
    workOrderId: '',
    templateId: '',
    status: 'not-started',
    required: true,
    order: 1,
  });

  const [selectedTemplate, setSelectedTemplate] = useState<InspectionTemplate | null>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);

  useEffect(() => {
    if (inspection) {
      setFormData({
        inspectionId: inspection.inspectionId,
        workOrderId: inspection.workOrderId,
        templateId: inspection.templateId,
        status: inspection.status as any,
        required: inspection.required,
        order: inspection.order,
        assignedTo: (inspection as any).assignedTo || '',
        dueDate: (inspection as any).dueDate || '',
        notes: (inspection as any).notes || '',
      });
    } else {
      // Generate new inspection ID
      const newInspectionId = `INS-${Date.now()}`;
      setFormData({
        inspectionId: newInspectionId,
        workOrderId: '',
        templateId: '',
        status: 'not-started',
        required: true,
        order: 1,
      });
    }
  }, [inspection, open]);

  useEffect(() => {
    if (formData.templateId && templates?.data) {
      const template = templates.data.find(t => t.id === formData.templateId);
      setSelectedTemplate(template || null);
    } else {
      setSelectedTemplate(null);
    }
  }, [formData.templateId, templates]);

  useEffect(() => {
    if (formData.workOrderId && workOrders) {
      const workOrder = workOrders.find(wo => wo.id === formData.workOrderId);
      setSelectedWorkOrder(workOrder || null);
      
      // Auto-set order based on existing inspections in work order
      if (workOrder && !inspection) {
        setFormData(prev => ({
          ...prev,
          order: (workOrder.inspections?.length || 0) + 1
        }));
      }
    } else {
      setSelectedWorkOrder(null);
    }
  }, [formData.workOrderId, workOrders, inspection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.workOrderId || !formData.templateId) {
      toast({
        title: "Required fields missing",
        description: "Please select both a work order and template.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        inspectionId: formData.inspectionId,
        workOrderId: formData.workOrderId,
        templateId: formData.templateId,
        status: formData.status,
        required: formData.required,
        order: formData.order,
        resultJson: inspection?.resultJson || {},
        // Additional fields that would be in a real implementation
        assignedTo: formData.assignedTo,
        dueDate: formData.dueDate,
        notes: formData.notes,
      };

      if (inspection) {
        await api.inspections.update(inspection.id, payload);
      } else {
        await api.inspections.create(payload);
      }

      toast({
        title: inspection ? "Inspection updated" : "Inspection created",
        description: inspection 
          ? "Inspection has been updated successfully." 
          : "New inspection has been created successfully.",
      });
      
      onSave();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save inspection. Please try again.",
        variant: "destructive",
      });
      console.error('Failed to save inspection:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in-progress':
        return 'text-blue-600 bg-blue-100';
      case 'not-started':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in-progress':
        return <Clock className="h-4 w-4" />;
      case 'not-started':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Inspection ID</label>
        <Input
          value={formData.inspectionId}
          onChange={(e) => setFormData(prev => ({ ...prev, inspectionId: e.target.value }))}
          placeholder="Unique inspection identifier"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Work Order *</label>
        <Select
          value={formData.workOrderId}
          onValueChange={(value: string) => setFormData(prev => ({ ...prev, workOrderId: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a work order" />
          </SelectTrigger>
          <SelectContent>
            {workOrders?.map((workOrder) => (
              <SelectItem key={workOrder.id} value={workOrder.id}>
                <div className="flex items-center gap-2">
                  <span>{workOrder.workOrderId}</span>
                  <span className="text-muted-foreground">- {workOrder.title}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedWorkOrder && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{selectedWorkOrder.title}</span>
              <Badge variant="outline">{selectedWorkOrder.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{selectedWorkOrder.description}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>Assigned to: {selectedWorkOrder.assignedTo}</span>
              <span>Due: {selectedWorkOrder.dueDate ? formatDate(selectedWorkOrder.dueDate) : 'No due date'}</span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Template *</label>
        <Select
          value={formData.templateId}
          onValueChange={(value: string) => setFormData(prev => ({ ...prev, templateId: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an inspection template" />
          </SelectTrigger>
          <SelectContent>
            {templates?.data?.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                <div className="flex items-center gap-2">
                  <span>{template.name}</span>
                  <Badge variant="outline" className="text-xs">{template.templateId}</Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedTemplate && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{selectedTemplate.name}</span>
              <Badge variant="outline">{selectedTemplate.templateId}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
            <div className="mt-2 text-sm text-muted-foreground">
              Created: {formatDate(selectedTemplate.createdAt)}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select
            value={formData.status}
            onValueChange={(value: string) => setFormData(prev => ({ ...prev, status: value as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not-started">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-gray-600" />
                  Not Started
                </div>
              </SelectItem>
              <SelectItem value="in-progress">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  In Progress
                </div>
              </SelectItem>
              <SelectItem value="completed">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Completed
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Order</label>
          <Input
            type="number"
            min="1"
            value={formData.order}
            onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="required"
          checked={formData.required}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, required: checked as boolean }))}
        />
        <label htmlFor="required" className="text-sm font-medium">
          Required inspection
        </label>
      </div>
    </div>
  );

  const renderAssignmentInfo = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Assigned To</label>
        <Input
          value={formData.assignedTo || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
          placeholder="Inspector name or email"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Due Date</label>
        <Input
          type="datetime-local"
          value={formData.dueDate || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Notes</label>
        <textarea
          className="w-full p-3 border rounded-md resize-none"
          rows={4}
          value={formData.notes || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Additional notes or instructions..."
        />
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Inspection Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Inspection ID</span>
              <p className="font-medium">{formData.inspectionId}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Status</span>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusColor(formData.status)}>
                  {getStatusIcon(formData.status)}
                  <span className="ml-1 capitalize">{formData.status.replace('-', ' ')}</span>
                </Badge>
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Order</span>
              <p className="font-medium">#{formData.order}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Required</span>
              <p className="font-medium">{formData.required ? 'Yes' : 'No'}</p>
            </div>
          </div>
          
          {formData.assignedTo && (
            <div>
              <span className="text-sm text-muted-foreground">Assigned To</span>
              <p className="font-medium">{formData.assignedTo}</p>
            </div>
          )}
          
          {formData.dueDate && (
            <div>
              <span className="text-sm text-muted-foreground">Due Date</span>
              <p className="font-medium">{new Date(formData.dueDate).toLocaleString()}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedWorkOrder && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Associated Work Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{selectedWorkOrder.title}</span>
                <Badge variant="outline">{selectedWorkOrder.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{selectedWorkOrder.description}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Template Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{selectedTemplate.name}</span>
                <Badge variant="outline">{selectedTemplate.templateId}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
              <div className="text-xs text-muted-foreground">
                Created: {formatDate(selectedTemplate.createdAt)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            {inspection ? 'Edit Inspection' : 'Create Inspection'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="assignment">Assignment</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            {renderBasicInfo()}
          </TabsContent>

          <TabsContent value="assignment" className="space-y-4">
            {renderAssignmentInfo()}
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {renderPreview()}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || templatesLoading || workOrdersLoading}>
            {loading ? 'Saving...' : inspection ? 'Update Inspection' : 'Create Inspection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
