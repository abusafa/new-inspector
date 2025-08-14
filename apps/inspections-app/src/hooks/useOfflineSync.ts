import { useState, useEffect, useCallback } from 'react';
import { WorkOrder, WorkOrderInspection, InspectionResult } from '../types/inspection';

interface OfflineData {
  workOrders: WorkOrder[];
  templates: any[];
  user: any;
  lastSync: string;
}

interface PendingAction {
  id: string;
  type: 'inspection_complete' | 'inspection_update' | 'photo_upload' | 'signature_upload';
  timestamp: string;
  data: any;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
}

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  pendingActions: number;
  failedActions: number;
  syncProgress: number; // 0-100
}

export function useOfflineSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSync: null,
    pendingActions: 0,
    failedActions: 0,
    syncProgress: 0
  });

  const [offlineData, setOfflineData] = useState<OfflineData | null>(null);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);

  // Storage keys
  const OFFLINE_DATA_KEY = 'safetycheck_offline_data';
  const PENDING_ACTIONS_KEY = 'safetycheck_pending_actions';
  const LAST_SYNC_KEY = 'safetycheck_last_sync';

  // Initialize offline data on mount
  useEffect(() => {
    loadOfflineData();
    loadPendingActions();
    
    // Listen for online/offline events
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      syncPendingActions(); // Auto-sync when coming online
    };
    
    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update sync status when pending actions change
  useEffect(() => {
    const pending = pendingActions.filter(a => a.status === 'pending').length;
    const failed = pendingActions.filter(a => a.status === 'failed').length;
    
    setSyncStatus(prev => ({
      ...prev,
      pendingActions: pending,
      failedActions: failed
    }));
  }, [pendingActions]);

  const loadOfflineData = () => {
    try {
      const stored = localStorage.getItem(OFFLINE_DATA_KEY);
      const lastSyncStr = localStorage.getItem(LAST_SYNC_KEY);
      
      if (stored) {
        const data = JSON.parse(stored);
        setOfflineData(data);
      }
      
      if (lastSyncStr) {
        setSyncStatus(prev => ({
          ...prev,
          lastSync: new Date(lastSyncStr)
        }));
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  };

  const loadPendingActions = () => {
    try {
      const stored = localStorage.getItem(PENDING_ACTIONS_KEY);
      if (stored) {
        const actions = JSON.parse(stored);
        setPendingActions(actions);
      }
    } catch (error) {
      console.error('Failed to load pending actions:', error);
    }
  };

  const saveOfflineData = (data: OfflineData) => {
    try {
      localStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(data));
      setOfflineData(data);
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  };

  const savePendingActions = (actions: PendingAction[]) => {
    try {
      localStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(actions));
      setPendingActions(actions);
    } catch (error) {
      console.error('Failed to save pending actions:', error);
    }
  };

  const addPendingAction = (
    type: PendingAction['type'],
    data: any,
    maxRetries: number = 3
  ): string => {
    const action: PendingAction = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: new Date().toISOString(),
      data,
      retryCount: 0,
      maxRetries,
      status: 'pending'
    };

    const updatedActions = [...pendingActions, action];
    savePendingActions(updatedActions);

    // Try to sync immediately if online
    if (syncStatus.isOnline) {
      setTimeout(() => syncPendingActions(), 100);
    }

    return action.id;
  };

  const updatePendingAction = (id: string, updates: Partial<PendingAction>) => {
    const updatedActions = pendingActions.map(action =>
      action.id === id ? { ...action, ...updates } : action
    );
    savePendingActions(updatedActions);
  };

  const removePendingAction = (id: string) => {
    const updatedActions = pendingActions.filter(action => action.id !== id);
    savePendingActions(updatedActions);
  };

  const syncPendingActions = async () => {
    if (!syncStatus.isOnline || syncStatus.isSyncing) return;

    const actionsToSync = pendingActions.filter(
      action => action.status === 'pending' || action.status === 'failed'
    );

    if (actionsToSync.length === 0) return;

    setSyncStatus(prev => ({ ...prev, isSyncing: true, syncProgress: 0 }));

    let completed = 0;
    const total = actionsToSync.length;

    for (const action of actionsToSync) {
      try {
        updatePendingAction(action.id, { status: 'syncing' });

        // Simulate API call based on action type
        await syncSingleAction(action);

        updatePendingAction(action.id, { status: 'completed' });
        
        // Remove completed actions after a short delay
        setTimeout(() => removePendingAction(action.id), 1000);
        
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error);
        
        const newRetryCount = action.retryCount + 1;
        if (newRetryCount >= action.maxRetries) {
          updatePendingAction(action.id, { 
            status: 'failed',
            retryCount: newRetryCount
          });
        } else {
          updatePendingAction(action.id, { 
            status: 'pending',
            retryCount: newRetryCount
          });
        }
      }

      completed++;
      setSyncStatus(prev => ({
        ...prev,
        syncProgress: Math.round((completed / total) * 100)
      }));
    }

    // Update last sync time
    const now = new Date();
    localStorage.setItem(LAST_SYNC_KEY, now.toISOString());
    
    setSyncStatus(prev => ({
      ...prev,
      isSyncing: false,
      lastSync: now,
      syncProgress: 100
    }));

    // Reset progress after a delay
    setTimeout(() => {
      setSyncStatus(prev => ({ ...prev, syncProgress: 0 }));
    }, 2000);
  };

  const syncSingleAction = async (action: PendingAction): Promise<void> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    switch (action.type) {
      case 'inspection_complete':
        await syncInspectionComplete(action.data);
        break;
      case 'inspection_update':
        await syncInspectionUpdate(action.data);
        break;
      case 'photo_upload':
        await syncPhotoUpload(action.data);
        break;
      case 'signature_upload':
        await syncSignatureUpload(action.data);
        break;
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  };

  const syncInspectionComplete = async (data: any) => {
    console.log('Syncing inspection completion:', data);
    // In real app: await api.inspections.complete(data)
    
    // Simulate occasional failure for testing
    if (Math.random() < 0.1) {
      throw new Error('Network timeout');
    }
  };

  const syncInspectionUpdate = async (data: any) => {
    console.log('Syncing inspection update:', data);
    // In real app: await api.inspections.update(data)
  };

  const syncPhotoUpload = async (data: any) => {
    console.log('Syncing photo upload:', data);
    // In real app: await api.media.upload(data)
  };

  const syncSignatureUpload = async (data: any) => {
    console.log('Syncing signature upload:', data);
    // In real app: await api.media.upload(data)
  };

  // Download data for offline use
  const downloadForOffline = async (workOrders: WorkOrder[], templates: any[], user: any) => {
    const offlineData: OfflineData = {
      workOrders,
      templates,
      user,
      lastSync: new Date().toISOString()
    };

    saveOfflineData(offlineData);
    
    // Also cache media files (in real app, this would download images, etc.)
    await cacheMediaFiles(workOrders);
  };

  const cacheMediaFiles = async (workOrders: WorkOrder[]) => {
    // In real app, this would download and cache images, PDFs, etc.
    console.log('Caching media files for offline use...');
  };

  // Complete inspection offline
  const completeInspectionOffline = (
    workOrderId: string,
    inspectionId: string,
    result: InspectionResult,
    photos: File[],
    signatures: any[]
  ) => {
    // Store completion data locally
    const inspectionData = {
      workOrderId,
      inspectionId,
      result,
      completedAt: new Date().toISOString(),
      photos: photos.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        // In real app, convert to base64 or store in IndexedDB
        data: 'base64_placeholder'
      })),
      signatures
    };

    // Add to pending actions
    addPendingAction('inspection_complete', inspectionData);

    // Update local offline data
    if (offlineData) {
      const updatedWorkOrders = offlineData.workOrders.map(wo => {
        if (wo.work_order_id === workOrderId) {
          return {
            ...wo,
            inspections: wo.inspections.map(inspection => {
              if (inspection.inspection_id === inspectionId) {
                return {
                  ...inspection,
                  status: 'completed' as const,
                  completed_at: inspectionData.completedAt,
                  result
                };
              }
              return inspection;
            })
          };
        }
        return wo;
      });

      saveOfflineData({
        ...offlineData,
        workOrders: updatedWorkOrders
      });
    }
  };

  // Retry failed actions
  const retryFailedActions = () => {
    const failedActions = pendingActions.filter(action => action.status === 'failed');
    const updatedActions = pendingActions.map(action => 
      action.status === 'failed' 
        ? { ...action, status: 'pending' as const, retryCount: 0 }
        : action
    );
    savePendingActions(updatedActions);

    if (syncStatus.isOnline) {
      syncPendingActions();
    }
  };

  // Clear all data (for testing/reset)
  const clearOfflineData = () => {
    localStorage.removeItem(OFFLINE_DATA_KEY);
    localStorage.removeItem(PENDING_ACTIONS_KEY);
    localStorage.removeItem(LAST_SYNC_KEY);
    
    setOfflineData(null);
    setPendingActions([]);
    setSyncStatus(prev => ({
      ...prev,
      lastSync: null,
      pendingActions: 0,
      failedActions: 0
    }));
  };

  // Get storage usage info
  const getStorageInfo = () => {
    try {
      const offlineSize = localStorage.getItem(OFFLINE_DATA_KEY)?.length || 0;
      const actionsSize = localStorage.getItem(PENDING_ACTIONS_KEY)?.length || 0;
      
      return {
        offlineDataSize: Math.round(offlineSize / 1024), // KB
        pendingActionsSize: Math.round(actionsSize / 1024), // KB
        totalSize: Math.round((offlineSize + actionsSize) / 1024), // KB
        estimatedCapacity: 5120 // 5MB typical localStorage limit
      };
    } catch (error) {
      return {
        offlineDataSize: 0,
        pendingActionsSize: 0,
        totalSize: 0,
        estimatedCapacity: 5120
      };
    }
  };

  return {
    syncStatus,
    offlineData,
    pendingActions,
    
    // Actions
    downloadForOffline,
    completeInspectionOffline,
    syncPendingActions,
    retryFailedActions,
    clearOfflineData,
    
    // Utils
    getStorageInfo,
    addPendingAction
  };
}
