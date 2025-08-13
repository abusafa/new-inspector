import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useRealTime } from '@/contexts/RealTimeContext';
import { formatDistanceToNow } from 'date-fns';
import { 
  Bell, 
  BellRing, 
  Check, 
  CheckCheck, 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  XCircle,
  Wifi,
  WifiOff,
  MoreHorizontal,
  Filter,
  Settings
} from 'lucide-react';

export function NotificationsPanel() {
  const { 
    notifications, 
    unreadCount, 
    isConnected, 
    markAsRead, 
    markAllAsRead, 
    dismissNotification 
  } = useRealTime();
  const [filter, setFilter] = useState<'all' | 'unread' | 'success' | 'warning' | 'error'>('all');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-l-green-500 bg-green-50';
      case 'warning': return 'border-l-yellow-500 bg-yellow-50';
      case 'error': return 'border-l-red-500 bg-red-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread': return !notification.read;
      case 'success': return notification.type === 'success';
      case 'warning': return notification.type === 'warning';
      case 'error': return notification.type === 'error';
      default: return true;
    }
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          {isConnected ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5 text-muted-foreground" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex items-center gap-1">
                {isConnected ? (
                  <Wifi className="h-3 w-3 text-green-600" />
                ) : (
                  <WifiOff className="h-3 w-3 text-red-600" />
                )}
                <span className="text-xs text-muted-foreground">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilter('all')}>
                    All ({notifications.length})
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('unread')}>
                    Unread ({unreadCount})
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('success')}>
                    Success ({notifications.filter(n => n.type === 'success').length})
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('warning')}>
                    Warning ({notifications.filter(n => n.type === 'warning').length})
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter('error')}>
                    Error ({notifications.filter(n => n.type === 'error').length})
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  <CheckCheck className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <Badge variant={filter === 'all' ? 'default' : 'outline'} className="text-xs">
              {filter === 'all' ? `All (${notifications.length})` :
               filter === 'unread' ? `Unread (${unreadCount})` :
               `${filter.charAt(0).toUpperCase() + filter.slice(1)} (${filteredNotifications.length})`}
            </Badge>
          </div>
        </div>

        <Separator />

        <ScrollArea className="h-96">
          {filteredNotifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
              <p className="text-xs mt-1">
                {filter === 'all' 
                  ? "You're all caught up!" 
                  : `No ${filter} notifications found`
                }
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {filteredNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`border-l-4 transition-all hover:shadow-sm ${
                    getNotificationColor(notification.type)
                  } ${notification.read ? 'opacity-75' : ''}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium truncate">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                            </span>
                            {notification.actions && notification.actions.length > 0 && (
                              <div className="flex gap-1">
                                {notification.actions.map((action, index) => (
                                  <Button
                                    key={index}
                                    variant={action.variant === 'destructive' ? 'destructive' : 'outline'}
                                    size="sm"
                                    className="text-xs h-6 px-2"
                                    onClick={action.action}
                                  >
                                    {action.label}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!notification.read ? (
                            <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                              <Check className="h-4 w-4 mr-2" />
                              Mark as read
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => {
                                // Mark as unread (toggle)
                                markAsRead(notification.id);
                              }}
                            >
                              <Bell className="h-4 w-4 mr-2" />
                              Mark as unread
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => dismissNotification(notification.id)}
                            className="text-red-600"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Dismiss
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        <Separator />
        
        <div className="p-3">
          <div className="flex justify-between items-center">
            <Button variant="ghost" size="sm" className="text-xs">
              <Settings className="h-3 w-3 mr-1" />
              Settings
            </Button>
            <Button variant="ghost" size="sm" className="text-xs">
              View All
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
