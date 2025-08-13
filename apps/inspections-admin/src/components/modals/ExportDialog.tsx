import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  FileText, 
  Database,
  FileSpreadsheet,
  FileCode,
  Users,
  FileCheck,
  ClipboardList,
  Settings,
  Calendar,
  BarChart3
} from 'lucide-react';
import {
  exportUsersToCSV,
  exportWorkOrdersToCSV,
  exportInspectionsToCSV,
  exportTemplatesToCSV,
  exportUsersToJSON,
  exportWorkOrdersToJSON,
  exportInspectionsToJSON,
  exportTemplatesToJSON,
  exportAllData,
  generateReportData
} from '@/utils/dataExport';
import type { User, WorkOrder, Inspection, InspectionTemplate } from '@/lib/api';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: {
    users?: User[];
    workOrders?: WorkOrder[];
    inspections?: Inspection[];
    templates?: InspectionTemplate[];
  };
  type?: 'users' | 'workOrders' | 'inspections' | 'templates' | 'all';
}

export function ExportDialog({ open, onOpenChange, data, type = 'all' }: ExportDialogProps) {
  const { toast } = useToast();
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json' | 'report'>('csv');
  const [exporting, setExporting] = useState(false);

  const handleExport = async (exportType: 'users' | 'workOrders' | 'inspections' | 'templates' | 'all', format: string) => {
    setExporting(true);
    
    try {
      switch (exportType) {
        case 'users':
          if (!data.users || data.users.length === 0) {
            throw new Error('No users data available');
          }
          if (format === 'csv') {
            exportUsersToCSV(data.users);
          } else if (format === 'json') {
            exportUsersToJSON(data.users);
          }
          break;
          
        case 'workOrders':
          if (!data.workOrders || data.workOrders.length === 0) {
            throw new Error('No work orders data available');
          }
          if (format === 'csv') {
            exportWorkOrdersToCSV(data.workOrders);
          } else if (format === 'json') {
            exportWorkOrdersToJSON(data.workOrders);
          }
          break;
          
        case 'inspections':
          if (!data.inspections || data.inspections.length === 0) {
            throw new Error('No inspections data available');
          }
          if (format === 'csv') {
            exportInspectionsToCSV(data.inspections);
          } else if (format === 'json') {
            exportInspectionsToJSON(data.inspections);
          }
          break;
          
        case 'templates':
          if (!data.templates || data.templates.length === 0) {
            throw new Error('No templates data available');
          }
          if (format === 'csv') {
            exportTemplatesToCSV(data.templates);
          } else if (format === 'json') {
            exportTemplatesToJSON(data.templates);
          }
          break;
          
        case 'all':
          if (format === 'json') {
            exportAllData(
              data.users || [],
              data.workOrders || [],
              data.inspections || [],
              data.templates || []
            );
          } else {
            // Export each type separately for CSV
            if (data.users?.length) exportUsersToCSV(data.users);
            if (data.workOrders?.length) exportWorkOrdersToCSV(data.workOrders);
            if (data.inspections?.length) exportInspectionsToCSV(data.inspections);
            if (data.templates?.length) exportTemplatesToCSV(data.templates);
          }
          break;
      }

      toast({
        title: "Export successful",
        description: `Data has been exported as ${format.toUpperCase()} file(s).`,
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export data. Please try again.",
        variant: "destructive",
      });
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const getDataStats = () => {
    return {
      users: data.users?.length || 0,
      workOrders: data.workOrders?.length || 0,
      inspections: data.inspections?.length || 0,
      templates: data.templates?.length || 0,
    };
  };

  const stats = getDataStats();
  const totalRecords = Object.values(stats).reduce((sum, count) => sum + count, 0);

  const renderDataTypeCard = (
    dataType: 'users' | 'workOrders' | 'inspections' | 'templates',
    icon: React.ReactNode,
    title: string,
    count: number,
    description: string
  ) => (
    <Card className={count === 0 ? 'opacity-50' : 'hover:shadow-md transition-shadow cursor-pointer'}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          <Badge variant={count > 0 ? "default" : "secondary"}>
            {count} records
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={count === 0 || exporting}
            onClick={() => handleExport(dataType, selectedFormat)}
            className="flex-1"
          >
            <Download className="h-3 w-3 mr-1" />
            Export {selectedFormat.toUpperCase()}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </DialogTitle>
        </DialogHeader>

        <Tabs value={selectedFormat} onValueChange={(value) => setSelectedFormat(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="csv" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              CSV
            </TabsTrigger>
            <TabsTrigger value="json" className="flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              JSON
            </TabsTrigger>
            <TabsTrigger value="report" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Report
            </TabsTrigger>
          </TabsList>

          <TabsContent value="csv" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">CSV Export</CardTitle>
                <CardDescription>
                  Export data as comma-separated values files, perfect for spreadsheet applications like Excel.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Data type selection */}
            <div className="grid gap-4 md:grid-cols-2">
              {renderDataTypeCard(
                'users',
                <Users className="h-4 w-4 text-blue-600" />,
                'Users',
                stats.users,
                'Export user accounts and profile information'
              )}
              {renderDataTypeCard(
                'workOrders',
                <FileCheck className="h-4 w-4 text-green-600" />,
                'Work Orders',
                stats.workOrders,
                'Export work orders with assignments and status'
              )}
              {renderDataTypeCard(
                'inspections',
                <ClipboardList className="h-4 w-4 text-purple-600" />,
                'Inspections',
                stats.inspections,
                'Export inspection records and results'
              )}
              {renderDataTypeCard(
                'templates',
                <Settings className="h-4 w-4 text-orange-600" />,
                'Templates',
                stats.templates,
                'Export inspection templates and schemas'
              )}
            </div>
          </TabsContent>

          <TabsContent value="json" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">JSON Export</CardTitle>
                <CardDescription>
                  Export data as JSON files with complete structure, ideal for data migration or API integration.
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              {renderDataTypeCard(
                'users',
                <Users className="h-4 w-4 text-blue-600" />,
                'Users',
                stats.users,
                'Complete user data with all fields and relationships'
              )}
              {renderDataTypeCard(
                'workOrders',
                <FileCheck className="h-4 w-4 text-green-600" />,
                'Work Orders',
                stats.workOrders,
                'Work orders with nested inspection data'
              )}
              {renderDataTypeCard(
                'inspections',
                <ClipboardList className="h-4 w-4 text-purple-600" />,
                'Inspections',
                stats.inspections,
                'Inspection records with complete result data'
              )}
              {renderDataTypeCard(
                'templates',
                <Settings className="h-4 w-4 text-orange-600" />,
                'Templates',
                stats.templates,
                'Template definitions with full schema structure'
              )}
            </div>

            <Separator />

            {/* Bulk export option */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Complete System Export</CardTitle>
                    <CardDescription>
                      Export all data types in a single comprehensive JSON file
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{totalRecords} total records</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleExport('all', 'json')}
                  disabled={totalRecords === 0 || exporting}
                  className="w-full"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Export All Data
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="report" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Report Generation</CardTitle>
                <CardDescription>
                  Generate comprehensive reports with analytics and summaries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Coming Soon</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced reporting with charts and analytics will be available in the next update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 inline mr-1" />
              Export generated on {new Date().toLocaleDateString()}
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
