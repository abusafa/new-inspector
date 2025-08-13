import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Grid3X3, 
  List, 
  MoreVertical,
  ChevronDown,
  X
} from 'lucide-react';

interface MobileCardGridProps<T> {
  items: T[];
  renderCard: (item: T) => React.ReactNode;
  searchFields: (keyof T)[];
  sortOptions: Array<{
    label: string;
    key: keyof T;
    type?: 'string' | 'number' | 'date';
  }>;
  filterOptions?: Array<{
    label: string;
    key: keyof T;
    options: Array<{ label: string; value: any }>;
  }>;
  title: string;
  description?: string;
  emptyState?: {
    title: string;
    description: string;
    icon?: React.ComponentType<{ className?: string }>;
  };
  actions?: React.ReactNode;
  loading?: boolean;
}

export function MobileCardGrid<T extends Record<string, any>>({
  items,
  renderCard,
  searchFields,
  sortOptions,
  filterOptions = [],
  title,
  description,
  emptyState,
  actions,
  loading = false
}: MobileCardGridProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<keyof T>(sortOptions[0]?.key || '');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter and search items
  const filteredItems = items.filter(item => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchFields.some(field => {
        const value = item[field];
        return value && value.toString().toLowerCase().includes(searchLower);
      });
      if (!matchesSearch) return false;
    }

    // Custom filters
    for (const [key, value] of Object.entries(filters)) {
      if (value && item[key] !== value) {
        return false;
      }
    }

    return true;
  });

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    
    let comparison = 0;
    if (aVal < bVal) comparison = -1;
    if (aVal > bVal) comparison = 1;
    
    return sortDirection === 'desc' ? -comparison : comparison;
  });

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold lg:text-2xl">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground lg:text-base">{description}</p>
            )}
          </div>
        </div>
        <div className={`grid gap-4 ${viewMode === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1'
        }`}>
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-5/6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold lg:text-2xl">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground lg:text-base">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Mobile-first Controls */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Controls Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {/* Filter Toggle */}
          <Button
            variant={showFilters || activeFiltersCount > 0 ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex-shrink-0"
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex-shrink-0">
                {sortDirection === 'asc' ? (
                  <SortAsc className="h-4 w-4 mr-1" />
                ) : (
                  <SortDesc className="h-4 w-4 mr-1" />
                )}
                Sort
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.key.toString()}
                  onClick={() => {
                    if (sortBy === option.key) {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy(option.key);
                      setSortDirection('desc');
                    }
                  }}
                >
                  {option.label}
                  {sortBy === option.key && (
                    <Badge variant="secondary" className="ml-auto">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Mode - Desktop only */}
          <div className="hidden lg:flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Results count */}
          <div className="flex-1 text-right">
            <span className="text-sm text-muted-foreground">
              {sortedItems.length} of {items.length}
            </span>
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && filterOptions.length > 0 && (
          <Card className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Filters</h3>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all
                  </Button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filterOptions.map((filter) => (
                  <div key={filter.key.toString()} className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      {filter.label}
                    </label>
                    <Select
                      value={filters[filter.key.toString()] || ''}
                      onValueChange={(value) => 
                        setFilters(prev => ({ 
                          ...prev, 
                          [filter.key]: value || undefined 
                        }))
                      }
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All</SelectItem>
                        {filter.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Content */}
      {sortedItems.length === 0 ? (
        <Card className="p-8 text-center">
          {emptyState?.icon && (
            <emptyState.icon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          )}
          <h3 className="text-lg font-medium mb-2">
            {emptyState?.title || 'No items found'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {emptyState?.description || 'Try adjusting your search or filters.'}
          </p>
          {(searchTerm || activeFiltersCount > 0) && (
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </Card>
      ) : (
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {sortedItems.map((item, index) => (
            <div key={index} className="touch-manipulation">
              {renderCard(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
