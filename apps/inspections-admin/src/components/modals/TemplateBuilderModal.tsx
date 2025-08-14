import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api, type InspectionTemplate } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Plus,
  Save,
  Eye,
  Settings,
  Trash2,
  Copy,
  Move,
  GripVertical,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Type,
  Camera,
  Edit3,
  List,
  Star,
  Hash,
  ToggleLeft,
  FileText,
  Layers,
  HelpCircle,
  X
} from 'lucide-react';

interface TemplateBuilderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: InspectionTemplate | null;
  onSave: () => void;
}

interface BuilderComponent {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  defaultConfig: any;
}

interface TemplateMetadata {
  name: string;
  description: string;
  category: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedDuration?: number;
  industry?: string;
  equipmentType?: string;
}

export function TemplateBuilderModal({ open, onOpenChange, template, onSave }: TemplateBuilderModalProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('design');
  
  // Template data
  const [templateSchema, setTemplateSchema] = useState<any>(null);
  const [metadata, setMetadata] = useState<TemplateMetadata>({
    name: '',
    description: '',
    category: 'General',
    tags: [],
    difficulty: 'easy',
  });
  
  // Builder components and categories
  const [components, setComponents] = useState<BuilderComponent[]>([]);
  const [categories, setCategories] = useState<Array<{ name: string; count: number }>>([]);
  const [patterns, setPatterns] = useState<any[]>([]);
  
  // UI state
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [draggedItem, setDraggedItem] = useState<any>(null);

  useEffect(() => {
    if (open) {
      loadBuilderData();
      initializeTemplate();
    }
  }, [open, template]);

  const loadBuilderData = async () => {
    try {
      setLoading(true);
      const [componentsRes, categoriesRes, patternsRes] = await Promise.all([
        api.templateBuilder.getComponents(),
        api.templates.categories(),
        api.templateBuilder.getPatterns(),
      ]);
      
      setComponents(componentsRes);
      setCategories(categoriesRes);
      setPatterns(patternsRes);
    } catch (error) {
      toast({
        title: "Failed to load builder data",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeTemplate = async () => {
    const patternId = searchParams.get('pattern');
    
    if (template) {
      // Editing existing template
      setMetadata({
        name: template.name,
        description: template.description,
        category: template.category,
        tags: template.tags,
        difficulty: template.difficulty || 'easy',
        estimatedDuration: template.estimatedDuration,
        industry: template.industry,
        equipmentType: template.equipmentType,
      });
      setTemplateSchema(template.schemaJson);
    } else if (patternId) {
      // Creating from pattern
      try {
        const patternData = await api.templateBuilder.generateFromPattern(patternId, {
          name: `New ${patterns.find(p => p.id === patternId)?.name || 'Template'}`,
          templateId: `TPL-${Date.now()}`,
        });
        setTemplateSchema(patternData);
        setMetadata(prev => ({
          ...prev,
          name: patternData.name,
          description: patternData.description,
        }));
      } catch (error) {
        console.error('Failed to load pattern:', error);
      }
    } else {
      // Creating new template
      const defaultSchema = {
        template_id: `TPL-${Date.now()}`,
        name: 'New Template',
        description: 'New inspection template',
        header_items: [
          {
            item_id: 'header_datetime',
            type: 'datetime',
            label: 'Date and Time',
            options: { required: true, default_to_current_time: true }
          },
          {
            item_id: 'header_inspector',
            type: 'text',
            label: 'Inspector Name',
            options: { required: true }
          }
        ],
        items: []
      };
      setTemplateSchema(defaultSchema);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const templateData = {
        name: metadata.name,
        description: metadata.description,
        category: metadata.category,
        tags: metadata.tags,
        difficulty: metadata.difficulty,
        estimatedDuration: metadata.estimatedDuration,
        industry: metadata.industry,
        equipmentType: metadata.equipmentType,
        schemaJson: {
          ...templateSchema,
          name: metadata.name,
          description: metadata.description,
        },
        createdBy: user?.id,
        lastModifiedBy: user?.id,
      };

      if (template) {
        await api.templates.update(template.id, templateData);
        toast({
          title: "Template updated",
          description: "Your template has been saved successfully.",
        });
      } else {
        await api.templates.create(templateData);
        toast({
          title: "Template created",
          description: "Your template has been created successfully.",
        });
      }
      
      onSave();
    } catch (error) {
      toast({
        title: "Failed to save template",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddComponent = async (componentType: string, parentId?: string) => {
    if (!templateSchema) return;

    // If editing an existing template (has DB id), call server; otherwise mutate locally
    if (template?.id) {
      try {
        const updatedSchema = await api.templateBuilder.addComponent(template.id, {
          componentType,
          parentId,
          customConfig: { label: `New ${componentType}` },
        });
        setTemplateSchema(updatedSchema);
      } catch (error) {
        toast({ title: 'Failed to add component', description: 'Please try again.', variant: 'destructive' });
      }
      return;
    }

    // Local add for new templates not yet saved to DB
    const newItem = {
      item_id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: componentType === 'section' ? 'section' : componentType === 'multiple_choice' || componentType === 'rating' || componentType === 'dropdown' || componentType === 'checkbox' ? 'question' : componentType,
      label: `New ${componentType}`,
      items: componentType === 'section' ? [] : undefined,
    } as any;
    setTemplateSchema((prev: any) => {
      const next = { ...prev, items: [...(prev.items || [])] };
      if (parentId) {
        const addToParent = (items: any[]): boolean => {
          for (const it of items) {
            if (it.item_id === parentId) {
              it.items = it.items || [];
              it.items.push(newItem);
              return true;
            }
            if (it.items && addToParent(it.items)) return true;
          }
          return false;
        };
        addToParent(next.items);
      } else {
        next.items.push(newItem);
      }
      return next;
    });
  };

  const handleUpdateItem = async (itemId: string, updates: any) => {
    if (!templateSchema) return;

    if (template?.id) {
      try {
        const updatedSchema = await api.templateBuilder.updateItem(template.id, itemId, updates);
        setTemplateSchema(updatedSchema);
      } catch (error) {
        toast({ title: 'Failed to update item', description: 'Please try again.', variant: 'destructive' });
      }
      return;
    }

    // Local update
    const updateById = (items: any[]): boolean => {
      for (const it of items) {
        if (it.item_id === itemId) {
          Object.assign(it, updates);
          return true;
        }
        if (it.items && updateById(it.items)) return true;
      }
      return false;
    };
    setTemplateSchema((prev: any) => {
      const next = { ...prev, header_items: [...(prev.header_items || [])], items: [...(prev.items || [])] };
      // update header and items
      updateById(next.header_items);
      updateById(next.items);
      return next;
    });
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!templateSchema) return;

    if (template?.id) {
      try {
        const updatedSchema = await api.templateBuilder.deleteItem(template.id, itemId);
        setTemplateSchema(updatedSchema);
      } catch (error) {
        toast({ title: 'Failed to delete item', description: 'Please try again.', variant: 'destructive' });
      }
      return;
    }

    // Local delete
    const removeById = (items: any[]): any[] => {
      return (items || []).filter((it: any) => {
        if (it.item_id === itemId) return false;
        if (it.items) it.items = removeById(it.items);
        return true;
      });
    };
    setTemplateSchema((prev: any) => ({
      ...prev,
      header_items: removeById(prev.header_items || []),
      items: removeById(prev.items || []),
    }));
  };

  const getComponentIcon = (iconName: string) => {
    const icons = {
      'check-circle': CheckCircle,
      'type': Type,
      'camera': Camera,
      'edit-3': Edit3,
      'list': List,
      'star': Star,
      'hash': Hash,
      'toggle-left': ToggleLeft,
      'folder': Layers,
    };
    const IconComponent = icons[iconName as keyof typeof icons] || FileText;
    return <IconComponent className="h-4 w-4" />;
  };

  const ComponentPalette = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Components</CardTitle>
        <CardDescription className="text-xs">
          Drag components to add them to your template
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3">
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {Object.entries(
              components.reduce((acc, comp) => {
                if (!acc[comp.category]) acc[comp.category] = [];
                acc[comp.category].push(comp);
                return acc;
              }, {} as Record<string, BuilderComponent[]>)
            ).map(([category, categoryComponents]) => (
              <div key={category}>
                <h4 className="text-xs font-medium text-muted-foreground mb-2">{category}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {categoryComponents.map(component => (
                    <div
                      key={component.id}
                      className="p-2 border rounded cursor-pointer hover:bg-muted/50 transition-colors"
                      draggable
                      onDragStart={() => setDraggedItem(component)}
                      onClick={() => handleAddComponent(component.id)}
                    >
                      <div className="flex items-center gap-2">
                        {getComponentIcon(component.icon)}
                        <div>
                          <div className="text-xs font-medium">{component.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {component.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  const TemplateStructure = () => {
    if (!templateSchema) return null;

    const renderItem = (item: any, level = 0) => {
      const isExpanded = expandedSections.has(item.item_id);
      const hasChildren = item.items && item.items.length > 0;

      return (
        <div key={item.item_id} className="space-y-1">
          <div 
            className={`flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-muted/50 ${
              selectedItem === item.item_id ? 'bg-blue-50 border-blue-200' : ''
            }`}
            style={{ marginLeft: level * 16 }}
            onClick={() => setSelectedItem(item.item_id)}
          >
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-4 w-4"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedSections(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(item.item_id)) {
                      newSet.delete(item.item_id);
                    } else {
                      newSet.add(item.item_id);
                    }
                    return newSet;
                  });
                }}
              >
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </Button>
            )}
            <GripVertical className="h-3 w-3 text-muted-foreground" />
            {getComponentIcon(item.type)}
            <span className="flex-1 text-sm">{item.label}</span>
            <Badge variant="outline" className="text-xs">
              {item.type}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                  <Settings className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSelectedItem(item.item_id)}>
                  <Settings className="h-3 w-3 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddComponent('question', item.item_id)}>
                  <Plus className="h-3 w-3 mr-2" />
                  Add Child
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDeleteItem(item.item_id)} className="text-red-600">
                  <Trash2 className="h-3 w-3 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {hasChildren && isExpanded && (
            <div className="space-y-1">
              {item.items.map((child: any) => renderItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Template Structure</CardTitle>
          <CardDescription className="text-xs">
            Manage your template sections and questions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {/* Header Items */}
              <div className="text-xs font-medium text-muted-foreground mb-2">Header</div>
              {templateSchema.header_items?.map((item: any) => renderItem(item))}
              
              <Separator className="my-3" />
              
              {/* Main Items */}
              <div className="text-xs font-medium text-muted-foreground mb-2">Sections</div>
              {templateSchema.items?.map((item: any) => renderItem(item))}
              
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => handleAddComponent('section')}
              >
                <Plus className="h-3 w-3 mr-2" />
                Add Section
              </Button>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  const PropertyPanel = () => {
    if (!selectedItem || !templateSchema) return null;

    // Find the selected item in the schema
    const findItem = (items: any[]): any => {
      for (const item of items) {
        if (item.item_id === selectedItem) return item;
        if (item.items) {
          const found = findItem(item.items);
          if (found) return found;
        }
      }
      return null;
    };

    const item = findItem([...templateSchema.header_items, ...templateSchema.items]);
    if (!item) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Properties</CardTitle>
          <CardDescription className="text-xs">
            Configure the selected item
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 space-y-3">
          <div>
            <Label className="text-xs">Label</Label>
            <Input
              value={item.label || ''}
              onChange={(e) => handleUpdateItem(selectedItem, { label: e.target.value })}
              className="h-8 text-sm"
            />
          </div>
          
          {item.type === 'question' && item.response_set && (
            <div>
              <Label className="text-xs">Response Type</Label>
              <Select value={item.response_set.type} onValueChange={(value) => 
                handleUpdateItem(selectedItem, { 
                  response_set: { ...item.response_set, type: value } 
                })
              }>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                  <SelectItem value="rating">Rating Scale</SelectItem>
                  <SelectItem value="dropdown">Dropdown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={item.options?.required || false}
              onChange={(e) => handleUpdateItem(selectedItem, {
                options: { ...item.options, required: e.target.checked }
              })}
            />
            <Label className="text-xs">Required</Label>
          </div>

          {item.type === 'text' && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={item.options?.allow_photos || false}
                onChange={(e) => handleUpdateItem(selectedItem, {
                  options: { ...item.options, allow_photos: e.target.checked }
                })}
              />
              <Label className="text-xs">Allow Photos</Label>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>
                {template ? 'Edit Template' : 'Create Template'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Design your inspection template with drag-and-drop components
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Template
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="px-6">
              <TabsList>
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="design" className="mt-0 h-full">
              <div className="grid grid-cols-12 gap-4 h-full p-6 pt-4">
                {/* Component Palette */}
                <div className="col-span-3">
                  <ComponentPalette />
                </div>

                {/* Template Structure */}
                <div className="col-span-6">
                  <TemplateStructure />
                </div>

                {/* Properties Panel */}
                <div className="col-span-3">
                  <PropertyPanel />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-0 p-6 pt-4">
              <div className="max-w-2xl space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Template Information</CardTitle>
                    <CardDescription>
                      Configure basic template settings and metadata
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Template Name</Label>
                        <Input
                          value={metadata.name}
                          onChange={(e) => setMetadata(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter template name"
                        />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Select value={metadata.category} onValueChange={(value) => 
                          setMetadata(prev => ({ ...prev, category: value }))
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category.name} value={category.name}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={metadata.description}
                        onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe what this template is used for"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Difficulty</Label>
                        <Select value={metadata.difficulty} onValueChange={(value: any) => 
                          setMetadata(prev => ({ ...prev, difficulty: value }))
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Duration (min)</Label>
                        <Input
                          type="number"
                          value={metadata.estimatedDuration || ''}
                          onChange={(e) => setMetadata(prev => ({ 
                            ...prev, 
                            estimatedDuration: e.target.value ? parseInt(e.target.value) : undefined 
                          }))}
                          placeholder="15"
                        />
                      </div>
                      <div>
                        <Label>Industry</Label>
                        <Input
                          value={metadata.industry || ''}
                          onChange={(e) => setMetadata(prev => ({ ...prev, industry: e.target.value }))}
                          placeholder="Manufacturing"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Equipment Type</Label>
                      <Input
                        value={metadata.equipmentType || ''}
                        onChange={(e) => setMetadata(prev => ({ ...prev, equipmentType: e.target.value }))}
                        placeholder="Forklift, Crane, etc."
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-0 p-6 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Template Preview</CardTitle>
                  <CardDescription>
                    See how your template will look to inspectors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Template preview will be available once you save the template.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}


