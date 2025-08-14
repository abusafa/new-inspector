import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MobileCardGrid } from '@/components/MobileCardGrid';
import { DeleteConfirmationDialog } from '@/components/modals/DeleteConfirmationDialog';
import { FilterDialog, type FilterCriteria } from '@/components/modals/FilterDialog';
import { ExportDialog } from '@/components/modals/ExportDialog';
import { AssetModal } from '@/components/modals/AssetModal';
import { AssetDetailModal } from '@/components/modals/AssetDetailModal';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreVertical,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  Settings,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Asset {
  id: string;
  assetId: string;
  name: string;
  type: string;
  category: string;
  location?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  status: 'active' | 'inactive' | 'maintenance' | 'retired';
  lastInspected?: string;
  nextInspectionDue?: string;
  createdAt: string;
  updatedAt: string;
  workOrderCount: number;
  recentWorkOrders: any[];
  purchaseDate?: string;
  warrantyExpiry?: string;
  notes?: string;
}

function getStatusColor(status: string) {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 border-green-200';
    case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'retired': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'active': return <CheckCircle className="h-4 w-4" />;
    case 'inactive': return <Clock className="h-4 w-4" />;
    case 'maintenance': return <Wrench className="h-4 w-4" />;
    case 'retired': return <AlertTriangle className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
}

