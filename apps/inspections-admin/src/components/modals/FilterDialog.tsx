import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  RefreshCw,
  Search
} from 'lucide-react';

export interface FilterCriteria {
  search?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  role?: string;
  department?: string;
  location?: string;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  required?: boolean;
  completed?: boolean;
}

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterCriteria;
  onFiltersChange: (filters: FilterCriteria) => void;
  type: 'users' | 'workOrders' | 'inspections' | 'templates';
  availableOptions?: {
    statuses?: string[];
    priorities?: string[];
    assignees?: string[];
    roles?: string[];
    departments?: string[];
    locations?: string[];
  };
}

export function FilterDialog({ 
  open, 
  onOpenChange, 
  filters, 
  onFiltersChange, 
  type,
  availableOptions = {}
}: FilterDialogProps) {
  const [localFilters, setLocalFilters] = useState<FilterCriteria>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, open]);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onOpenChange(false);
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterCriteria = {};
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const updateFilter = (key: keyof FilterCriteria, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const removeFilter = (key: keyof FilterCriteria) => {
    setLocalFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const getActiveFiltersCount = () => {
    return Object.keys(localFilters).filter(key => {
      const value = localFilters[key as keyof FilterCriteria];
      if (key === 'dateRange') {
        const dateRange = value as FilterCriteria['dateRange'];
        return dateRange?.from || dateRange?.to;
      }
      return value !== undefined && value !== '' && value !== null;
    }).length;
  };

  const renderUserFilters = () => (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium">Role</label>
        <Select
          value={localFilters.role || ''}
          onValueChange={(value) => updateFilter('role', value || undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Roles</SelectItem>
            {(availableOptions.roles || ['Inspector', 'Safety Supervisor', 'Safety Manager', 'Maintenance Lead', 'Admin']).map((role) => (
              <SelectItem key={role} value={role}>{role}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Department</label>
        <Select
          value={localFilters.department || ''}
          onValueChange={(value) => updateFilter('department', value || undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Departments</SelectItem>
            {(availableOptions.departments || ['Safety', 'Maintenance', 'Operations', 'Quality Assurance']).map((dept) => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Location</label>
        <Select
          value={localFilters.location || ''}
          onValueChange={(value) => updateFilter('location', value || undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Locations</SelectItem>
            {(availableOptions.locations || ['Building A', 'Building B', 'Warehouse', 'Factory Floor']).map((location) => (
              <SelectItem key={location} value={location}>{location}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );

  const renderWorkOrderFilters = () => (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium">Status</label>
        <Select
          value={localFilters.status || ''}
          onValueChange={(value) => updateFilter('status', value || undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            {(availableOptions.statuses || ['pending', 'in-progress', 'completed', 'overdue']).map((status) => (
              <SelectItem key={status} value={status}>{status.replace('-', ' ').toUpperCase()}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Priority</label>
        <Select
          value={localFilters.priority || ''}
          onValueChange={(value) => updateFilter('priority', value || undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Priorities</SelectItem>
            {(availableOptions.priorities || ['low', 'medium', 'high', 'critical']).map((priority) => (
              <SelectItem key={priority} value={priority}>{priority.toUpperCase()}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Assigned To</label>
        <Select
          value={localFilters.assignedTo || ''}
          onValueChange={(value) => updateFilter('assignedTo', value || undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Assignees</SelectItem>
            {(availableOptions.assignees || []).map((assignee) => (
              <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );

  const renderInspectionFilters = () => (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium">Status</label>
        <Select
          value={localFilters.status || ''}
          onValueChange={(value) => updateFilter('status', value || undefined)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            {(availableOptions.statuses || ['not-started', 'in-progress', 'completed']).map((status) => (
              <SelectItem key={status} value={status}>{status.replace('-', ' ').toUpperCase()}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Required</label>
        <Select
          value={localFilters.required !== undefined ? String(localFilters.required) : ''}
          onValueChange={(value) => updateFilter('required', value === '' ? undefined : value === 'true')}
        >
          <SelectTrigger>
            <SelectValue placeholder="All inspections" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Inspections</SelectItem>
            <SelectItem value="true">Required Only</SelectItem>
            <SelectItem value="false">Optional Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Completion Status</label>
        <Select
          value={localFilters.completed !== undefined ? String(localFilters.completed) : ''}
          onValueChange={(value) => updateFilter('completed', value === '' ? undefined : value === 'true')}
        >
          <SelectTrigger>
            <SelectValue placeholder="All inspections" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Inspections</SelectItem>
            <SelectItem value="true">Completed Only</SelectItem>
            <SelectItem value="false">Incomplete Only</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );

  const renderDateRangeFilter = () => (
    <div className="space-y-2">
      <label className="text-sm font-medium">Date Range</label>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {localFilters.dateRange?.from ? (
                localFilters.dateRange.to ? (
                  <>
                    {format(localFilters.dateRange.from, "LLL dd, y")} -{" "}
                    {format(localFilters.dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(localFilters.dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={localFilters.dateRange?.from}
              selected={{
                from: localFilters.dateRange?.from,
                to: localFilters.dateRange?.to,
              }}
              onSelect={(range) => updateFilter('dateRange', range)}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        {localFilters.dateRange && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => removeFilter('dateRange')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );

  const renderActiveFilters = () => {
    const activeFilters = Object.entries(localFilters).filter(([key, value]) => {
      if (key === 'dateRange') {
        const dateRange = value as FilterCriteria['dateRange'];
        return dateRange?.from || dateRange?.to;
      }
      return value !== undefined && value !== '' && value !== null;
    });

    if (activeFilters.length === 0) return null;

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Active Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map(([key, value]) => {
              let displayValue = String(value);
              if (key === 'dateRange') {
                const dateRange = value as FilterCriteria['dateRange'];
                if (dateRange?.from && dateRange?.to) {
                  displayValue = `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd")}`;
                } else if (dateRange?.from) {
                  displayValue = `From ${format(dateRange.from, "MMM dd")}`;
                } else if (dateRange?.to) {
                  displayValue = `Until ${format(dateRange.to, "MMM dd")}`;
                }
              }

              return (
                <Badge key={key} variant="secondary" className="flex items-center gap-1">
                  {key}: {displayValue}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-3 w-3 p-0 hover:bg-transparent"
                    onClick={() => removeFilter(key as keyof FilterCriteria)}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter {type.charAt(0).toUpperCase() + type.slice(1)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={localFilters.search || ''}
                onChange={(e) => updateFilter('search', e.target.value || undefined)}
                placeholder="Search..."
                className="pl-10"
              />
            </div>
          </div>

          <Separator />

          {/* Type-specific filters */}
          {type === 'users' && renderUserFilters()}
          {type === 'workOrders' && renderWorkOrderFilters()}
          {type === 'inspections' && renderInspectionFilters()}

          {/* Date range filter (for most types) */}
          {(type === 'workOrders' || type === 'inspections') && (
            <>
              <Separator />
              {renderDateRangeFilter()}
            </>
          )}

          {/* Active filters */}
          {renderActiveFilters()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClearFilters}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Clear All
          </Button>
          <Button onClick={handleApplyFilters}>
            Apply Filters
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
