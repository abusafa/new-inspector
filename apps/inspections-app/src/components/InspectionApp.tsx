import { useState, useCallback } from 'react';
import { FileCheck, ArrowLeft, Loader2, ClipboardList, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InspectionTemplate, InspectionResult, WorkOrder, WorkOrderInspection } from '@/types/inspection';

import { DynamicFormRenderer } from './DynamicFormRenderer';
import { InspectionResults } from './InspectionResults';
import { WorkOrderList } from './WorkOrderList';
import { WorkOrderDetail } from './WorkOrderDetail';
import { MyAssignedWork } from './MyAssignedWork';
import { ProfilePage } from './ProfilePage';
import { LoginScreen } from './LoginScreen';
import { UserProfile } from './UserProfile';
import { OfflineStatusBar } from './OfflineStatusBar';
import { useAuth } from '@/hooks/useAuth';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { sampleTemplate } from '@/data/sampleTemplate';
import { sampleWorkOrders } from '@/data/sampleWorkOrders';

type AppState = 'my-work' | 'work-orders' | 'work-order-detail' | 'inspection' | 'results' | 'profile';

export function InspectionApp() {
  const { user, isLoading, login } = useAuth();
  const { downloadForOffline } = useOfflineSync();
  const [currentState, setCurrentState] = useState<AppState>('my-work');
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [selectedInspection, setSelectedInspection] = useState<WorkOrderInspection | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<InspectionTemplate | null>(null);
  const [inspectionResult, setInspectionResult] = useState<InspectionResult | null>(null);

  const handleWorkOrderSelect = useCallback((workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
    setCurrentState('work-order-detail');
  }, []);

  const handleStartInspection = useCallback((inspection: WorkOrderInspection, template: InspectionTemplate) => {
    setSelectedInspection(inspection);
    setSelectedTemplate(template);
    setCurrentState('inspection');
  }, []);

  const handleInspectionComplete = useCallback((result: InspectionResult) => {
    setInspectionResult(result);
    setCurrentState('results');
  }, []);

  const handleBackToWorkOrders = useCallback(() => {
    setCurrentState('my-work');
    setSelectedWorkOrder(null);
    setSelectedInspection(null);
    setSelectedTemplate(null);
    setInspectionResult(null);
  }, []);

  const handleBackToWorkOrderDetail = useCallback(() => {
    setCurrentState('work-order-detail');
    setSelectedInspection(null);
    setSelectedTemplate(null);
  }, []);

  const handleNewInspection = useCallback(() => {
    setCurrentState('my-work');
    setSelectedWorkOrder(null);
    setSelectedInspection(null);
    setSelectedTemplate(null);
    setInspectionResult(null);
  }, []);

  const handleStartDirectInspection = useCallback((workOrder: WorkOrder, inspection: WorkOrderInspection) => {
    setSelectedWorkOrder(workOrder);
    setSelectedInspection(inspection);
    const template = getTemplate(inspection.template_id);
    if (template) {
      setSelectedTemplate(template);
      setCurrentState('inspection');
    }
  }, [getTemplate]);

  const handleShowProfile = useCallback(() => {
    setCurrentState('profile');
  }, []);

  const getTemplate = useCallback((templateId: string): InspectionTemplate | undefined => {
    // In a real app, this would fetch from an API or database
    if (templateId === sampleTemplate.template_id) {
      return sampleTemplate;
    }
    return undefined;
  }, []);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    return <LoginScreen onLogin={login} />;
  }

  if (currentState === 'inspection' && selectedTemplate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6 flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleBackToWorkOrderDetail}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Work Order
            </Button>
            <div className="ml-auto">
              <UserProfile onProfileClick={handleShowProfile} />
            </div>
          </div>
          <DynamicFormRenderer
            template={selectedTemplate}
            onComplete={handleInspectionComplete}
          />
        </div>
      </div>
    );
  }

  if (currentState === 'results' && inspectionResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6 flex items-center justify-end">
            <UserProfile onProfileClick={handleShowProfile} />
          </div>
          <InspectionResults
            result={inspectionResult}
            onNewInspection={handleNewInspection}
            onBackToTemplates={handleBackToWorkOrders}
          />
        </div>
      </div>
    );
  }

  if (currentState === 'work-order-detail' && selectedWorkOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6 flex items-center justify-end">
            <UserProfile onProfileClick={handleShowProfile} />
          </div>
          <WorkOrderDetail
            workOrder={selectedWorkOrder}
            onBack={handleBackToWorkOrders}
            onStartInspection={handleStartInspection}
            getTemplate={getTemplate}
          />
        </div>
      </div>
    );
  }

  if (currentState === 'profile') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-6">
          <ProfilePage onBack={handleBackToWorkOrders} />
        </div>
      </div>
    );
  }

  // Get user's role to determine interface
  const userRole = user?.role?.toLowerCase() || 'inspector';
  const isInspector = userRole === 'inspector' || userRole === 'technician';
  
  // Count assigned work for inspector
  const myWorkCount = sampleWorkOrders.filter(wo => wo.assigned_to === user?.name).length;
  const overdueCount = sampleWorkOrders.filter(wo => 
    wo.assigned_to === user?.name && 
    wo.due_date && 
    new Date(wo.due_date) < new Date() && 
    wo.status !== 'completed'
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <OfflineStatusBar />
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 rounded-lg p-3">
                {isInspector ? <ClipboardList className="h-8 w-8 text-white" /> : <FileCheck className="h-8 w-8 text-white" />}
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {isInspector ? 'My Inspections' : 'Work Orders'}
                </h1>
                <p className="text-muted-foreground text-sm">
                  Welcome back, {user.name}
                  {isInspector && (
                    <Badge variant="secondary" className="ml-2">
                      {user.role}
                    </Badge>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isInspector && overdueCount > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  {overdueCount} Overdue
                </Badge>
              )}
              <UserProfile onProfileClick={handleShowProfile} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto">
            {isInspector 
              ? `You have ${myWorkCount} work orders assigned to you`
              : 'Manage your work orders and complete required safety inspections'
            }
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {isInspector ? (
            <Tabs value={currentState === 'my-work' ? 'my-work' : 'all-work'} onValueChange={(value) => {
              if (value === 'my-work') setCurrentState('my-work');
              else setCurrentState('work-orders');
            }}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="my-work" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  My Work ({myWorkCount})
                </TabsTrigger>
                <TabsTrigger value="all-work" className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  All Work Orders
                </TabsTrigger>
              </TabsList>

              <TabsContent value="my-work">
                <MyAssignedWork
                  workOrders={sampleWorkOrders}
                  onSelectWorkOrder={handleWorkOrderSelect}
                  onStartInspection={handleStartDirectInspection}
                />
              </TabsContent>

              <TabsContent value="all-work">
                <WorkOrderList
                  workOrders={sampleWorkOrders}
                  onSelectWorkOrder={handleWorkOrderSelect}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <WorkOrderList
              workOrders={sampleWorkOrders}
              onSelectWorkOrder={handleWorkOrderSelect}
            />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-muted-foreground text-xs">
          <p>
            {isInspector 
              ? 'Complete your safety inspections efficiently and safely'
              : 'Streamline your safety inspections with organized work orders'
            }
          </p>
        </div>
      </div>
    </div>
  );
}