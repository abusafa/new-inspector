import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useInspections, useTemplates } from '@/hooks/useApi';
import { formatDate, formatDateTime } from '@/lib/utils';
import type { Inspection, InspectionTemplate } from '@/lib/api';
import { InspectionDetailModal } from '@/components/modals/InspectionDetailModal';
import { TemplateDetailModal } from '@/components/modals/TemplateDetailModal';
import { TemplateModal } from '@/components/modals/TemplateModal';
import { InspectionModal } from '@/components/modals/InspectionModal';
import { DeleteConfirmationDialog } from '@/components/modals/DeleteConfirmationDialog';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Settings,
  Copy,
  Download
} from 'lucide-react';

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

function TemplateCard({ 
  template, 
  onView,
  onEdit,
  onDelete
}: { 
  template: InspectionTemplate;
  onView: (template: InspectionTemplate) => void;
  onEdit: (template: InspectionTemplate) => void;
  onDelete: (template: InspectionTemplate) => void;
}) {
  const schema = template.schemaJson as any;
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
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <CardDescription className="text-sm">
              {template.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {totalQuestions} questions
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Template Stats */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-lg">{headerItemsCount}</div>
              <div className="text-muted-foreground">Header Items</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg">{sectionsCount}</div>
              <div className="text-muted-foreground">Sections</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg">{totalQuestions}</div>
              <div className="text-muted-foreground">Questions</div>
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Template ID:</span>
              <span className="font-mono text-xs">{template.templateId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Created:</span>
              <span>{formatDate(template.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Last Updated:</span>
              <span>{formatDate(template.updatedAt)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Inspection Template</span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onView(template)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-1" />
                Clone
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEdit(template)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDelete(template)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function InspectionsPage() {
  const { data: inspections, loading: inspectionsLoading, error: inspectionsError, refetch: refetchInspections } = useInspections();
  const { data: templates, loading: templatesLoading, error: templatesError, refetch: refetchTemplates } = useTemplates();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'inspections' | 'templates'>('inspections');
  const [inspectionDetailModalOpen, setInspectionDetailModalOpen] = useState(false);
  const [templateDetailModalOpen, setTemplateDetailModalOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<InspectionTemplate | null>(null);
  const [templateToEdit, setTemplateToEdit] = useState<InspectionTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<InspectionTemplate | null>(null);
  const [inspectionToEdit, setInspectionToEdit] = useState<Inspection | null>(null);

  const filteredInspections = inspections?.filter(inspection =>
    inspection.inspectionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inspection.status.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredTemplates = templates?.data?.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const loading = inspectionsLoading || templatesLoading;
  const error = inspectionsError || templatesError;

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;
    
    try {
      await api.templates.delete(templateToDelete.id);
      toast({
        title: "Template deleted",
        description: `"${templateToDelete.name}" has been deleted successfully.`,
      });
      refetchTemplates();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete template. Please try again.",
        variant: "destructive",
      });
      console.error('Failed to delete template:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Inspections</h1>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-full" />
                  <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Inspections</h1>
          <Button onClick={() => { refetchInspections(); refetchTemplates(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load data: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inspections</h1>
          <p className="text-muted-foreground">
            Templates, results, and analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => { refetchInspections(); refetchTemplates(); }} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => {
              if (activeTab === 'templates') {
                setTemplateToEdit(null);
                setTemplateModalOpen(true);
              } else {
                setInspectionToEdit(null);
                setInspectionModalOpen(true);
              }
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {activeTab === 'templates' ? 'Create Template' : 'New Inspection'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'inspections' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('inspections')}
          className="relative"
        >
          Inspections
          {inspections && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {inspections.length}
            </Badge>
          )}
        </Button>
        <Button
          variant={activeTab === 'templates' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('templates')}
          className="relative"
        >
          Templates
          {templates?.data && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {templates.data.length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
        {activeTab === 'templates' && (
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
      </div>

      {/* Stats */}
      {activeTab === 'inspections' && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{inspections?.length || 0}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">
                    {inspections?.filter(i => i.status === 'completed').length || 0}
                  </p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">
                    {inspections?.filter(i => i.status === 'in-progress').length || 0}
                  </p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Not Started</p>
                  <p className="text-2xl font-bold">
                    {inspections?.filter(i => i.status === 'not-started').length || 0}
                  </p>
                </div>
                <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content */}
      {activeTab === 'inspections' ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Inspection ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Completed At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInspections.map((inspection) => (
                <TableRow key={inspection.id}>
                  <TableCell>
                    <div className="font-mono text-sm">{inspection.inspectionId}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(inspection.status)}>
                      {inspection.status.replace('-', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {inspection.required ? (
                      <Badge variant="destructive">Required</Badge>
                    ) : (
                      <Badge variant="secondary">Optional</Badge>
                    )}
                  </TableCell>
                  <TableCell>{inspection.order}</TableCell>
                  <TableCell>
                    {inspection.completedAt ? formatDateTime(inspection.completedAt) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedInspection(inspection);
                          setInspectionDetailModalOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setInspectionToEdit(inspection);
                          setInspectionModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <TemplateCard 
              key={template.id} 
              template={template}
              onView={(template) => {
                setSelectedTemplate(template);
                setTemplateDetailModalOpen(true);
              }}
              onEdit={(template) => {
                setTemplateToEdit(template);
                setTemplateModalOpen(true);
              }}
              onDelete={(template) => {
                setTemplateToDelete(template);
                setDeleteDialogOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Empty States */}
      {activeTab === 'inspections' && filteredInspections.length === 0 && !inspectionsLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No inspections match your search.' : 'No inspections found.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'templates' && filteredTemplates.length === 0 && !templatesLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No templates match your search.' : 'No templates found.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <InspectionDetailModal
        open={inspectionDetailModalOpen}
        onOpenChange={setInspectionDetailModalOpen}
        inspection={selectedInspection}
      />

      <TemplateDetailModal
        open={templateDetailModalOpen}
        onOpenChange={setTemplateDetailModalOpen}
        template={selectedTemplate}
      />

      <TemplateModal
        open={templateModalOpen}
        onOpenChange={setTemplateModalOpen}
        template={templateToEdit}
        onSave={() => {
          refetchTemplates();
          setTemplateToEdit(null);
        }}
      />

      <InspectionModal
        open={inspectionModalOpen}
        onOpenChange={setInspectionModalOpen}
        inspection={inspectionToEdit}
        onSave={() => {
          refetchInspections();
          setInspectionToEdit(null);
        }}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Template"
        description="Are you sure you want to delete this template? This action cannot be undone and will remove all associated inspections."
        itemName={templateToDelete?.name}
        onConfirm={handleDeleteTemplate}
      />
    </div>
  );
}
