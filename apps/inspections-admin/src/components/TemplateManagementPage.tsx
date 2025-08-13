import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { formatDate, formatDateTime } from '@/lib/utils';
import { TemplateBuilderModal } from '@/components/modals/TemplateBuilderModal';
import { TemplatePreviewModal } from '@/components/modals/TemplatePreviewModal';
import { TemplateVersionModal } from '@/components/modals/TemplateVersionModal';
import { DeleteConfirmationDialog } from '@/components/modals/DeleteConfirmationDialog';
import { TemplatePatternLibrary } from '@/components/TemplatePatternLibrary';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  Copy,
  Download,
  RefreshCw,
  Grid,
  List,
  Settings,
  Zap,
  CheckCircle,
  Clock,
  Archive,
  Star,
  Users,
  BarChart3,
  Tag,
  Calendar,
  Layers,
  BookOpen,
  TrendingUp,
  Award,
  GitBranch
} from 'lucide-react';

interface TemplateFilters {
  search: string;
  category: string;
  status: string;
  difficulty: string;
  industry: string;
  tags: string[];
  isPublic?: boolean;
}

export function TemplateManagementPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [templates, setTemplates] = useState<InspectionTemplate[]>([]);
  const [categories, setCategories] = useState<Array<{ name: string; count: number }>>([]);
  const [tags, setTags] = useState<Array<{ name: string; count: number }>>([]);
  const [patterns, setPatterns] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTemplate, setSelectedTemplate] = useState<InspectionTemplate | null>(null);
  
  // Modals
  const [builderModalOpen, setBuilderModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<InspectionTemplate | null>(null);
  
  // Filters
  const [filters, setFilters] = useState<TemplateFilters>({
    search: '',
    category: 'all',
    status: 'all',
    difficulty: 'all',
    industry: 'all',
    tags: [],
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTemplates, setTotalTemplates] = useState(0);
  
  useEffect(() => {
    loadTemplates();
    loadMetadata();
  }, [filters, currentPage]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const apiFilters = {
        ...filters,
        // Convert "all" values to undefined/empty for API
        category: filters.category === 'all' ? undefined : filters.category,
        status: filters.status === 'all' ? undefined : filters.status,
        difficulty: filters.difficulty === 'all' ? undefined : filters.difficulty,
        industry: filters.industry === 'all' ? undefined : filters.industry,
      };
      
      const response = await api.templates.list({
        ...apiFilters,
        page: currentPage,
        limit: 12,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      });
      
      setTemplates(response.data);
      setTotalPages(response.pagination.pages);
      setTotalTemplates(response.pagination.total);
    } catch (error) {
      toast({
        title: "Failed to load templates",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMetadata = async () => {
    try {
      const [categoriesRes, tagsRes, patternsRes] = await Promise.all([
        api.templates.categories(),
        api.templates.tags(),
        api.templateBuilder.getPatterns(),
      ]);
      
      setCategories(categoriesRes);
      setTags(tagsRes);
      setPatterns(patternsRes);
    } catch (error) {
      console.error('Failed to load metadata:', error);
    }
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setBuilderModalOpen(true);
  };

  const handleEditTemplate = (template: InspectionTemplate) => {
    setSelectedTemplate(template);
    setBuilderModalOpen(true);
  };

  const handlePreviewTemplate = (template: InspectionTemplate) => {
    setSelectedTemplate(template);
    setPreviewModalOpen(true);
  };

  const handleViewVersions = (template: InspectionTemplate) => {
    setSelectedTemplate(template);
    setVersionModalOpen(true);
  };

  const handleDuplicateTemplate = async (template: InspectionTemplate) => {
    try {
      await api.templates.duplicate(template.id, {
        name: `${template.name} (Copy)`,
        description: `Copy of ${template.description}`,
        category: template.category,
        createdBy: user?.id,
      });
      
      toast({
        title: "Template duplicated",
        description: "The template has been successfully duplicated.",
      });
      
      loadTemplates();
    } catch (error) {
      toast({
        title: "Failed to duplicate template",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;
    
    try {
      await api.templates.delete(templateToDelete.id);
      
      toast({
        title: "Template deleted",
        description: "The template has been successfully deleted.",
      });
      
      loadTemplates();
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    } catch (error) {
      toast({
        title: "Failed to delete template",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePublishTemplate = async (template: InspectionTemplate) => {
    try {
      await api.templates.publish(template.id, user?.id);
      
      toast({
        title: "Template published",
        description: "The template is now available for use.",
      });
      
      loadTemplates();
    } catch (error) {
      toast({
        title: "Failed to publish template",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleArchiveTemplate = async (template: InspectionTemplate) => {
    try {
      await api.templates.archive(template.id, user?.id);
      
      toast({
        title: "Template archived",
        description: "The template has been archived.",
      });
      
      loadTemplates();
    } catch (error) {
      toast({
        title: "Failed to archive template",
        description: "Please try again.",
        variant: "destructive",
      });
    }
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
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyIcon = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return <CheckCircle className="h-3 w-3" />;
      case 'medium':
        return <Clock className="h-3 w-3" />;
      case 'hard':
        return <Zap className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const TemplateCard = ({ template }: { template: InspectionTemplate }) => (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-2 mb-1">{template.name}</CardTitle>
            <CardDescription className="line-clamp-2">{template.description}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handlePreviewTemplate(template)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewVersions(template)}>
                <GitBranch className="h-4 w-4 mr-2" />
                Versions
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {template.status === 'draft' && (
                <DropdownMenuItem onClick={() => handlePublishTemplate(template)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Publish
                </DropdownMenuItem>
              )}
              {template.status === 'published' && (
                <DropdownMenuItem onClick={() => handleArchiveTemplate(template)}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => {
                  setTemplateToDelete(template);
                  setDeleteDialogOpen(true);
                }}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Status and Version */}
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(template.status)}>
              {template.status}
            </Badge>
            <span className="text-sm text-muted-foreground">v{template.version}</span>
          </div>

          {/* Category and Tags */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Tag className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm font-medium">{template.category}</span>
            </div>
            {template.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {template.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {template.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{template.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
            {template.difficulty && (
              <div className="flex items-center gap-1">
                {getDifficultyIcon(template.difficulty)}
                <span className="capitalize">{template.difficulty}</span>
              </div>
            )}
            {template.estimatedDuration && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{template.estimatedDuration}min</span>
              </div>
            )}
            {template.usageCount !== undefined && (
              <div className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                <span>{template.usageCount} uses</span>
              </div>
            )}
            {template.isPublic && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>Public</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
            <span>Updated {formatDate(template.updatedAt)}</span>
            {template.createdBy && (
              <span>by {template.createdBy}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Layers className="h-6 w-6" />
            Template Management
          </h1>
          <p className="text-muted-foreground">
            Create, manage, and organize inspection templates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadTemplates} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={handleCreateTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Templates</p>
                <p className="text-2xl font-bold">{totalTemplates}</p>
              </div>
              <Layers className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">
                  {templates.filter(t => t.status === 'published').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
              <Tag className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Usage</p>
                <p className="text-2xl font-bold">
                  {Math.round(templates.reduce((sum, t) => sum + (t.usageCount || 0), 0) / templates.length || 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="patterns">Quick Start</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid gap-4 md:grid-cols-6">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search templates..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.name} value={category.name}>
                        {category.name} ({category.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.difficulty} onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Templates Grid */}
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-6 bg-muted rounded animate-pulse" />
                      <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                      <div className="h-20 bg-muted rounded animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {templates.map(template => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!loading && templates.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                  <p className="text-muted-foreground mb-4">
                    {filters.search || filters.category || filters.status 
                      ? 'Try adjusting your filters or search terms.'
                      : 'Create your first template to get started.'
                    }
                  </p>
                  <Button onClick={handleCreateTemplate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <TemplatePatternLibrary 
            onSelectPattern={(patternId) => {
              if (patternId) {
                // Handle pattern selection - could navigate to builder with pattern
                navigate(`/templates/builder/new?pattern=${patternId}`);
              } else {
                // Create from scratch
                handleCreateTemplate();
              }
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <TemplateBuilderModal
        open={builderModalOpen}
        onOpenChange={setBuilderModalOpen}
        template={selectedTemplate}
        onSave={() => {
          loadTemplates();
          setBuilderModalOpen(false);
        }}
      />

      <TemplatePreviewModal
        open={previewModalOpen}
        onOpenChange={setPreviewModalOpen}
        template={selectedTemplate}
      />

      <TemplateVersionModal
        open={versionModalOpen}
        onOpenChange={setVersionModalOpen}
        template={selectedTemplate}
        onVersionCreated={loadTemplates}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Template"
        description="Are you sure you want to delete this template? This action cannot be undone."
        itemName={templateToDelete?.name}
        onConfirm={handleDeleteTemplate}
      />
    </div>
  );
}

