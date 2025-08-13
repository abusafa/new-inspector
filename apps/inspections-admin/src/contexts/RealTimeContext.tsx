import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
}

interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'default' | 'destructive';
}

interface RealTimeUpdate {
  type: 'work_order' | 'inspection' | 'user' | 'system';
  action: 'created' | 'updated' | 'deleted' | 'assigned' | 'completed';
  data: any;
  timestamp: string;
  userId?: string;
}

interface RealTimeContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (notificationId: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  subscribe: (callback: (update: RealTimeUpdate) => void) => () => void;
  sendUpdate: (update: Omit<RealTimeUpdate, 'timestamp'>) => void;
}

const RealTimeContext = createContext<RealTimeContextType | undefined>(undefined);

// Mock WebSocket-like functionality using localStorage and custom events
class MockWebSocket {
  private listeners: ((update: RealTimeUpdate) => void)[] = [];
  private connected = false;

  constructor() {
    this.connect();
    // Listen for storage events from other tabs/windows
    window.addEventListener('storage', this.handleStorageEvent.bind(this));
    // Listen for custom events in the same tab
    window.addEventListener('realtime-update', this.handleCustomEvent.bind(this));
  }

  connect() {
    // Simulate connection delay
    setTimeout(() => {
      this.connected = true;
      this.listeners.forEach(listener => {
        // Simulate initial connection message
        listener({
          type: 'system',
          action: 'created',
          data: { message: 'Connected to real-time updates' },
          timestamp: new Date().toISOString()
        });
      });
    }, 1000);
  }

  subscribe(callback: (update: RealTimeUpdate) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  send(update: Omit<RealTimeUpdate, 'timestamp'>) {
    const fullUpdate: RealTimeUpdate = {
      ...update,
      timestamp: new Date().toISOString()
    };

    // Store in localStorage for cross-tab communication
    localStorage.setItem('realtime-update', JSON.stringify(fullUpdate));
    
    // Dispatch custom event for same-tab communication
    window.dispatchEvent(new CustomEvent('realtime-update', { detail: fullUpdate }));
  }

  private handleStorageEvent(event: StorageEvent) {
    if (event.key === 'realtime-update' && event.newValue) {
      try {
        const update = JSON.parse(event.newValue);
        this.listeners.forEach(listener => listener(update));
      } catch (error) {
        console.error('Error parsing real-time update:', error);
      }
    }
  }

  private handleCustomEvent(event: Event) {
    const customEvent = event as CustomEvent;
    this.listeners.forEach(listener => listener(customEvent.detail));
  }

  isConnected() {
    return this.connected;
  }

  disconnect() {
    this.connected = false;
    window.removeEventListener('storage', this.handleStorageEvent.bind(this));
    window.removeEventListener('realtime-update', this.handleCustomEvent.bind(this));
  }
}

const mockWebSocket = new MockWebSocket();

export function RealTimeProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize with some mock notifications
    const initialNotifications: Notification[] = [
      {
        id: '1',
        type: 'info',
        title: 'System Update',
        message: 'The system has been updated to version 2.1.0',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        read: false,
      },
      {
        id: '2',
        type: 'success',
        title: 'Work Order Completed',
        message: 'Safety inspection for Building A has been completed by John Smith',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        read: false,
        actions: [
          {
            label: 'View Report',
            action: () => console.log('View report clicked'),
          }
        ]
      },
      {
        id: '3',
        type: 'warning',
        title: 'Overdue Inspection',
        message: 'Fire safety inspection for Building C is overdue by 2 days',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: true,
        actions: [
          {
            label: 'Reassign',
            action: () => console.log('Reassign clicked'),
          },
          {
            label: 'Escalate',
            action: () => console.log('Escalate clicked'),
            variant: 'destructive'
          }
        ]
      }
    ];

    setNotifications(initialNotifications);

    // Subscribe to real-time updates
    const unsubscribe = mockWebSocket.subscribe((update) => {
      setIsConnected(mockWebSocket.isConnected());
      handleRealTimeUpdate(update);
    });

    // Check connection status
    const checkConnection = setInterval(() => {
      setIsConnected(mockWebSocket.isConnected());
    }, 5000);

    // Simulate periodic updates
    const simulateUpdates = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every 10 seconds
        simulateRandomUpdate();
      }
    }, 10000);

    return () => {
      unsubscribe();
      clearInterval(checkConnection);
      clearInterval(simulateUpdates);
    };
  }, []);

  const simulateRandomUpdate = () => {
    const updates = [
      {
        type: 'work_order' as const,
        action: 'created' as const,
        data: { title: 'Emergency Equipment Check', assignedTo: 'Sarah Johnson' }
      },
      {
        type: 'inspection' as const,
        action: 'completed' as const,
        data: { title: 'Monthly Safety Review', completedBy: 'Mike Wilson' }
      },
      {
        type: 'user' as const,
        action: 'updated' as const,
        data: { name: 'Lisa Davis', action: 'logged in' }
      },
      {
        type: 'work_order' as const,
        action: 'assigned' as const,
        data: { title: 'Maintenance Check', assignedTo: 'David Brown' }
      }
    ];

    const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
    mockWebSocket.send(randomUpdate);
  };

  const handleRealTimeUpdate = (update: RealTimeUpdate) => {
    // Convert real-time update to notification
    let notification: Omit<Notification, 'id' | 'timestamp' | 'read'>;

    switch (update.type) {
      case 'work_order':
        notification = {
          type: update.action === 'created' ? 'info' : 'success',
          title: `Work Order ${update.action.charAt(0).toUpperCase() + update.action.slice(1)}`,
          message: `${update.data.title} has been ${update.action}${update.data.assignedTo ? ` and assigned to ${update.data.assignedTo}` : ''}`,
        };
        break;
      case 'inspection':
        notification = {
          type: 'success',
          title: `Inspection ${update.action.charAt(0).toUpperCase() + update.action.slice(1)}`,
          message: `${update.data.title} has been ${update.action}${update.data.completedBy ? ` by ${update.data.completedBy}` : ''}`,
        };
        break;
      case 'user':
        notification = {
          type: 'info',
          title: 'User Activity',
          message: `${update.data.name} ${update.data.action}`,
        };
        break;
      case 'system':
        notification = {
          type: 'info',
          title: 'System Update',
          message: update.data.message,
        };
        break;
      default:
        return;
    }

    addNotification(notification);

    // Show toast for important updates
    if (update.type === 'work_order' && update.action === 'created') {
      toast({
        title: notification.title,
        description: notification.message,
      });
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep max 50 notifications
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const subscribe = (callback: (update: RealTimeUpdate) => void) => {
    return mockWebSocket.subscribe(callback);
  };

  const sendUpdate = (update: Omit<RealTimeUpdate, 'timestamp'>) => {
    mockWebSocket.send(update);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const value: RealTimeContextType = {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    addNotification,
    subscribe,
    sendUpdate,
  };

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  );
}

export function useRealTime() {
  const context = useContext(RealTimeContext);
  if (context === undefined) {
    throw new Error('useRealTime must be used within a RealTimeProvider');
  }
  return context;
}
