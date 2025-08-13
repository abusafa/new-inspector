import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { api, type InspectionTemplate } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, formatDateTime } from '@/lib/utils';
import { 
  GitBranch,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  Download,
  Copy,
  MoreHorizontal,
  Tag,
  Calendar,
  FileText,
  Zap,
  Star,
  TrendingUp,
  ArrowRight,
  History
} from 'lucide-react';

interface TemplateVersionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: InspectionTemplate | null;
  onVersionCreated?: () => void;
}

interface TemplateVersion {
  id: string;
  version: string;
  name: string;
  description: string;
  createdAt: string;
  createdBy: string;
  status: 'draft' | 'published' | 'archived';
  isLatestVersion: boolean;
  usageCount: number;
  changes?: string[];
  metadata?: {
    totalQuestions: number;
    totalSections: number;
    estimatedDuration?: number;
  };
}

export function TemplateVersionModal({ open, onOpenChange, template, onVersionCreated }: TemplateVersionModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [versions, setVersions] = useState<TemplateVersion[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newVersionData, setNewVersionData] = useState({
    version: '',
    description: '',
  });

  useEffect(() => {
    if (open && template) {
      loadVersions();
    }
  }, [open, template]);

  const loadVersions = async () => {
    if (!template) return;

    try {
      setLoading(true);
      const versionsData = await api.templates.versions(template.id);
      
      // Mock data structure - replace with actual API response
      const mockVersions: TemplateVersion[] = [
        {
          id: template.id,
          version: template.version,
          name: template.name,
          description: template.description,
          createdAt: template.updatedAt,
          createdBy: template.lastModifiedBy || 'System',
          status: template.status,
          isLatestVersion: template.isLatestVersion,
          usageCount: template.usageCount || 0,
          changes: ['Updated safety protocols', 'Added new inspection points', 'Improved scoring logic'],
          metadata: {
            totalQuestions: 15,
            totalSections: 4,
            estimatedDuration: template.estimatedDuration,
          }
        },
        {
          id: `${template.id}-v2`,
          version: '2.1.0',
          name: template.name,
          description: 'Enhanced version with additional safety checks',
          createdAt: '2024-01-10T10:00:00Z',
          createdBy: 'Sarah Johnson',
          status: 'published',
          isLatestVersion: false,
          usageCount: 1247,
          changes: ['Added equipment serial tracking', 'Enhanced photo requirements', 'Updated compliance standards'],
          metadata: {
            totalQuestions: 12,
            totalSections: 3,
            estimatedDuration: 12,
          }
        },
        {
          id: `${template.id}-v1`,
          version: '1.0.0',
          name: template.name,
          description: 'Initial version of the template',
          createdAt: '2023-12-15T14:30:00Z',
          createdBy: 'Mike Wilson',
          status: 'archived',
          isLatestVersion: false,
          usageCount: 3421,
          changes: ['Initial template creation', 'Basic safety checklist', 'Standard scoring system'],
          metadata: {
            totalQuestions: 10,
            totalSections: 3,
            estimatedDuration: 10,
          }
        }
      ];
      
      setVersions(mockVersions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      toast({
        title: "Failed to load versions",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVersion = async () => {
    if (!template || !newVersionData.version.trim()) return;

    try {
      setLoading(true);
      await api.templates.createVersion(template.id, {
        version: newVersionData.version,
        createdBy: user?.id,
      });
      
      toast({
        title: "New version created",
        description: `Version ${newVersionData.version} has been created successfully.`,
      });
      
      setShowCreateForm(false);
      setNewVersionData({ version: '', description: '' });
      loadVersions();
      onVersionCreated?.();
    } catch (error) {
      toast({
        title: "Failed to create version",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  const getVersionIcon = (version: TemplateVersion) => {
    if (version.isLatestVersion) return <Star className="h-4 w-4 text-yellow-500" />;
    if (version.status === 'published') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (version.status === 'archived') return <Clock className="h-4 w-4 text-gray-500" />;
    return <FileText className="h-4 w-4 text-blue-500" />;
  };

  const suggestNextVersion = () => {
    if (versions.length === 0) return '1.0.0';
    
    const latestVersion = versions.find(v => v.isLatestVersion)?.version || '1.0.0';
    const [major, minor, patch] = latestVersion.split('.').map(Number);
    
    return `${major}.${minor}.${patch + 1}`;
  };

  const VersionCard = ({ version }: { version: TemplateVersion }) => (
    <Card className={`${version.isLatestVersion ? 'ring-2 ring-blue-200 bg-blue-50/30' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {getVersionIcon(version)}
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">v{version.version}</CardTitle>
                {version.isLatestVersion && (
                  <Badge variant="default" className="text-xs">
                    Latest
                  </Badge>
                )}
                <Badge className={getStatusColor(version.status)}>
                  {version.status}
                </Badge>
              </div>
              <CardDescription className="text-sm mt-1">
                {version.description}
              </CardDescription>
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="h-3 w-3" />
              <span>{version.usageCount.toLocaleString()} uses</span>
            </div>
            <div>{formatDate(version.createdAt)}</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Metadata */}
        {version.metadata && (
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3 text-muted-foreground" />
              <span>{version.metadata.totalSections} sections</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-muted-foreground" />
              <span>{version.metadata.totalQuestions} questions</span>
            </div>
            {version.metadata.estimatedDuration && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span>{version.metadata.estimatedDuration}min</span>
              </div>
            )}
          </div>
        )}

        {/* Changes */}
        {version.changes && version.changes.length > 0 && (
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">Changes in this version:</div>
            <ul className="space-y-1">
              {version.changes.slice(0, 3).map((change, index) => (
                <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                  <div className="w-1 h-1 bg-muted-foreground rounded-full mt-1.5 flex-shrink-0" />
                  <span>{change}</span>
                </li>
              ))}
              {version.changes.length > 3 && (
                <li className="text-xs text-muted-foreground">
                  +{version.changes.length - 3} more changes
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Creator */}
        <div className="pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>Created by {version.createdBy}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              <Copy className="h-3 w-3 mr-1" />
              Clone
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Template Versions
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage versions of "{template.name}"
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateForm(!showCreateForm)}
                disabled={loading}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Version
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-6 pt-4">
          {/* Create Version Form */}
          {showCreateForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">Create New Version</CardTitle>
                <CardDescription>
                  Create a new version of this template with your changes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Version Number</Label>
                    <Input
                      value={newVersionData.version}
                      onChange={(e) => setNewVersionData(prev => ({ ...prev, version: e.target.value }))}
                      placeholder={suggestNextVersion()}
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      Suggested: {suggestNextVersion()}
                    </div>
                  </div>
                  <div>
                    <Label>Release Date</Label>
                    <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                  </div>
                </div>
                
                <div>
                  <Label>Version Description</Label>
                  <Textarea
                    value={newVersionData.description}
                    onChange={(e) => setNewVersionData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the changes in this version..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button onClick={handleCreateVersion} disabled={loading || !newVersionData.version.trim()}>
                    Create Version
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Version History */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <History className="h-5 w-5" />
                Version History
              </h3>
              <div className="text-sm text-muted-foreground">
                {versions.length} version{versions.length !== 1 ? 's' : ''}
              </div>
            </div>

            <ScrollArea className="h-96">
              <div className="space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-6">
                          <div className="space-y-3">
                            <div className="h-6 bg-muted rounded animate-pulse" />
                            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                            <div className="h-16 bg-muted rounded animate-pulse" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : versions.length > 0 ? (
                  versions.map((version) => (
                    <VersionCard key={version.id} version={version} />
                  ))
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No versions found</h3>
                        <p className="text-muted-foreground mb-4">
                          This template doesn't have any version history yet.
                        </p>
                        <Button onClick={() => setShowCreateForm(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Version
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
