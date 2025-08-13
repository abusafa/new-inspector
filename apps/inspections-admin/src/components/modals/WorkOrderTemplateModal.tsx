import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { X, Plus, File, Clock, AlertTriangle, Target } from 'lucide-react';

interface WorkOrderTemplate {
  id?: string;
  name: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: number; // in hours
  defaultAssignee?: string;
  requiredSkills: string[];
  inspectionTemplates: string[];
  checklist: ChecklistItem[];
  notifications: NotificationSetting[];
  isActive: boolean;
}

interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  required: boolean;
  estimatedTime?: number;
}

interface NotificationSetting {
  event: 'created' | 'assigned' | 'overdue' | 'completed';
  recipients: string[];
  method: 'email' | 'sms' | 'push';
}

interface WorkOrderTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: WorkOrderTemplate | null;
  onSave: (template: WorkOrderTemplate) => void;
}

const CATEGORIES = [
  'Safety Inspection',
  'Maintenance',
  'Equipment Check',
  'Environmental',
  'Compliance',
  'Emergency Response',
  'Training',
  'Quality Control'
];

const SKILLS = [
  'Safety Certification',
  'Equipment Operation',
  'Technical Writing',
  'Photography',
  'Electrical Knowledge',
  'Mechanical Skills',
  'Environmental Assessment',
  'First Aid Certified'
];

const MOCK_USERS = [
  'John Smith',
  'Sarah Johnson',
  'Mike Wilson',
  'Lisa Davis',
  'David Brown'
];

const MOCK_INSPECTION_TEMPLATES = [
  { id: '1', name: 'Safety Checklist' },
  { id: '2', name: 'Equipment Inspection' },
  { id: '3', name: 'Fire Safety Check' },
  { id: '4', name: 'Environmental Assessment' },
  { id: '5', name: 'Vehicle Pre-trip' }
];

export function WorkOrderTemplateModal({ isOpen, onClose, template, onSave }: WorkOrderTemplateModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<WorkOrderTemplate>({
    name: '',
    description: '',
    category: '',
    priority: 'medium',
    estimatedDuration: 2,
    defaultAssignee: '',
    requiredSkills: [],
    inspectionTemplates: [],
    checklist: [],
    notifications: [
      { event: 'created', recipients: [], method: 'email' },
      { event: 'overdue', recipients: [], method: 'email' }
    ],
    isActive: true
  });
  const [newChecklistItem, setNewChecklistItem] = useState<Omit<ChecklistItem, 'id'>>({
    title: '',
    description: '',
    required: false,
    estimatedTime: 0.5
  });

  useEffect(() => {
    if (template) {
      setFormData(template);
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        priority: 'medium',
        estimatedDuration: 2,
        defaultAssignee: '',
        requiredSkills: [],
        inspectionTemplates: [],
        checklist: [],
        notifications: [
          { event: 'created', recipients: [], method: 'email' },
          { event: 'overdue', recipients: [], method: 'email' }
        ],
        isActive: true
      });
    }
  }, [template]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    onSave(formData);
    toast({
      title: template ? "Template updated" : "Template created",
      description: `Work order template "${formData.name}" has been ${template ? 'updated' : 'created'}.`,
    });
    onClose();
  };

  const addChecklistItem = () => {
    if (!newChecklistItem.title.trim()) return;
    
    const item: ChecklistItem = {
      id: Date.now().toString(),
      ...newChecklistItem
    };
    
    setFormData(prev => ({
      ...prev,
      checklist: [...prev.checklist, item]
    }));
    
    setNewChecklistItem({
      title: '',
      description: '',
      required: false,
      estimatedTime: 0.5
    });
  };

  const removeChecklistItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      checklist: prev.checklist.filter(item => item.id !== id)
    }));
  };

  const addSkill = (skill: string) => {
    if (!formData.requiredSkills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, skill]
      }));
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(s => s !== skill)
    }));
  };

  const addInspectionTemplate = (templateId: string) => {
    if (!formData.inspectionTemplates.includes(templateId)) {
      setFormData(prev => ({
        ...prev,
        inspectionTemplates: [...prev.inspectionTemplates, templateId]
      }));
    }
  };

  const removeInspectionTemplate = (templateId: string) => {
    setFormData(prev => ({
      ...prev,
      inspectionTemplates: prev.inspectionTemplates.filter(id => id !== templateId)
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="h-3 w-3" />;
      case 'high': return <Target className="h-3 w-3" />;
      case 'medium': return <Clock className="h-3 w-3" />;
      case 'low': return <File className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <File className="h-5 w-5" />
            {template ? 'Edit Work Order Template' : 'Create Work Order Template'}
          </DialogTitle>
          <DialogDescription>
            {template 
              ? 'Update this work order template to modify how future work orders are created.'
              : 'Create a reusable template for common work order types to streamline creation.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter template name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
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
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the purpose and scope of this work order template"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-green-600" />
                          Low
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          Medium
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-orange-600" />
                          High
                        </div>
                      </SelectItem>
                      <SelectItem value="critical">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          Critical
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Estimated Duration (hours)</Label>
                  <Input
                    id="duration"
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignee">Default Assignee</Label>
                  <Select value={formData.defaultAssignee} onValueChange={(value) => setFormData(prev => ({ ...prev, defaultAssignee: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_USERS.map((user) => (
                        <SelectItem key={user} value={user}>{user}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Required Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Required Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {formData.requiredSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="space-y-2">
                <Label>Add Skills</Label>
                <div className="flex flex-wrap gap-2">
                  {SKILLS.filter(skill => !formData.requiredSkills.includes(skill)).map((skill) => (
                    <Button
                      key={skill}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addSkill(skill)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {skill}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Linked Inspection Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Linked Inspection Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {formData.inspectionTemplates.map((templateId) => {
                  const template = MOCK_INSPECTION_TEMPLATES.find(t => t.id === templateId);
                  return template ? (
                    <Badge key={templateId} variant="outline" className="flex items-center gap-1">
                      {template.name}
                      <button
                        type="button"
                        onClick={() => removeInspectionTemplate(templateId)}
                        className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ) : null;
                })}
              </div>
              <div className="space-y-2">
                <Label>Add Inspection Templates</Label>
                <div className="flex flex-wrap gap-2">
                  {MOCK_INSPECTION_TEMPLATES.filter(template => !formData.inspectionTemplates.includes(template.id)).map((template) => (
                    <Button
                      key={template.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addInspectionTemplate(template.id)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {template.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pre-work Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.checklist.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{item.title}</h4>
                      {item.required && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                      {item.estimatedTime && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {item.estimatedTime}h
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeChecklistItem(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Separator />

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Item Title</Label>
                  <Input
                    value={newChecklistItem.title}
                    onChange={(e) => setNewChecklistItem(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter checklist item"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Input
                    value={newChecklistItem.description}
                    onChange={(e) => setNewChecklistItem(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Additional details"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estimated Time (hours)</Label>
                  <Input
                    type="number"
                    step="0.25"
                    min="0"
                    value={newChecklistItem.estimatedTime}
                    onChange={(e) => setNewChecklistItem(prev => ({ ...prev, estimatedTime: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={addChecklistItem}
                    disabled={!newChecklistItem.title.trim()}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {template ? 'Update Template' : 'Create Template'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
