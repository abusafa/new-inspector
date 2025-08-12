import React from 'react';
import { WorkOrderList } from '@/components/WorkOrderList';
import { sampleWorkOrders } from '@/data/sampleWorkOrders';
import { UserProfile } from '@/components/UserProfile';
import { FileCheck } from 'lucide-react';

export function WorkOrdersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-4">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 rounded-lg p-3">
                <FileCheck className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Work Orders</h1>
                <p className="text-muted-foreground text-sm">Welcome back</p>
              </div>
            </div>
            <UserProfile />
          </div>
          <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto">
            Manage your work orders and complete required safety inspections
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <WorkOrderList workOrders={sampleWorkOrders} onSelectWorkOrder={(wo) => {
            window.location.assign(`/work-orders/${wo.work_order_id}`);
          }} />
        </div>
      </div>
    </div>
  );
}


