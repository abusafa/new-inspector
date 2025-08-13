import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api, type InspectionTemplate } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Trash2, 
  Settings,
  FileText,
  HelpCircle,
  Type,
  CheckSquare,
  Image,
  FileSignature,
  GripVertical,
  Eye,
  Code
} from 'lucide-react';

interface TemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: InspectionTemplate | null;
  onSave: () => void;
}

interface TemplateItem {
  id: string;
  type: 'question' | 'text' | 'checkbox' | 'signature' | 'media';
  label: string;
  description?: string;
  required?: boolean;
  options?: string[];
}

interface TemplateSection {
  id: string;
  title: string;
  description?: string;
  items: TemplateItem[];
}

interface TemplateSchema {
  header_items: TemplateItem[];
  items: TemplateSection[];
}

const defaultSchema: TemplateSchema = {
  header_items: [
    {
      id: 'inspector_name',
      type: 'text',
      label: 'Inspector Name',
      required: true
    },
    {
      id: 'inspection_date',
      type: 'text',
      label: 'Inspection Date',
      required: true
    }
  ],
  items: [
    {
      id: 'general_section',
      title: 'General Inspection',
      description: 'Basic inspection items',
      items: [
        {
          id: 'safety_check',
          type: 'question',
          label: 'Are all safety measures in place?',
          required: true
        }
      ]
    }
  ]
};

function getItemIcon(itemType: string) {
  switch (itemType) {
    case 'question': return HelpCircle;
    case 'text': return Type;
    case 'checkbox': return CheckSquare;
    case 'signature': return FileSignature;
    case 'media': return Image;
    default: return FileText;
  }
}

