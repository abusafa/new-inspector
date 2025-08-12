import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WorkOrderDetail } from '@/components/WorkOrderDetail';
import { sampleWorkOrders } from '@/data/sampleWorkOrders';
import { sampleTemplate } from '@/data/sampleTemplate';
import { InspectionTemplate, WorkOrderInspection } from '@/types/inspection';

export function WorkOrderDetailPage() {
  const navigate = useNavigate();
  const { workOrderId } = useParams();

  const workOrder = useMemo(
    () => sampleWorkOrders.find((wo) => wo.work_order_id === workOrderId),
    [workOrderId]
  );

  const getTemplate = (templateId: string): InspectionTemplate | undefined => {
    return templateId === sampleTemplate.template_id ? sampleTemplate : undefined;
  };

  if (!workOrder) {
    navigate('/work-orders', { replace: true });
    return null;
  }

  const handleStartInspection = (inspection: WorkOrderInspection, _template: InspectionTemplate) => {
    navigate(`/work-orders/${workOrder.work_order_id}/inspections/${inspection.inspection_id}`);
  };

  return (
    <div className="container mx-auto px-3 py-3">
      <WorkOrderDetail
        workOrder={workOrder}
        onBack={() => navigate('/work-orders')}
        onStartInspection={handleStartInspection}
        getTemplate={getTemplate}
      />
    </div>
  );
}


