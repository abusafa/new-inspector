import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  Calendar,
  MapPin,
  FileCheck,
  Plus,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Wrench,
  Filter,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InspectionForReview {
  id: string;
  inspectionId: string;
  workOrderId: string;
  workOrderTitle: string;
  templateName: string;
  inspector: string;
  location?: string;
  completedAt: string;
  status: 'pending-review' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  maxScore: number;
  passed: boolean;
  findings: InspectionFinding[];
  result: any; // Full inspection result data
  reviewedBy?: string;
  reviewedAt?: string;
  approvalNotes?: string;
  correctiveActions?: CorrectiveAction[];
}

interface InspectionFinding {
  itemId: string;
  itemLabel: string;
  response: string;
  score: number | null;
  color: 'green' | 'red' | 'yellow' | 'grey';
  photos?: string[];
  notes?: string;
}

interface CorrectiveAction {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  dueDate?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: string;
}

export function ApprovalDashboard() {
  const { toast } = useToast();
  const [inspections, setInspections] = useState<InspectionForReview[]>([]);
  const [selectedInspection, setSelectedInspection] = useState<InspectionForReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [correctiveActions, setCorrectiveActions] = useState<CorrectiveAction[]>([]);
  const [newAction, setNewAction] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    assignedTo: '',
    dueDate: ''
  });

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    setLoading(true);
    try {
      // Mock data - in real app, this would come from API
      const mockInspections: InspectionForReview[] = [
        {
          id: '1',
          inspectionId: 'insp_001',
          workOrderId: 'wo_001',
          workOrderTitle: 'Daily Equipment Safety Check - Warehouse A',
          templateName: 'Daily Forklift Safety Check',
          inspector: 'John Smith',
          location: 'Warehouse A - Loading Dock',
          completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'pending-review',
          priority: 'high',
          score: 85,
          maxScore: 100,
          passed: true,
          findings: [
            {
              itemId: 'brake_check',
              itemLabel: 'Brake System Functionality',
              response: 'Pass - Brakes engage properly',
              score: 10,
              color: 'green'
            },
            {
              itemId: 'hydraulics_check',
              itemLabel: 'Hydraulic System Pressure',
              response: 'Fail - Low pressure detected',
              score: 0,
              color: 'red',
              notes: 'Pressure reading 1800 PSI, should be 2200+ PSI'
            }
          ],
          result: {}
        },
        {
          id: '2',
          inspectionId: 'insp_002',
          workOrderId: 'wo_002',
          workOrderTitle: 'Weekly Facility Safety Audit - Building B',
          templateName: 'General Safety Inspection',
          inspector: 'Sarah Johnson',
          location: 'Building B - Main Floor',
          completedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          status: 'pending-review',
          priority: 'critical',
          score: 65,
          maxScore: 100,
          passed: false,
          findings: [
            {
              itemId: 'fire_exits',
              itemLabel: 'Fire Exit Accessibility',
              response: 'Fail - Blocked exit door',
              score: 0,
              color: 'red',
              notes: 'Storage boxes blocking emergency exit in section C'
            },
            {
              itemId: 'lighting',
              itemLabel: 'Emergency Lighting',
              response: 'Pass - All lights functional',
              score: 10,
              color: 'green'
            }
          ],
          result: {}
        }
      ];
      
      setInspections(mockInspections);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load inspections for review",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredInspections = inspections.filter(inspection => {
    const matchesTab = activeTab === 'all' || inspection.status === (activeTab === 'pending' ? 'pending-review' : activeTab);
    const matchesSearch = !searchTerm || 
      inspection.workOrderTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.inspector.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || inspection.priority === priorityFilter;
    
    return matchesTab && matchesSearch && matchesPriority;
  });

  const handleApprove = async (inspection: InspectionForReview) => {
    try {
      // Update inspection status
      setInspections(prev => prev.map(insp => 
        insp.id === inspection.id 
          ? { 
              ...insp, 
              status: 'approved' as const,
              reviewedBy: 'Current User', // In real app, get from auth
              reviewedAt: new Date().toISOString(),
              approvalNotes
            }
          : insp
      ));

      toast({
        title: "Inspection Approved",
        description: `${inspection.templateName} has been approved`,
      });

      setApprovalNotes('');
      setSelectedInspection(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve inspection",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (inspection: InspectionForReview) => {
    try {
      // Update inspection status and add corrective actions
      setInspections(prev => prev.map(insp => 
        insp.id === inspection.id 
          ? { 
              ...insp, 
              status: 'rejected' as const,
              reviewedBy: 'Current User',
              reviewedAt: new Date().toISOString(),
              approvalNotes,
              correctiveActions
            }
          : insp
      ));

      toast({
        title: "Inspection Rejected",
        description: `${inspection.templateName} has been rejected with ${correctiveActions.length} corrective actions`,
      });

      setApprovalNotes('');
      setCorrectiveActions([]);
      setSelectedInspection(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject inspection",
        variant: "destructive",
      });
    }
  };

  const addCorrectiveAction = () => {
    if (!newAction.title || !newAction.description) {
      toast({
        title: "Error",
        description: "Title and description are required",
        variant: "destructive",
      });
      return;
    }

    const action: CorrectiveAction = {
      id: Date.now().toString(),
      ...newAction,
      status: 'pending',
      createdBy: 'Current User',
      createdAt: new Date().toISOString()
    };

    setCorrectiveActions(prev => [...prev, action]);
    setNewAction({
      title: '',
      description: '',
      priority: 'medium',
      assignedTo: '',
      dueDate: ''
    });
  };

  const removeCorrectiveAction = (actionId: string) => {
    setCorrectiveActions(prev => prev.filter(action => action.id !== actionId));
  };

  const getStatusColor = (status: InspectionForReview['status']) => {
    switch (status) {
      case 'pending-review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const InspectionCard = ({ inspection }: { inspection: InspectionForReview }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base line-clamp-1">{inspection.workOrderTitle}</CardTitle>
            <CardDescription className="text-sm">{inspection.templateName}</CardDescription>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <Badge className={getPriorityColor(inspection.priority)}>
              {inspection.priority}
            </Badge>
            <Badge className={getStatusColor(inspection.status)}>
              {inspection.status.replace('-', ' ')}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Inspector and Location */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-3 w-3 text-muted-foreground" />
            <span>{inspection.inspector}</span>
          </div>
          {inspection.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="truncate">{inspection.location}</span>
            </div>
          )}
        </div>

        {/* Score */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Score</span>
            <span className={`font-medium ${getScoreColor(inspection.score, inspection.maxScore)}`}>
              {inspection.score}/{inspection.maxScore} ({Math.round((inspection.score / inspection.maxScore) * 100)}%)
            </span>
          </div>
          <Progress value={(inspection.score / inspection.maxScore) * 100} className="h-2" />
          <div className="flex items-center gap-2 text-sm">
            {inspection.passed ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <span className={inspection.passed ? 'text-green-600' : 'text-red-600'}>
              {inspection.passed ? 'Passed' : 'Failed'}
            </span>
          </div>
        </div>

        {/* Findings Summary */}
        <div className="text-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-muted-foreground">Findings</span>
            <span>{inspection.findings.length} items</span>
          </div>
          <div className="flex gap-1">
            {inspection.findings.slice(0, 3).map((finding, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  finding.color === 'green' ? 'bg-green-500' :
                  finding.color === 'red' ? 'bg-red-500' :
                  finding.color === 'yellow' ? 'bg-yellow-500' :
                  'bg-gray-500'
                }`}
              />
            ))}
            {inspection.findings.length > 3 && (
              <span className="text-xs text-muted-foreground ml-1">
                +{inspection.findings.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Completed Time */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          Completed {formatDate(inspection.completedAt)}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => setSelectedInspection(inspection)}
              >
                <Eye className="h-3 w-3 mr-1" />
                Review
              </Button>
            </DialogTrigger>
            <ReviewDialog 
              inspection={selectedInspection}
              approvalNotes={approvalNotes}
              setApprovalNotes={setApprovalNotes}
              correctiveActions={correctiveActions}
              newAction={newAction}
              setNewAction={setNewAction}
              onAddAction={addCorrectiveAction}
              onRemoveAction={removeCorrectiveAction}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );

  const getTabCounts = () => {
    const pending = inspections.filter(i => i.status === 'pending-review').length;
    const approved = inspections.filter(i => i.status === 'approved').length;
    const rejected = inspections.filter(i => i.status === 'rejected').length;
    return { pending, approved, rejected, all: inspections.length };
  };

  const counts = getTabCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-muted-foreground">Loading inspections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Inspection Approvals</h1>
        <p className="text-muted-foreground">
          Review and approve completed inspections, create corrective actions for failed items
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{counts.pending}</div>
            <div className="text-sm text-muted-foreground">Pending Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{counts.approved}</div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{counts.rejected}</div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{counts.all}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inspections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setPriorityFilter('all');
            }}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inspections Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({counts.pending})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approved ({counts.approved})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Rejected ({counts.rejected})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            All ({counts.all})
          </TabsTrigger>
        </TabsList>

        {['pending', 'approved', 'rejected', 'all'].map(tab => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {filteredInspections.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Inspections</h3>
                  <p className="text-muted-foreground">
                    {tab === 'pending' 
                      ? "No inspections are pending review"
                      : `No ${tab} inspections found`
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredInspections.map(inspection => (
                  <InspectionCard key={inspection.id} inspection={inspection} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

// Review Dialog Component
function ReviewDialog({ 
  inspection, 
  approvalNotes, 
  setApprovalNotes, 
  correctiveActions,
  newAction,
  setNewAction,
  onAddAction,
  onRemoveAction,
  onApprove, 
  onReject 
}: {
  inspection: InspectionForReview | null;
  approvalNotes: string;
  setApprovalNotes: (notes: string) => void;
  correctiveActions: CorrectiveAction[];
  newAction: any;
  setNewAction: (action: any) => void;
  onAddAction: () => void;
  onRemoveAction: (id: string) => void;
  onApprove: (inspection: InspectionForReview) => void;
  onReject: (inspection: InspectionForReview) => void;
}) {
  if (!inspection) return null;

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{inspection.workOrderTitle}</DialogTitle>
        <DialogDescription>{inspection.templateName}</DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Inspection Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Inspector</Label>
            <p className="text-sm">{inspection.inspector}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Completed</Label>
            <p className="text-sm">{new Date(inspection.completedAt).toLocaleString()}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Score</Label>
            <p className="text-sm">
              {inspection.score}/{inspection.maxScore} ({Math.round((inspection.score / inspection.maxScore) * 100)}%)
            </p>
          </div>
          <div>
            <Label className="text-sm font-medium">Result</Label>
            <div className="flex items-center gap-2">
              {inspection.passed ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className={inspection.passed ? 'text-green-600' : 'text-red-600'}>
                {inspection.passed ? 'Passed' : 'Failed'}
              </span>
            </div>
          </div>
        </div>

        {/* Findings */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Inspection Findings</Label>
          <div className="space-y-3">
            {inspection.findings.map((finding, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                    finding.color === 'green' ? 'bg-green-500' :
                    finding.color === 'red' ? 'bg-red-500' :
                    finding.color === 'yellow' ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{finding.itemLabel}</p>
                    <p className="text-sm text-muted-foreground">{finding.response}</p>
                    {finding.notes && (
                      <p className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded mt-2">
                        {finding.notes}
                      </p>
                    )}
                    {finding.score !== null && (
                      <Badge variant="outline" className="mt-2">
                        {finding.score} points
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Approval Notes */}
        <div>
          <Label htmlFor="approval-notes" className="text-sm font-medium">
            Review Notes
          </Label>
          <Textarea
            id="approval-notes"
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
            placeholder="Add notes about your review decision..."
            className="mt-2"
          />
        </div>

        {/* Corrective Actions (for rejections) */}
        <div>
          <Label className="text-sm font-medium mb-3 block">
            Corrective Actions ({correctiveActions.length})
          </Label>
          
          {correctiveActions.map((action) => (
            <Card key={action.id} className="p-3 mb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getPriorityColor(action.priority)}>
                      {action.priority}
                    </Badge>
                    {action.assignedTo && (
                      <Badge variant="outline">
                        Assigned to: {action.assignedTo}
                      </Badge>
                    )}
                    {action.dueDate && (
                      <Badge variant="outline">
                        Due: {new Date(action.dueDate).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveAction(action.id)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}

          <Card className="p-3 bg-muted/50">
            <div className="grid gap-3">
              <Input
                placeholder="Action title..."
                value={newAction.title}
                onChange={(e) => setNewAction({ ...newAction, title: e.target.value })}
              />
              <Textarea
                placeholder="Action description..."
                value={newAction.description}
                onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
              />
              <div className="grid grid-cols-3 gap-2">
                <Select
                  value={newAction.priority}
                  onValueChange={(value) => setNewAction({ ...newAction, priority: value })}
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
                <Input
                  placeholder="Assigned to..."
                  value={newAction.assignedTo}
                  onChange={(e) => setNewAction({ ...newAction, assignedTo: e.target.value })}
                />
                <Input
                  type="date"
                  value={newAction.dueDate}
                  onChange={(e) => setNewAction({ ...newAction, dueDate: e.target.value })}
                />
              </div>
              <Button onClick={onAddAction} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Action
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <DialogFooter className="gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <ThumbsDown className="h-4 w-4" />
              Reject
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reject Inspection?</AlertDialogTitle>
              <AlertDialogDescription>
                This will reject the inspection and create {correctiveActions.length} corrective actions.
                The inspector will be notified and corrective work orders will be generated.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onReject(inspection)}>
                Reject & Create Actions
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4" />
              Approve
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Approve Inspection?</AlertDialogTitle>
              <AlertDialogDescription>
                This will approve the inspection and mark it as completed. 
                The work order status will be updated accordingly.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onApprove(inspection)}>
                Approve Inspection
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogFooter>
    </DialogContent>
  );
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'critical': return 'bg-red-500 text-white';
    case 'high': return 'bg-orange-500 text-white';
    case 'medium': return 'bg-yellow-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
}
