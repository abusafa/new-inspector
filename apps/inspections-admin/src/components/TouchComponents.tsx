import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Share, 
  Download,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface TouchAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'secondary';
  disabled?: boolean;
}

interface TouchCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  badges?: Array<{
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    color?: string;
  }>;
  actions?: TouchAction[];
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function TouchCard({
  title,
  subtitle,
  description,
  badges = [],
  actions = [],
  onClick,
  children,
  className = ''
}: TouchCardProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = () => setIsPressed(true);
  const handleTouchEnd = () => setIsPressed(false);

  return (
    <Card 
      className={`transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:shadow-md active:scale-[0.98]' : ''
      } ${isPressed ? 'scale-[0.98] shadow-lg' : ''} ${className}`}
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base lg:text-lg truncate">{title}</CardTitle>
            {subtitle && (
              <CardDescription className="text-sm mt-1 truncate">
                {subtitle}
              </CardDescription>
            )}
          </div>
          
          {actions.length > 0 && (
            <div className="flex items-center gap-1">
              {actions.length <= 2 ? (
                // Show buttons directly for 1-2 actions
                actions.map((action, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick();
                    }}
                    disabled={action.disabled}
                    className="h-8 w-8 p-0 touch-manipulation"
                  >
                    <action.icon className="h-4 w-4" />
                  </Button>
                ))
              ) : (
                // Use dropdown for 3+ actions
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 touch-manipulation"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {actions.map((action, index) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick();
                        }}
                        disabled={action.disabled}
                        className={
                          action.variant === 'destructive' 
                            ? 'text-red-600 focus:text-red-600' 
                            : ''
                        }
                      >
                        <action.icon className="h-4 w-4 mr-2" />
                        {action.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
        </div>

        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {badges.map((badge, index) => (
              <Badge 
                key={index} 
                variant={badge.variant || 'secondary'}
                className={badge.color ? `bg-${badge.color}-100 text-${badge.color}-700` : ''}
              >
                {badge.label}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      {(description || children) && (
        <CardContent className="pt-0">
          {description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {description}
            </p>
          )}
          {children}
        </CardContent>
      )}
    </Card>
  );
}

interface TouchListItemProps {
  title: string;
  subtitle?: string;
  description?: string;
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightContent?: React.ReactNode;
  onClick?: () => void;
  showChevron?: boolean;
  className?: string;
}

export function TouchListItem({
  title,
  subtitle,
  description,
  leftIcon: LeftIcon,
  rightContent,
  onClick,
  showChevron = true,
  className = ''
}: TouchListItemProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = () => setIsPressed(true);
  const handleTouchEnd = () => setIsPressed(false);

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-150 ${
        onClick 
          ? 'cursor-pointer hover:bg-muted active:bg-muted/80 touch-manipulation' 
          : ''
      } ${isPressed ? 'bg-muted/80 scale-[0.98]' : ''} ${className}`}
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {LeftIcon && (
        <div className="flex-shrink-0">
          <LeftIcon className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm truncate">{title}</h3>
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {subtitle}
          </p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {description}
          </p>
        )}
      </div>

      {rightContent && (
        <div className="flex-shrink-0">
          {rightContent}
        </div>
      )}

      {onClick && showChevron && (
        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      )}
    </div>
  );
}

interface TouchButtonGroupProps {
  buttons: Array<{
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary' | 'destructive';
    disabled?: boolean;
  }>;
  className?: string;
}

export function TouchButtonGroup({ buttons, className = '' }: TouchButtonGroupProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {buttons.map((button, index) => (
        <Button
          key={index}
          variant={button.variant || 'outline'}
          size="sm"
          onClick={button.onClick}
          disabled={button.disabled}
          className="flex-1 touch-manipulation min-h-[44px] text-sm"
        >
          {button.icon && <button.icon className="h-4 w-4 mr-2" />}
          {button.label}
        </Button>
      ))}
    </div>
  );
}

interface TouchStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  onClick?: () => void;
}

export function TouchStatsCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  color = 'blue',
  onClick
}: TouchStatsCardProps) {
  const [isPressed, setIsPressed] = useState(false);

  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
  };

  return (
    <Card
      className={`${colorClasses[color]} transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:shadow-md active:scale-[0.98]' : ''
      } ${isPressed ? 'scale-[0.98] shadow-lg' : ''}`}
      onClick={onClick}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <p className="text-2xl font-bold mb-1">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">
                {subtitle}
              </p>
            )}
            {trend && (
              <div className={`flex items-center gap-1 mt-2 text-xs ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                <span>{trend.isPositive ? '↗' : '↘'}</span>
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
          
          {Icon && (
            <div className={`p-3 rounded-lg bg-white/50 ${iconColorClasses[color]}`}>
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface SwipeableCardProps {
  children: React.ReactNode;
  leftActions?: Array<{
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    onClick: () => void;
  }>;
  rightActions?: Array<{
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    onClick: () => void;
  }>;
  className?: string;
}

export function SwipeableCard({
  children,
  leftActions = [],
  rightActions = [],
  className = ''
}: SwipeableCardProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    const maxOffset = 100;
    
    setSwipeOffset(Math.max(-maxOffset, Math.min(maxOffset, diff)));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    // Snap to action or reset
    if (Math.abs(swipeOffset) > 50) {
      if (swipeOffset > 0 && leftActions.length > 0) {
        leftActions[0].onClick();
      } else if (swipeOffset < 0 && rightActions.length > 0) {
        rightActions[0].onClick();
      }
    }
    
    setSwipeOffset(0);
  };

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      {/* Left actions */}
      {leftActions.length > 0 && (
        <div className="absolute left-0 top-0 bottom-0 flex items-center">
          {leftActions.map((action, index) => (
            <div
              key={index}
              className={`flex items-center justify-center w-16 h-full ${action.color}`}
              onClick={action.onClick}
            >
              <action.icon className="h-5 w-5 text-white" />
            </div>
          ))}
        </div>
      )}

      {/* Right actions */}
      {rightActions.length > 0 && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center">
          {rightActions.map((action, index) => (
            <div
              key={index}
              className={`flex items-center justify-center w-16 h-full ${action.color}`}
              onClick={action.onClick}
            >
              <action.icon className="h-5 w-5 text-white" />
            </div>
          ))}
        </div>
      )}

      {/* Main content */}
      <div
        className="relative z-10 bg-background transition-transform duration-200"
        style={{ transform: `translateX(${swipeOffset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