function ItemEditor({ 
  item, 
  onUpdate, 
  onDelete 
}: { 
  item: TemplateItem;
  onUpdate: (item: TemplateItem) => void;
  onDelete: () => void;
}) {
  const Icon = getItemIcon(item.type);

  return (
    <Card className="mb-3">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
            <Icon className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="text-xs">
              {item.type}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Label</label>
          <Input
            value={item.label}
            onChange={(e) => onUpdate({ ...item, label: e.target.value })}
            placeholder="Item label"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Description (Optional)</label>
          <Input
            value={item.description || ''}
            onChange={(e) => onUpdate({ ...item, description: e.target.value })}
            placeholder="Item description"
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={`required-${item.id}`}
            checked={item.required || false}
            onChange={(e) => onUpdate({ ...item, required: e.target.checked })}
            className="rounded border-gray-300"
          />
          <label htmlFor={`required-${item.id}`} className="text-sm font-medium">
            Required field
          </label>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionEditor({ 
  section, 
  onUpdate, 
  onDelete 
}: { 
  section: TemplateSection;
  onUpdate: (section: TemplateSection) => void;
  onDelete: () => void;
}) {
  const addItem = (type: TemplateItem['type']) => {
    const newItem: TemplateItem = {
      id: `item_${Date.now()}`,
      type,
      label: `New ${type}`,
      required: false
    };
    onUpdate({
      ...section,
      items: [...section.items, newItem]
    });
  };

  const updateItem = (itemId: string, updatedItem: TemplateItem) => {
    onUpdate({
      ...section,
      items: section.items.map(item => 
        item.id === itemId ? updatedItem : item
      )
    });
  };

  const deleteItem = (itemId: string) => {
    onUpdate({
      ...section,
      items: section.items.filter(item => item.id !== itemId)
    });
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-2">
            <Input
              value={section.title}
              onChange={(e) => onUpdate({ ...section, title: e.target.value })}
              placeholder="Section title"
              className="font-medium"
            />
            <Input
              value={section.description || ''}
              onChange={(e) => onUpdate({ ...section, description: e.target.value })}
              placeholder="Section description (optional)"
              className="text-sm"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {section.items.map((item) => (
            <ItemEditor
              key={item.id}
              item={item}
              onUpdate={(updatedItem) => updateItem(item.id, updatedItem)}
              onDelete={() => deleteItem(item.id)}
            />
          ))}
          
          <div className="flex items-center gap-2 pt-2 border-t">
            <span className="text-sm text-muted-foreground">Add item:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addItem('question')}
            >
              <HelpCircle className="h-3 w-3 mr-1" />
              Question
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addItem('text')}
            >
              <Type className="h-3 w-3 mr-1" />
              Text
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addItem('checkbox')}
            >
              <CheckSquare className="h-3 w-3 mr-1" />
              Checkbox
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addItem('signature')}
            >
              <FileSignature className="h-3 w-3 mr-1" />
              Signature
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TemplateModal({ open, onOpenChange, template, onSave }: TemplateModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    templateId: '',
  });
  const [schema, setSchema] = useState<TemplateSchema>(defaultSchema);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description,
        templateId: template.templateId,
      });
      setSchema(template.schemaJson || defaultSchema);
    } else {
      setFormData({
        name: '',
        description: '',
        templateId: `TPL-${Date.now()}`,
      });
      setSchema(defaultSchema);
    }
  }, [template, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        schemaJson: schema,
      };

      if (template) {
        await api.templates.update(template.id, payload);
      } else {
        await api.templates.create(payload);
      }

      toast({
        title: template ? "Template updated" : "Template created",
        description: template 
          ? "Template has been updated successfully." 
          : "New template has been created successfully.",
      });
      onSave();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive",
      });
      console.error('Failed to save template:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSection = () => {
    const newSection: TemplateSection = {
      id: `section_${Date.now()}`,
      title: 'New Section',
      description: '',
      items: []
    };
    setSchema({
      ...schema,
      items: [...schema.items, newSection]
    });
  };

  const updateSection = (sectionId: string, updatedSection: TemplateSection) => {
    setSchema({
      ...schema,
      items: schema.items.map(section => 
        section.id === sectionId ? updatedSection : section
      )
    });
  };

  const deleteSection = (sectionId: string) => {
    setSchema({
      ...schema,
      items: schema.items.filter(section => section.id !== sectionId)
    });
  };

  const totalItems = schema.header_items.length + 
    schema.items.reduce((sum, section) => sum + section.items.length, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {template ? 'Edit Template' : 'Create Template'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="structure">Structure</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Template Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Template name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Template description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Template ID</label>
                <Input
                  value={formData.templateId}
                  onChange={(e) => setFormData(prev => ({ ...prev, templateId: e.target.value }))}
                  placeholder="Unique template identifier"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold">{schema.header_items.length}</div>
                  <div className="text-sm text-muted-foreground">Header Items</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{schema.items.length}</div>
                  <div className="text-sm text-muted-foreground">Sections</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{totalItems}</div>
                  <div className="text-sm text-muted-foreground">Total Items</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="structure" className="space-y-4">
            <div className="space-y-6">
              {/* Header Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Header Items</CardTitle>
                  <CardDescription>
                    Information collected at the start of the inspection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {schema.header_items.map((item, index) => (
                      <ItemEditor
                        key={item.id}
                        item={item}
                        onUpdate={(updatedItem) => {
                          const newHeaderItems = [...schema.header_items];
                          newHeaderItems[index] = updatedItem;
                          setSchema({ ...schema, header_items: newHeaderItems });
                        }}
                        onDelete={() => {
                          setSchema({
                            ...schema,
                            header_items: schema.header_items.filter((_, i) => i !== index)
                          });
                        }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Sections */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Inspection Sections</CardTitle>
                      <CardDescription>
                        Main content sections of the inspection
                      </CardDescription>
                    </div>
                    <Button onClick={addSection} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Section
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {schema.items.map((section) => (
                      <SectionEditor
                        key={section.id}
                        section={section}
                        onUpdate={(updatedSection) => updateSection(section.id, updatedSection)}
                        onDelete={() => deleteSection(section.id)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Template Preview
                </CardTitle>
                <CardDescription>
                  Preview of how the template will appear to inspectors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Header Items Preview */}
                  {schema.header_items.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-3">Header Information</h3>
                      <div className="space-y-2">
                        {schema.header_items.map((item) => {
                          const Icon = getItemIcon(item.type);
                          return (
                            <div key={item.id} className="flex items-center gap-2 p-2 border rounded">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{item.label}</span>
                              {item.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Sections Preview */}
                  {schema.items.map((section) => (
                    <div key={section.id}>
                      <h3 className="font-medium mb-2">{section.title}</h3>
                      {section.description && (
                        <p className="text-sm text-muted-foreground mb-3">{section.description}</p>
                      )}
                      <div className="space-y-2">
                        {section.items.map((item) => {
                          const Icon = getItemIcon(item.type);
                          return (
                            <div key={item.id} className="flex items-center gap-2 p-2 border rounded">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <span>{item.label}</span>
                              {item.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
