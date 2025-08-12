import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { InspectionForm } from '@/components/InspectionForm';
import { sampleWorkOrders } from '@/data/sampleWorkOrders';
import { sampleTemplate } from '@/data/sampleTemplate';
import { InspectionResult } from '@/types/inspection';

export function InspectionPage() {
  const navigate = useNavigate();
  const { workOrderId, inspectionId } = useParams();

  const { inspection, template } = useMemo(() => {
    const workOrder = sampleWorkOrders.find((wo) => wo.work_order_id === workOrderId);
    const ins = workOrder?.inspections.find((i) => i.inspection_id === inspectionId);
    const tmpl = ins && ins.template_id === sampleTemplate.template_id ? sampleTemplate : undefined;
    return { inspection: ins, template: tmpl } as const;
  }, [workOrderId, inspectionId]);

  if (!inspection || !template) {
    navigate(`/work-orders/${workOrderId}`, { replace: true });
    return null;
  }

  const handleComplete = (result: InspectionResult) => {
    try {
      sessionStorage.setItem(`inspection_result_${inspectionId}`, JSON.stringify(result));
    } catch {}
    navigate(`/results/${inspectionId}`);
  };

  return (
    <div className="container mx-auto px-3 py-3">
      <div className="mb-4">
        <Button
          variant="outline"
          onClick={() => navigate(`/work-orders/${workOrderId}`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Work Order
        </Button>
      </div>
      <InspectionForm template={template} onComplete={handleComplete} />
    </div>
  );
}


