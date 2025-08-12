import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/lib/utils';
import type { InspectionTemplate } from '@/lib/api';
import { 
  FileText, 
  Calendar, 
  Settings,
  Copy,
  Download,
  ExternalLink,
  Eye,
  Code,
  List,
  HelpCircle,
  CheckSquare,
  Type,
  Image,
  FileSignature
} from 'lucide-react';

interface TemplateDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: InspectionTemplate | null;
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
        <pre className="text-xs overflow-x-auto max-h-60">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}

function getItemIcon(itemType: string) {
  switch (itemType?.toLowerCase()) {
    case 'question':
      return HelpCircle;
    case 'checkbox':
      return CheckSquare;
    case 'text':
      return Type;
    case 'signature':
      return FileSignature;
    case 'media':
      return Image;
    default:
      return FileText;
  }
}

function TemplateStructureView({ schema }: { schema: any }) {
  if (!schema) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No schema structure available</p>
      </div>
    );
  }

  const headerItems = schema.header_items || [];
  const sections = schema.items || [];

  return (
    <div className="space-y-6">
      {/* Header Items */}
      {headerItems.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <List className="h-4 w-4" />
              Header Items ({headerItems.length})
            </CardTitle>
            <CardDescription>
              Information collected at the beginning of the inspection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {headerItems.map((item: any, index: number) => {
                const Icon = getItemIcon(item.type);
                return (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.label || item.title || `Item ${index + 1}`}</span>
                        {item.type && (
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      )}
                      {item.options && (
                        <div className="text-xs text-muted-foreground">
                          Options: {Array.isArray(item.options) ? item.options.join(', ') : 'Custom options'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sections */}
      {sections.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Sections ({sections.length})
            </CardTitle>
            <CardDescription>
              Main inspection sections and their questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sections.map((section: any, sectionIndex: number) => {
                const sectionItems = section.items || [];
                const questionCount = sectionItems.filter((item: any) => item.type === 'question').length;
                
                return (
                  <div key={sectionIndex} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{section.label || section.title || `Section ${sectionIndex + 1}`}</h4>
                        {section.description && (
                          <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                        )}
                      </div>
                      <Badge variant="secondary">
                        {questionCount} questions
                      </Badge>
                    </div>
                    
                    {sectionItems.length > 0 && (
                      <div className="space-y-2">
                        {sectionItems.map((item: any, itemIndex: number) => {
                          const Icon = getItemIcon(item.type);
                          return (
                            <div key={itemIndex} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
                              <Icon className="h-3 w-3 text-muted-foreground mt-1" />
                              <div className="flex-1 text-sm">
                                <div className="flex items-center gap-2">
                                  <span>{item.label || item.title || `Item ${itemIndex + 1}`}</span>
                                  {item.type && (
                                    <Badge variant="outline" className="text-xs h-4">
                                      {item.type}
                                    </Badge>
                                  )}
                                  {item.required && (
                                    <Badge variant="destructive" className="text-xs h-4">
                                      Required
                                    </Badge>
                                  )}
                                </div>
                                {item.description && (
                                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {headerItems.length === 0 && sections.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No structured content found in template schema</p>
        </div>
      )}
    </div>
  );
}

export function TemplateDetailModal({ open, onOpenChange, template }: TemplateDetailModalProps) {
  if (!template) return null;

  const schema = template.schemaJson;
  const headerItemsCount = schema?.header_items?.length || 0;
  const sectionsCount = schema?.items?.length || 0;
  
  // Count total questions
  let totalQuestions = 0;
  if (schema?.items) {
    schema.items.forEach((section: any) => {
      if (section.items) {
        totalQuestions += section.items.filter((item: any) => item.type === 'question').length;
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Template Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">{template.name}</h3>
              <p className="text-muted-foreground">{template.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>ID: {template.templateId}</span>
                <span>•</span>
                <span>{totalQuestions} questions</span>
                <span>•</span>
                <span>{sectionsCount} sections</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Clone
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <Separator />

          {/* Template Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Header Items</p>
                    <p className="text-2xl font-bold">{headerItemsCount}</p>
                  </div>
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <List className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Sections</p>
                    <p className="text-2xl font-bold">{sectionsCount}</p>
                  </div>
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Questions</p>
                    <p className="text-2xl font-bold">{totalQuestions}</p>
                  </div>
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <HelpCircle className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="text-sm font-medium">{formatDate(template.createdAt)}</p>
                    <p className="text-xs text-muted-foreground">Updated {formatDate(template.updatedAt)}</p>
                  </div>
                  <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Template Content */}
          <Tabs defaultValue="structure" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="structure" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Structure View
              </TabsTrigger>
              <TabsTrigger value="raw" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Raw Schema
              </TabsTrigger>
            </TabsList>
            <TabsContent value="structure" className="mt-6">
              <TemplateStructureView schema={schema} />
            </TabsContent>
            <TabsContent value="raw" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Template Schema (JSON)</CardTitle>
                  <CardDescription>
                    Raw JSON schema defining the template structure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <JsonViewer data={schema} title="Template Schema" />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Template ID: {template.templateId}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Clone Template
              </Button>
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Edit Template
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
