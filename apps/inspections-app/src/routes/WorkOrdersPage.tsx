import { useNavigate } from 'react-router-dom';
import { WorkOrderList } from '@/components/WorkOrderList';
import { sampleWorkOrders } from '@/data/sampleWorkOrders';
import { FileCheck } from 'lucide-react';

export function WorkOrdersPage() {
  const navigate = useNavigate();
  return (
    <div className="container mx-auto px-3 py-3">
      <div className="mb-4 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-600/90 text-white rounded-lg px-3 py-2">
          <FileCheck className="h-5 w-5" />
          <span className="text-sm font-semibold">Work Orders</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Manage and complete inspections</p>
      </div>

      <div className="max-w-3xl mx-auto">
        <WorkOrderList
          workOrders={sampleWorkOrders}
          onSelectWorkOrder={(wo) => navigate(`/work-orders/${wo.work_order_id}`)}
        />
      </div>
    </div>
  );
}


