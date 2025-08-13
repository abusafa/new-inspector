import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { api, type InspectionTemplate } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';
import { 
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Star,
  BarChart3,
  Users,
  Tag,
  Calendar,
  FileText,
  Camera,
  Edit3,
  Hash,
  ToggleLeft,
  List,
  Layers,
  Download,
  Share,
  Copy,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  Info
} from 'lucide-react';

interface TemplatePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: InspectionTemplate | null;
}

interface PreviewData {
  valid: boolean;
  errors: any[];
  template: any;
  metadata: {
    totalQuestions: number;
    totalSections: number;
    estimatedDuration?: number;
    difficulty?: string;
  };
}

export function TemplatePreviewModal({ open, onOpenChange, template }: TemplatePreviewModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [activeTab, setActiveTab] = useState('preview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (open && template) {
      loadPreview();
    }
  }, [open, template]);

  const loadPreview = async () => {
    if (!template) return;

    try {
      setLoading(true);
      const preview = await api.templates.preview(template.id);
      setPreviewData(preview);
      
      // Initialize form data with default values
      const initialData: Record<string, any> = {};
      if (preview.template?.header_items) {
        preview.template.header_items.forEach((item: any) => {
          if (item.type === 'datetime' && item.options?.default_to_current_time) {
            initialData[item.item_id] = new Date().toISOString();
          }
        });
      }
      setFormData(initialData);
      
    } catch (error) {
      toast({
        title: "Failed to load template preview",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getItemIcon = (type: string) => {
    const icons = {
      'question': CheckCircle,
      'text': FileText,
      'signature': Edit3,
      'photo': Camera,
      'rating': Star,
      'dropdown': List,
      'checkbox': ToggleLeft,
      'number': Hash,
      'datetime': Calendar,
      'section': Layers,
    };
    const IconComponent = icons[type as keyof typeof icons] || HelpCircle;
    return <IconComponent className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'hard':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const renderFormItem = (item: any, level = 0) => {
    const isExpanded = expandedSections.has(item.item_id);
    const hasChildren = item.items && item.items.length > 0;
    const value = formData[item.item_id] || '';

    const handleValueChange = (newValue: any) => {
      setFormData(prev => ({ ...prev, [item.item_id]: newValue }));
    };

    const toggleSection = () => {
      setExpandedSections(prev => {
        const newSet = new Set(prev);
        if (newSet.has(item.item_id)) {
          newSet.delete(item.item_id);
        } else {
          newSet.add(item.item_id);
        }
        return newSet;
      });
    };

    if (item.type === 'section') {
      return (
        <Card key={item.item_id} className="mb-4">
          <CardHeader 
            className="cursor-pointer" 
            onClick={toggleSection}
            style={{ paddingLeft: `${level * 20 + 24}px` }}
          >
            <div className="flex items-center gap-2">
              {hasChildren && (
                isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
              )}
              <Layers className="h-4 w-4" />
              <CardTitle className="text-base">{item.label}</CardTitle>
            </div>
          </CardHeader>
          {hasChildren && isExpanded && (
            <CardContent>
              <div className="space-y-4">
                {item.items.map((child: any) => renderFormItem(child, level + 1))}
              </div>
            </CardContent>
          )}
        </Card>
      );
    }

    return (
      <div key={item.item_id} className="space-y-2" style={{ paddingLeft: `${level * 20}px` }}>
        <div className="flex items-center gap-2">
          {getItemIcon(item.type)}
          <Label className="text-sm font-medium">
            {item.label}
            {item.options?.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        </div>

        {item.type === 'question' && item.response_set && (
          <div className="space-y-2">
            {item.response_set.type === 'multiple-choice' && (
              <div className="space-y-1">
                {item.response_set.responses.map((response: any) => (
                  <label key={response.id} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted/50">
                    <input
                      type="radio"
                      name={item.item_id}
                      value={response.id}
                      checked={value === response.id}
                      onChange={() => handleValueChange(response.id)}
                    />
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-${response.color}-500`} />
                      <span className="text-sm">{response.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {item.response_set.type === 'rating' && (
              <div className="flex gap-1">
                {item.response_set.responses.map((response: any) => (
                  <button
                    key={response.id}
                    onClick={() => handleValueChange(response.id)}
                    className={`p-2 border rounded ${
                      value === response.id ? 'bg-blue-100 border-blue-300' : 'hover:bg-muted/50'
                    }`}
                  >
                    <Star className={`h-4 w-4 ${value === response.id ? 'fill-current text-yellow-500' : 'text-gray-400'}`} />
                  </button>
                ))}
              </div>
            )}

            {item.response_set.type === 'dropdown' && (
              <select
                value={value}
                onChange={(e) => handleValueChange(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select an option...</option>
                {item.response_set.responses.map((response: any) => (
                  <option key={response.id} value={response.id}>
                    {response.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {item.type === 'text' && (
          <div className="space-y-2">
            <Textarea
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder={item.options?.placeholder || 'Enter your response...'}
              rows={3}
            />
            {item.options?.allow_photos && (
              <div className="flex items-center gap-2 p-2 border border-dashed rounded">
                <Camera className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Photo attachment allowed</span>
              </div>
            )}
          </div>
        )}

        {item.type === 'signature' && (
          <div className="p-8 border border-dashed rounded bg-muted/20 text-center">
            <Edit3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Signature capture area</p>
          </div>
        )}

        {item.type === 'datetime' && (
          <Input
            type="datetime-local"
            value={value}
            onChange={(e) => handleValueChange(e.target.value)}
          />
        )}

        {item.type === 'number' && (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={item.options?.placeholder}
          />
        )}
      </div>
    );
  };

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Template Preview
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Preview how this template will appear to inspectors
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="px-6">
              <TabsList>
                <TabsTrigger value="preview">Live Preview</TabsTrigger>
                <TabsTrigger value="structure">Structure</TabsTrigger>
                <TabsTrigger value="validation">Validation</TabsTrigger>
                <TabsTrigger value="metadata">Details</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="preview" className="mt-0 h-full">
              <div className="grid grid-cols-12 gap-6 h-full p-6 pt-4">
                {/* Template Info */}
                <div className="col-span-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge className={getStatusColor(template.status)}>
                          {template.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">v{template.version}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Category</div>
                          <div className="font-medium">{template.category}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Difficulty</div>
                          <div className={`font-medium capitalize ${getDifficultyColor(template.difficulty)}`}>
                            {template.difficulty || 'Not set'}
                          </div>
                        </div>
                        {template.estimatedDuration && (
                          <div>
                            <div className="text-muted-foreground">Duration</div>
                            <div className="font-medium flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {template.estimatedDuration}min
                            </div>
                          </div>
                        )}
                        {template.usageCount !== undefined && (
                          <div>
                            <div className="text-muted-foreground">Usage</div>
                            <div className="font-medium flex items-center gap-1">
                              <BarChart3 className="h-3 w-3" />
                              {template.usageCount} times
                            </div>
                          </div>
                        )}
                      </div>

                      {template.tags.length > 0 && (
                        <div>
                          <div className="text-sm text-muted-foreground mb-2">Tags</div>
                          <div className="flex flex-wrap gap-1">
                            {template.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {previewData && (
                        <div className="pt-4 border-t">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Layers className="h-3 w-3 text-muted-foreground" />
                              <span>{previewData.metadata.totalSections} sections</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <HelpCircle className="h-3 w-3 text-muted-foreground" />
                              <span>{previewData.metadata.totalQuestions} questions</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Form Preview */}
                <div className="col-span-8">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-base">Form Preview</CardTitle>
                      <CardDescription>
                        Interactive preview of the inspection form
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="flex items-center justify-center py-12">
                          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : previewData ? (
                        <ScrollArea className="h-96">
                          <div className="space-y-6">
                            {/* Header Items */}
                            {previewData.template.header_items && (
                              <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-4">
                                  Inspection Details
                                </h3>
                                <div className="space-y-4">
                                  {previewData.template.header_items.map((item: any) => 
                                    renderFormItem(item)
                                  )}
                                </div>
                                <Separator className="my-6" />
                              </div>
                            )}

                            {/* Main Items */}
                            {previewData.template.items && (
                              <div className="space-y-4">
                                {previewData.template.items.map((item: any) => 
                                  renderFormItem(item)
                                )}
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      ) : (
                        <div className="text-center py-12">
                          <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">Failed to load template preview</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="structure" className="mt-0 p-6 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Template Structure</CardTitle>
                  <CardDescription>
                    Hierarchical view of template components
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {previewData ? (
                    <ScrollArea className="h-96">
                      <div className="space-y-2">
                        {/* Header structure */}
                        <div className="text-sm font-medium text-muted-foreground mb-2">Header Items</div>
                        {previewData.template.header_items?.map((item: any) => (
                          <div key={item.item_id} className="flex items-center gap-2 p-2 border rounded">
                            {getItemIcon(item.type)}
                            <span className="flex-1">{item.label}</span>
                            <Badge variant="outline" className="text-xs">{item.type}</Badge>
                            {item.options?.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                          </div>
                        ))}
                        
                        <Separator className="my-4" />
                        
                        {/* Main structure */}
                        <div className="text-sm font-medium text-muted-foreground mb-2">Sections & Questions</div>
                        {previewData.template.items?.map((item: any) => (
                          <div key={item.item_id} className="space-y-1">
                            <div className="flex items-center gap-2 p-2 border rounded">
                              {getItemIcon(item.type)}
                              <span className="flex-1">{item.label}</span>
                              <Badge variant="outline" className="text-xs">{item.type}</Badge>
                            </div>
                            {item.items && (
                              <div className="ml-6 space-y-1">
                                {item.items.map((child: any) => (
                                  <div key={child.item_id} className="flex items-center gap-2 p-2 border rounded bg-muted/20">
                                    {getItemIcon(child.type)}
                                    <span className="flex-1">{child.label}</span>
                                    <Badge variant="outline" className="text-xs">{child.type}</Badge>
                                    {child.options?.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Loading structure...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="validation" className="mt-0 p-6 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Template Validation</CardTitle>
                  <CardDescription>
                    Check for issues and validation errors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {previewData ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        {previewData.valid ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-green-600 font-medium">Template is valid</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-5 w-5 text-red-600" />
                            <span className="text-red-600 font-medium">Template has validation errors</span>
                          </>
                        )}
                      </div>

                      {previewData.errors.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Validation Errors:</h4>
                          {previewData.errors.map((error, index) => (
                            <div key={index} className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded">
                              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                              <div>
                                <div className="text-sm font-medium text-red-800">
                                  {error.property}
                                </div>
                                <div className="text-sm text-red-600">
                                  {Object.values(error.constraints || {}).join(', ')}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {previewData.valid && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm">All required fields are properly configured</span>
                          </div>
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm">Template structure is valid</span>
                          </div>
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm">Ready for publication</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Validating template...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metadata" className="mt-0 p-6 pt-4">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Template Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Template ID</div>
                      <div className="font-mono text-sm">{template.templateId}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Created</div>
                      <div className="text-sm">{formatDate(template.createdAt)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Last Modified</div>
                      <div className="text-sm">{formatDate(template.updatedAt)}</div>
                    </div>
                    {template.createdBy && (
                      <div>
                        <div className="text-sm text-muted-foreground">Created By</div>
                        <div className="text-sm">{template.createdBy}</div>
                      </div>
                    )}
                    {template.lastModifiedBy && (
                      <div>
                        <div className="text-sm text-muted-foreground">Last Modified By</div>
                        <div className="text-sm">{template.lastModifiedBy}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Usage Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Uses</span>
                      <span className="font-medium">{template.usageCount || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Public Template</span>
                      <Badge variant={template.isPublic ? "default" : "secondary"}>
                        {template.isPublic ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Latest Version</span>
                      <Badge variant={template.isLatestVersion ? "default" : "secondary"}>
                        {template.isLatestVersion ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

