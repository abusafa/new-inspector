import React, { useState, useCallback } from 'react';
import { FileCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InspectionTemplate, InspectionResult, WorkOrder, WorkOrderInspection } from '@/types/inspection';
import { InspectionForm } from './InspectionForm';
import { InspectionResults } from './InspectionResults';
import { WorkOrderList } from './WorkOrderList';
import { WorkOrderDetail } from './WorkOrderDetail';
import { ProfilePage } from './ProfilePage';
import { LoginScreen } from './LoginScreen';
import { UserProfile } from './UserProfile';
import { useAuth } from '@/hooks/useAuth';
import { sampleTemplate } from '@/data/sampleTemplate';
import { sampleWorkOrders } from '@/data/sampleWorkOrders';
import { formatDateTime } from '@/utils/dateFormatter';

type AppState = 'work-orders' | 'work-order-detail' | 'inspection' | 'results' | 'profile';

export function InspectionApp() {
  const { user, isLoading, login } = useAuth();
  const [currentState, setCurrentState] = useState<AppState>('work-orders');
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
    setCurrentState('work-orders');
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
    setCurrentState('work-orders');
    setSelectedWorkOrder(null);
    setSelectedInspection(null);
    setSelectedTemplate(null);
    setInspectionResult(null);
  }, []);

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
          <InspectionForm
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 rounded-lg p-3">
                <FileCheck className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Work Orders</h1>
                <p className="text-muted-foreground text-sm">
                  Welcome back, {user.name}
                </p>
              </div>
            </div>
            <UserProfile onProfileClick={handleShowProfile} />
          </div>
          <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto">
            Manage your work orders and complete required safety inspections
          </p>
        </div>

        {/* Work Orders List */}
        <div className="max-w-4xl mx-auto">
          <WorkOrderList
            workOrders={sampleWorkOrders}
            onSelectWorkOrder={handleWorkOrderSelect}
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-muted-foreground text-xs">
          <p>Streamline your safety inspections with organized work orders</p>
        </div>
      </div>
    </div>
  );
}