import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { DeleteConfirmationDialog } from '@/components/modals/DeleteConfirmationDialog';
import { 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw,
  HardDrive,
  FileText,
  Archive,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Users,
  FileCheck,
  ClipboardList,
  Settings as SettingsIcon
} from 'lucide-react';

interface DatabaseStats {
  totalSize: string;
  tables: {
    name: string;
    records: number;
    size: string;
    lastModified: string;
  }[];
  backups: {
    id: string;
    date: string;
    size: string;
    type: 'manual' | 'automatic';
    status: 'completed' | 'failed' | 'in-progress';
  }[];
}

export function DataManagementCard() {
  const { toast } = useToast();
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [operationInProgress, setOperationInProgress] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string; name: string } | null>(null);

  const mockStats: DatabaseStats = {
    totalSize: '2.4 GB',
    tables: [
      { name: 'users', records: 156, size: '45 MB', lastModified: '2024-01-12 14:30:00' },
      { name: 'work_orders', records: 1248, size: '189 MB', lastModified: '2024-01-12 16:45:00' },
      { name: 'inspections', records: 3421, size: '756 MB', lastModified: '2024-01-12 17:20:00' },
      { name: 'templates', records: 89, size: '23 MB', lastModified: '2024-01-11 09:15:00' },
      { name: 'audit_logs', records: 15672, size: '1.2 GB', lastModified: '2024-01-12 18:00:00' },
    ],
    backups: [
      { id: '1', date: '2024-01-12 02:00:00', size: '2.3 GB', type: 'automatic', status: 'completed' },
      { id: '2', date: '2024-01-11 02:00:00', size: '2.2 GB', type: 'automatic', status: 'completed' },
      { id: '3', date: '2024-01-10 15:30:00', size: '2.1 GB', type: 'manual', status: 'completed' },
      { id: '4', date: '2024-01-10 02:00:00', size: '2.1 GB', type: 'automatic', status: 'completed' },
      { id: '5', date: '2024-01-09 02:00:00', size: '2.0 GB', type: 'automatic', status: 'failed' },
    ]
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStats(mockStats);
    } catch (error) {
      toast({
        title: "Failed to load database stats",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async (table?: string) => {
    const operation = table ? `export-${table}` : 'export-all';
    setOperationInProgress(operation);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Export completed",
        description: table ? `${table} data exported successfully.` : "All data exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setOperationInProgress(null);
    }
  };

  const handleCreateBackup = async () => {
    setOperationInProgress('backup');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newBackup = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        size: '2.4 GB',
        type: 'manual' as const,
        status: 'completed' as const
      };
      
      if (stats) {
        setStats({
          ...stats,
          backups: [newBackup, ...stats.backups]
        });
      }
      
      toast({
        title: "Backup completed",
        description: "Database backup created successfully.",
      });
    } catch (error) {
      toast({
        title: "Backup failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setOperationInProgress(null);
    }
  };

  const handleDeleteBackup = async () => {
    if (!itemToDelete || !stats) return;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStats({
        ...stats,
        backups: stats.backups.filter(b => b.id !== itemToDelete.id)
      });
      
      toast({
        title: "Backup deleted",
        description: "Backup has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const getTableIcon = (tableName: string) => {
    switch (tableName) {
      case 'users': return <Users className="h-4 w-4" />;
      case 'work_orders': return <FileCheck className="h-4 w-4" />;
      case 'inspections': return <ClipboardList className="h-4 w-4" />;
      case 'templates': return <SettingsIcon className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 border-green-200';
      case 'failed': return 'text-red-600 bg-red-100 border-red-200';
      case 'in-progress': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'failed': return <AlertTriangle className="h-3 w-3" />;
      case 'in-progress': return <RefreshCw className="h-3 w-3 animate-spin" />;
      default: return <RefreshCw className="h-3 w-3" />;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <CardTitle>Data Management</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadStats}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <CardDescription>
            Manage database, backups, and data operations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : stats ? (
            <>
              {/* Database Overview */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  Database Overview
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalSize}</div>
                    <div className="text-sm text-muted-foreground">Total Size</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.tables.length}</div>
                    <div className="text-sm text-muted-foreground">Tables</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {stats.tables.reduce((sum, table) => sum + table.records, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Records</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{stats.backups.length}</div>
                    <div className="text-sm text-muted-foreground">Backups</div>
                  </div>
                </div>

                <div className="space-y-2">
                  {stats.tables.map((table) => (
                    <div key={table.name} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        {getTableIcon(table.name)}
                        <div>
                          <div className="font-medium capitalize">{table.name.replace('_', ' ')}</div>
                          <div className="text-sm text-muted-foreground">
                            {table.records.toLocaleString()} records • {table.size}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExportData(table.name)}
                          disabled={operationInProgress === `export-${table.name}`}
                        >
                          {operationInProgress === `export-${table.name}` ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Data Operations */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  Data Operations
                </h4>
                <div className="grid gap-3">
                  <Button
                    variant="outline"
                    className="justify-start h-auto p-4"
                    onClick={() => handleExportData()}
                    disabled={operationInProgress === 'export-all'}
                  >
                    <div className="flex items-center gap-3">
                      {operationInProgress === 'export-all' ? (
                        <RefreshCw className="h-5 w-5 animate-spin" />
                      ) : (
                        <Download className="h-5 w-5 text-blue-600" />
                      )}
                      <div className="text-left">
                        <div className="font-medium">Export All Data</div>
                        <div className="text-sm text-muted-foreground">Download complete database export</div>
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto p-4"
                    onClick={handleCreateBackup}
                    disabled={operationInProgress === 'backup'}
                  >
                    <div className="flex items-center gap-3">
                      {operationInProgress === 'backup' ? (
                        <RefreshCw className="h-5 w-5 animate-spin" />
                      ) : (
                        <Archive className="h-5 w-5 text-green-600" />
                      )}
                      <div className="text-left">
                        <div className="font-medium">Create Backup</div>
                        <div className="text-sm text-muted-foreground">Create manual database backup</div>
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto p-4"
                    disabled
                  >
                    <div className="flex items-center gap-3">
                      <Upload className="h-5 w-5 text-purple-600" />
                      <div className="text-left">
                        <div className="font-medium">Import Data</div>
                        <div className="text-sm text-muted-foreground">Upload and import data (Coming Soon)</div>
                      </div>
                    </div>
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Backup History */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Backup History
                </h4>
                <div className="space-y-2">
                  {stats.backups.map((backup) => (
                    <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Archive className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {new Date(backup.date).toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {backup.size} • {backup.type}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${getStatusColor(backup.status)}`}>
                          {getStatusIcon(backup.status)}
                          <span className="ml-1 capitalize">{backup.status}</span>
                        </Badge>
                        {backup.status === 'completed' && (
                          <>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setItemToDelete({ type: 'backup', id: backup.id, name: new Date(backup.date).toLocaleString() });
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No Data Available</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Click refresh to load database statistics.
              </p>
              <Button onClick={loadStats}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Load Stats
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Backup"
        description="Are you sure you want to delete this backup? This action cannot be undone."
        itemName={itemToDelete?.name}
        onConfirm={handleDeleteBackup}
      />
    </>
  );
}
