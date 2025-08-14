import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useUsers } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { api, type WorkOrder, type Asset, type InspectionTemplate, type WorkOrderTemplate } from '@/lib/api';
import { 
  Package, 
  FileCheck, 
  Plus, 
  X, 
  Clock,
  Users,
  MapPin,
  Settings,
  Loader2,
  Search,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface EnhancedWorkOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrder?: WorkOrder | null;
  onSave: () => void;
  readOnly?: boolean;
}

interface FormData {
  title: string;
  description: string;
  assignedTo: string;
  location: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  dueDate: string;
  estimatedDuration: number;
  requiredSkills: string[];
  workOrderTemplateId?: string;
  assetIds: string[];
  templateIds: string[];
  dependencies: string[];
  notes: string;
}

export function EnhancedWorkOrderModal({ open, onOpenChange, workOrder, onSave, readOnly = false }: EnhancedWorkOrderModalProps) {
  const { data: users } = useUsers();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [templates, setTemplates] = useState<InspectionTemplate[]>([]);
  const [workOrderTemplates, setWorkOrderTemplates] = useState<WorkOrderTemplate[]>([]);
  const [availableSkills] = useState(['Electrical', 'Mechanical', 'Hydraulic', 'Safety', 'Welding', 'Programming']);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    assignedTo: '',
    location: '',
    priority: 'medium',
    status: 'pending',
    dueDate: '',
    estimatedDuration: 2,
    requiredSkills: [],
    assetIds: [],
    templateIds: [],
    dependencies: [],
    notes: ''
  });

  const [assetSearch, setAssetSearch] = useState('');
  const [templateSearch, setTemplateSearch] = useState('');

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  useEffect(() => {
    if (workOrder) {
      setFormData({
        title: workOrder.title,
        description: workOrder.description,
        assignedTo: workOrder.assignedTo,
        location: workOrder.location || '',
        priority: workOrder.priority as any,
        status: workOrder.status,
        dueDate: workOrder.dueDate ? new Date(workOrder.dueDate).toISOString().split('T')[0] : '',
        estimatedDuration: (workOrder as any).estimatedDuration || 2,
        requiredSkills: (workOrder as any).requiredSkills || [],
        workOrderTemplateId: (workOrder as any).workOrderTemplateId,
        assetIds: (workOrder as any).assets?.map((a: any) => a.id) || [],
        templateIds: workOrder.inspections?.map(i => i.templateId) || [],
        dependencies: (workOrder as any).dependencies || [],
        notes: ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        assignedTo: '',
        location: '',
        priority: 'medium',
        status: 'pending',
        dueDate: '',
        estimatedDuration: 2,
        requiredSkills: [],
        assetIds: [],
        templateIds: [],
        dependencies: [],
        notes: ''
      });
    }
  }, [workOrder, open]);

  const loadData = async () => {
    try {
      const [assetsRes, templatesRes, workOrderTemplatesRes] = await Promise.all([
        api.assets.list({ limit: 100 }),
        api.templates.list(),
        api.workOrderTemplates.list({ limit: 100 })
      ]);

      setAssets(assetsRes.data || []);
      setTemplates(templatesRes.data || []);
      setWorkOrderTemplates(workOrderTemplatesRes.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      // Use mock data for development
      setAssets([
        {
          id: '1',
          assetId: 'AST-001',
          name: 'Forklift #1',
          type: 'Forklift',
          category: 'Equipment',
          location: 'Warehouse A',
          status: 'active',
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-01T10:00:00Z'
        }
      ]);
      setTemplates([
        {
          id: '1',
          templateId: 'TPL-001',
          name: 'Daily Safety Check',
          description: 'Daily equipment safety inspection',
          schemaJson: {},
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-01T10:00:00Z',
          category: 'Safety',
          tags: [],
          version: '1.0.0',
          status: 'published',
          isPublic: false,
          isLatestVersion: true
        }
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.title.trim() || !formData.assignedTo) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      const payload = {
        ...formData,
        dueDate: formData.dueDate || undefined,
        createdBy: 'current-user' // Replace with actual user ID
      };

      if (workOrder) {
        await api.workOrders.update(workOrder.id, payload);
      } else {
        await api.workOrders.create(payload);
      }

      toast({
        title: workOrder ? "Work order updated" : "Work order created",
        description: workOrder ? "Work order has been updated successfully." : "New work order has been created successfully.",
      });
      onSave();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save work order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleWorkOrderTemplateSelect = async (templateId: string) => {
    try {
      const template = await api.workOrderTemplates.get(templateId);
      setFormData(prev => ({
        ...prev,
        workOrderTemplateId: templateId,
        title: prev.title || template.name,
        description: prev.description || template.description,
        priority: template.priority as any,
        estimatedDuration: template.estimatedDuration,
        requiredSkills: template.requiredSkills,
        templateIds: template.inspectionTemplateIds
      }));
    } catch (error) {
      console.error('Failed to load work order template:', error);
    }
  };

  const toggleAsset = (assetId: string) => {
    setFormData(prev => ({
      ...prev,
      assetIds: prev.assetIds.includes(assetId)
        ? prev.assetIds.filter(id => id !== assetId)
        : [...prev.assetIds, assetId]
    }));
  };

  const toggleTemplate = (templateId: string) => {
    setFormData(prev => ({
      ...prev,
      templateIds: prev.templateIds.includes(templateId)
        ? prev.templateIds.filter(id => id !== templateId)
        : [...prev.templateIds, templateId]
    }));
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.includes(skill)
        ? prev.requiredSkills.filter(s => s !== skill)
        : [...prev.requiredSkills, skill]
    }));
  };

  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(assetSearch.toLowerCase()) ||
    asset.assetId.toLowerCase().includes(assetSearch.toLowerCase()) ||
    asset.type.toLowerCase().includes(assetSearch.toLowerCase())
  );

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
    template.description.toLowerCase().includes(templateSearch.toLowerCase())
  );

  const selectedAssets = assets.filter(asset => formData.assetIds.includes(asset.id));
  const selectedTemplates = templates.filter(template => formData.templateIds.includes(template.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{workOrder ? 'Edit Work Order' : 'Create New Work Order'}</DialogTitle>
          <DialogDescription>
            {workOrder ? 'Update work order details, assets, and inspection templates.' : 'Create a new work order with assets and inspection templates.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Essential work order details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Work Order Template Selection */}
                  <div className="space-y-2">
                    <Label>Work Order Template (Optional)</Label>
                    <Select 
                      value={formData.workOrderTemplateId || ''} 
                      onValueChange={handleWorkOrderTemplateSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template to pre-fill fields" />
                      </SelectTrigger>
                      <SelectContent>
                        {workOrderTemplates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{template.name}</span>
                              <Badge variant="outline" className="ml-2">
                                {template.category}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="Daily Equipment Safety Check"
                        required
                        disabled={readOnly}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assignedTo">Assigned To *</Label>
                      <Select 
                        value={formData.assignedTo} 
                        onValueChange={(value) => handleChange('assignedTo', value)}
                        disabled={readOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                        <SelectContent>
                          {users?.map(user => (
                            <SelectItem key={user.id} value={user.name}>
                              {user.name} ({user.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Describe the work to be performed..."
                      rows={3}
                      disabled={readOnly}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                        placeholder="Warehouse A"
                        disabled={readOnly}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => handleChange('dueDate', e.target.value)}
                        disabled={readOnly}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select 
                        value={formData.priority} 
                        onValueChange={(value) => handleChange('priority', value)}
                        disabled={readOnly}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedDuration">Estimated Duration (hours)</Label>
                      <Input
                        id="estimatedDuration"
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={formData.estimatedDuration}
                        onChange={(e) => handleChange('estimatedDuration', parseFloat(e.target.value))}
                        disabled={readOnly}
                      />
                    </div>
                  </div>

                  {/* Required Skills */}
                  <div className="space-y-2">
                    <Label>Required Skills</Label>
                    <div className="flex flex-wrap gap-2">
                      {availableSkills.map(skill => (
                        <div key={skill} className="flex items-center space-x-2">
                          <Checkbox
                            id={`skill-${skill}`}
                            checked={formData.requiredSkills.includes(skill)}
                            onCheckedChange={() => toggleSkill(skill)}
                            disabled={readOnly}
                          />
                          <Label htmlFor={`skill-${skill}`} className="text-sm">
                            {skill}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assets" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Select Assets
                  </CardTitle>
                  <CardDescription>
                    Choose assets that need to be inspected or maintained
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search Assets */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search assets..."
                      value={assetSearch}
                      onChange={(e) => setAssetSearch(e.target.value)}
                      className="pl-9"
                      disabled={readOnly}
                    />
                  </div>

                  {/* Selected Assets Summary */}
                  {formData.assetIds.length > 0 && (
                    <div className="space-y-2">
                      <Label>Selected Assets ({formData.assetIds.length})</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedAssets.map(asset => (
                          <Badge key={asset.id} variant="secondary" className="flex items-center gap-1">
                            {asset.name}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => toggleAsset(asset.id)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assets List */}
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {filteredAssets.map(asset => (
                        <div key={asset.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Checkbox
                            checked={formData.assetIds.includes(asset.id)}
                            onCheckedChange={() => toggleAsset(asset.id)}
                            disabled={readOnly}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{asset.name}</span>
                              <Badge variant="outline">{asset.type}</Badge>
                              {asset.status === 'active' ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {asset.assetId} • {asset.location || 'No location'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5" />
                    Select Inspection Templates
                  </CardTitle>
                  <CardDescription>
                    Choose inspection templates to include in this work order
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search Templates */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search templates..."
                      value={templateSearch}
                      onChange={(e) => setTemplateSearch(e.target.value)}
                      className="pl-9"
                      disabled={readOnly}
                    />
                  </div>

                  {/* Selected Templates Summary */}
                  {formData.templateIds.length > 0 && (
                    <div className="space-y-2">
                      <Label>Selected Templates ({formData.templateIds.length})</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedTemplates.map(template => (
                          <Badge key={template.id} variant="secondary" className="flex items-center gap-1">
                            {template.name}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => toggleTemplate(template.id)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Templates List */}
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {filteredTemplates.map(template => (
                        <div key={template.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Checkbox
                            checked={formData.templateIds.includes(template.id)}
                            onCheckedChange={() => toggleTemplate(template.id)}
                            disabled={readOnly}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{template.name}</span>
                              <Badge variant="outline">{template.category}</Badge>
                              {template.estimatedDuration && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {template.estimatedDuration}min
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {template.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Settings</CardTitle>
                  <CardDescription>Additional configuration options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      placeholder="Additional notes or instructions..."
                      rows={4}
                      disabled={readOnly}
                    />
                  </div>

                  {/* Summary */}
                  <Separator />
                  <div className="space-y-3">
                    <Label>Work Order Summary</Label>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Assets:</span>
                        <p className="font-medium">{formData.assetIds.length} selected</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Templates:</span>
                        <p className="font-medium">{formData.templateIds.length} selected</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Required Skills:</span>
                        <p className="font-medium">{formData.requiredSkills.length} skills</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Estimated Duration:</span>
                        <p className="font-medium">{formData.estimatedDuration} hours</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || readOnly}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {workOrder ? 'Update Work Order' : 'Create Work Order'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
