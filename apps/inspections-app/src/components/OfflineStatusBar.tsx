import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Wifi, 
  WifiOff, 
  Cloud, 
  CloudOff, 
  Sync, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  HardDrive,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Info
} from 'lucide-react';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { formatDistanceToNow } from 'date-fns';

export function OfflineStatusBar() {
  const { 
    syncStatus, 
    pendingActions, 
    syncPendingActions, 
    retryFailedActions, 
    clearOfflineData,
    getStorageInfo
  } = useOfflineSync();
  
  const [showDetails, setShowDetails] = useState(false);
  const storageInfo = getStorageInfo();

  const getStatusIcon = () => {
    if (!syncStatus.isOnline) {
      return <WifiOff className="h-4 w-4 text-red-500" />;
    }
    if (syncStatus.isSyncing) {
      return <Sync className="h-4 w-4 text-blue-500 animate-spin" />;
    }
    if (syncStatus.failedActions > 0) {
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
    if (syncStatus.pendingActions > 0) {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (!syncStatus.isOnline) {
      return 'Offline Mode';
    }
    if (syncStatus.isSyncing) {
      return `Syncing... ${syncStatus.syncProgress}%`;
    }
    if (syncStatus.failedActions > 0) {
      return `${syncStatus.failedActions} Failed`;
    }
    if (syncStatus.pendingActions > 0) {
      return `${syncStatus.pendingActions} Pending`;
    }
    return 'All Synced';
  };

  const getStatusColor = () => {
    if (!syncStatus.isOnline) return 'bg-red-100 text-red-800 border-red-200';
    if (syncStatus.isSyncing) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (syncStatus.failedActions > 0) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (syncStatus.pendingActions > 0) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const formatActionType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'inspection_complete':
      case 'inspection_update':
        return <CheckCircle className="h-3 w-3" />;
      case 'photo_upload':
        return <Upload className="h-3 w-3" />;
      case 'signature_upload':
        return <Upload className="h-3 w-3" />;
      default:
        return <Sync className="h-3 w-3" />;
    }
  };

  const getActionStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'syncing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      {/* Status Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <span className="text-sm font-medium">{getStatusText()}</span>
              
              {syncStatus.isSyncing && (
                <div className="w-24">
                  <Progress value={syncStatus.syncProgress} className="h-2" />
                </div>
              )}
              
              {(syncStatus.pendingActions > 0 || syncStatus.failedActions > 0) && (
                <Badge className={getStatusColor()}>
                  {syncStatus.pendingActions + syncStatus.failedActions} actions
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {syncStatus.lastSync && (
                <span className="text-xs text-muted-foreground">
                  Last sync: {formatDistanceToNow(syncStatus.lastSync, { addSuffix: true })}
                </span>
              )}
              
              <Dialog open={showDetails} onOpenChange={setShowDetails}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Info className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Sync Status Details</DialogTitle>
                    <DialogDescription>
                      Manage offline data and sync operations
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Connection Status */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium">Connection Status</h3>
                          <div className="flex items-center gap-2">
                            {syncStatus.isOnline ? (
                              <Wifi className="h-4 w-4 text-green-500" />
                            ) : (
                              <WifiOff className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm">
                              {syncStatus.isOnline ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Pending Actions:</span>
                            <div className="font-medium">{syncStatus.pendingActions}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Failed Actions:</span>
                            <div className="font-medium">{syncStatus.failedActions}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Last Sync:</span>
                            <div className="font-medium">
                              {syncStatus.lastSync 
                                ? formatDistanceToNow(syncStatus.lastSync, { addSuffix: true })
                                : 'Never'
                              }
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Sync Status:</span>
                            <div className="font-medium">
                              {syncStatus.isSyncing ? 'Syncing...' : 'Idle'}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Storage Info */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium">Storage Usage</h3>
                          <HardDrive className="h-4 w-4 text-gray-500" />
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Offline Data</span>
                              <span>{storageInfo.offlineDataSize} KB</span>
                            </div>
                            <Progress 
                              value={(storageInfo.offlineDataSize / storageInfo.estimatedCapacity) * 100} 
                              className="h-2"
                            />
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Pending Actions</span>
                              <span>{storageInfo.pendingActionsSize} KB</span>
                            </div>
                            <Progress 
                              value={(storageInfo.pendingActionsSize / storageInfo.estimatedCapacity) * 100} 
                              className="h-2"
                            />
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            Total: {storageInfo.totalSize} KB of ~{storageInfo.estimatedCapacity} KB available
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Pending Actions */}
                    {pendingActions.length > 0 && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium">Pending Actions ({pendingActions.length})</h3>
                            <div className="flex gap-2">
                              {syncStatus.failedActions > 0 && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={retryFailedActions}
                                  disabled={!syncStatus.isOnline}
                                >
                                  <RefreshCw className="h-3 w-3 mr-1" />
                                  Retry Failed
                                </Button>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={syncPendingActions}
                                disabled={!syncStatus.isOnline || syncStatus.isSyncing}
                              >
                                <Sync className="h-3 w-3 mr-1" />
                                Sync Now
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {pendingActions.map((action) => (
                              <div key={action.id} className="flex items-center justify-between p-2 border rounded">
                                <div className="flex items-center gap-2">
                                  {getActionIcon(action.type)}
                                  <div>
                                    <div className="text-sm font-medium">
                                      {formatActionType(action.type)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {formatDistanceToNow(new Date(action.timestamp), { addSuffix: true })}
                                      {action.retryCount > 0 && ` • Retry ${action.retryCount}/${action.maxRetries}`}
                                    </div>
                                  </div>
                                </div>
                                
                                <Badge className={getActionStatusColor(action.status)}>
                                  {action.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={syncPendingActions}
                        disabled={!syncStatus.isOnline || syncStatus.isSyncing}
                        className="flex-1"
                      >
                        <Sync className="h-4 w-4 mr-2" />
                        Force Sync
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={clearOfflineData}
                        className="flex-1"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Cache
                      </Button>
                    </div>
                    
                    <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
                      <strong>Offline Mode:</strong> When offline, all your work is saved locally and will automatically sync when you're back online. You can continue working normally without an internet connection.
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              {syncStatus.isOnline && syncStatus.pendingActions > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={syncPendingActions}
                  disabled={syncStatus.isSyncing}
                >
                  <Sync className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Spacer to prevent content from being hidden behind fixed bar */}
      <div className="h-12" />
    </>
  );
}