function AssetCard({ 
  asset, 
  onView,
  onEdit,
  onDelete
}: { 
  asset: Asset;
  onView: (asset: Asset) => void;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
}) {
  const isOverdue = asset.nextInspectionDue && new Date(asset.nextInspectionDue) < new Date();
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{asset.name}</CardTitle>
              <Badge className={getStatusColor(asset.status)}>
                {getStatusIcon(asset.status)}
                <span className="ml-1">{asset.status}</span>
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-mono">{asset.assetId}</span>
              <span>{asset.type}</span>
              {asset.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{asset.location}</span>
                </div>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onView(asset)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(asset)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Asset
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(asset)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Asset Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Category:</span>
              <p className="font-medium">{asset.category}</p>
            </div>
            {asset.manufacturer && (
              <div>
                <span className="text-muted-foreground">Manufacturer:</span>
                <p className="font-medium">{asset.manufacturer}</p>
              </div>
            )}
            {asset.model && (
              <div>
                <span className="text-muted-foreground">Model:</span>
                <p className="font-medium">{asset.model}</p>
              </div>
            )}
            {asset.serialNumber && (
              <div>
                <span className="text-muted-foreground">Serial:</span>
                <p className="font-medium font-mono text-xs">{asset.serialNumber}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Inspection Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Inspection Status</span>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Overdue
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Last Inspected:</span>
                <p className="font-medium">
                  {asset.lastInspected 
                    ? new Date(asset.lastInspected).toLocaleDateString()
                    : 'Never'
                  }
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Next Due:</span>
                <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                  {asset.nextInspectionDue 
                    ? new Date(asset.nextInspectionDue).toLocaleDateString()
                    : 'Not scheduled'
                  }
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Work Order Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Work Orders</span>
            </div>
            <Badge variant="secondary">{asset.workOrderCount}</Badge>
          </div>

          {/* Recent Work Orders */}
          {asset.recentWorkOrders.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Recent:</span>
              {asset.recentWorkOrders.slice(0, 2).map((wo) => (
                <div key={wo.id} className="flex items-center justify-between text-xs">
                  <span className="truncate">{wo.title}</span>
                  <Badge variant="outline" className="text-xs">
                    {wo.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function AssetsPage() {
  const { toast } = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterCriteria>({});
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    setLoading(true);
    try {
      // Simulated API call - replace with actual API
      const response = await fetch('/api/assets');
      const data = await response.json();
      setAssets(data.data || []);
    } catch (error) {
      console.error('Failed to load assets:', error);
      // Mock data for development
      setAssets([
        {
          id: '1',
          assetId: 'AST-001',
          name: 'Forklift #1',
          type: 'Forklift',
          category: 'Equipment',
          location: 'Warehouse A',
          manufacturer: 'Toyota',
          model: 'Model 8FGU25',
          serialNumber: 'SN123456789',
          status: 'active',
          lastInspected: '2024-01-10T10:00:00Z',
          nextInspectionDue: '2024-01-25T10:00:00Z',
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-10T10:00:00Z',
          workOrderCount: 5,
          recentWorkOrders: [
            { id: '1', title: 'Daily Safety Check', status: 'completed' },
            { id: '2', title: 'Monthly Maintenance', status: 'pending' }
          ]
        },
        {
          id: '2',
          assetId: 'AST-002',
          name: 'Crane #2',
          type: 'Crane',
          category: 'Heavy Equipment',
          location: 'Loading Dock',
          manufacturer: 'Liebherr',
          model: 'LTM 1030-2.1',
          serialNumber: 'SN987654321',
          status: 'maintenance',
          lastInspected: '2024-01-05T14:00:00Z',
          nextInspectionDue: '2024-01-15T14:00:00Z',
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-05T14:00:00Z',
          workOrderCount: 3,
          recentWorkOrders: [
            { id: '3', title: 'Hydraulic System Check', status: 'in-progress' }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAsset = () => {
    setSelectedAsset(null);
    setShowAssetModal(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowAssetModal(true);
  };

  const handleViewAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowDetailModal(true);
  };

  const handleDeleteAsset = async () => {
    if (!assetToDelete) return;

    try {
      const response = await fetch(`/api/assets/${assetToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete asset');
      }

      toast({
        title: "Asset deleted",
        description: `${assetToDelete.name} has been deleted successfully.`,
      });

      setAssets(assets.filter(a => a.id !== assetToDelete.id));
      setAssetToDelete(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete asset. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveAsset = async () => {
    await loadAssets();
    setShowAssetModal(false);
    toast({
      title: selectedAsset ? "Asset updated" : "Asset created",
      description: selectedAsset 
        ? "Asset has been updated successfully." 
        : "New asset has been created successfully.",
    });
  };

  // Filter assets based on search term and filters
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = !searchTerm || 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filters.status || asset.status === filters.status;
    const matchesCategory = !filters.department || asset.category === filters.department; // Using department filter for category
    const matchesLocation = !filters.location || asset.location === filters.location;

    return matchesSearch && matchesStatus && matchesCategory && matchesLocation;
  });

  const availableOptions = {
    statuses: ['active', 'inactive', 'maintenance', 'retired'],
    departments: [...new Set(assets.map(a => a.category))],
    locations: [...new Set(assets.map(a => a.location).filter(Boolean))]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assets</h1>
          <p className="text-muted-foreground">
            Manage your equipment and assets
          </p>
        </div>
        <Button onClick={handleCreateAsset}>
          <Plus className="mr-2 h-4 w-4" />
          Add Asset
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilterDialog(true)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowExportDialog(true)}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets Grid */}
      <MobileCardGrid
        items={filteredAssets}
        renderCard={(asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            onView={handleViewAsset}
            onEdit={handleEditAsset}
            onDelete={setAssetToDelete}
          />
        )}
        searchFields={['name', 'assetId', 'type']}
        sortOptions={[
          { label: 'Name', key: 'name' },
          { label: 'Asset ID', key: 'assetId' },
          { label: 'Type', key: 'type' },
          { label: 'Status', key: 'status' },
          { label: 'Last Inspected', key: 'lastInspected', type: 'date' },
          { label: 'Next Due', key: 'nextInspectionDue', type: 'date' }
        ]}
        filterOptions={[
          {
            label: 'Status',
            key: 'status',
            options: availableOptions.statuses.map(s => ({ label: s, value: s }))
          },
          {
            label: 'Category',
            key: 'category',
            options: availableOptions.departments.map(d => ({ label: d, value: d }))
          },
          {
            label: 'Location',
            key: 'location',
            options: availableOptions.locations.map(l => ({ label: l, value: l }))
          }
        ]}
        title="Assets"
        description={`${filteredAssets.length} asset${filteredAssets.length !== 1 ? 's' : ''} found`}
        emptyState={{
          title: "No assets found",
          description: "Get started by creating your first asset.",
          icon: Settings
        }}
        loading={loading}
      />

      {/* Modals */}
      <AssetModal
        open={showAssetModal}
        onOpenChange={setShowAssetModal}
        asset={selectedAsset}
        onSave={handleSaveAsset}
      />

      <AssetDetailModal
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        asset={selectedAsset}
      />

      <FilterDialog
        open={showFilterDialog}
        onOpenChange={setShowFilterDialog}
        filters={filters}
        onFiltersChange={setFilters}
        type="assets"
        availableOptions={availableOptions}
      />

      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        data={{ assets: filteredAssets }}
        type="assets"
      />

      <DeleteConfirmationDialog
        open={!!assetToDelete}
        onOpenChange={(open) => !open && setAssetToDelete(null)}
        title="Delete Asset"
        description={`Are you sure you want to delete "${assetToDelete?.name}"? This action cannot be undone.`}
        itemName={assetToDelete?.name}
        onConfirm={handleDeleteAsset}
      />
    </div>
  );
}
