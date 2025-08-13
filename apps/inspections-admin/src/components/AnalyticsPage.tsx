import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3, 
  PieChart as PieChartIcon,
  Calendar,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  FileCheck,
  ClipboardList,
  Target,
  Zap,
  Activity
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalInspections: number;
    completedInspections: number;
    pendingInspections: number;
    overdue: number;
    avgCompletionTime: number;
    complianceRate: number;
    trendsComparison: {
      inspections: number;
      completion: number;
      compliance: number;
    };
  };
  charts: {
    inspectionTrends: Array<{
      date: string;
      completed: number;
      pending: number;
      overdue: number;
    }>;
    statusDistribution: Array<{
      name: string;
      value: number;
      color: string;
    }>;
    departmentPerformance: Array<{
      department: string;
      completed: number;
      pending: number;
      compliance: number;
    }>;
    monthlyTrends: Array<{
      month: string;
      inspections: number;
      workOrders: number;
      users: number;
    }>;
    priorityBreakdown: Array<{
      priority: string;
      count: number;
      avgTime: number;
    }>;
    templateUsage: Array<{
      template: string;
      usage: number;
      success: number;
    }>;
  };
}

export function AnalyticsPage() {
  const { toast } = useToast();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('inspections');

  const mockData: AnalyticsData = {
    overview: {
      totalInspections: 1247,
      completedInspections: 1089,
      pendingInspections: 158,
      overdue: 23,
      avgCompletionTime: 2.4,
      complianceRate: 87.3,
      trendsComparison: {
        inspections: 12.5,
        completion: 8.7,
        compliance: -2.1
      }
    },
    charts: {
      inspectionTrends: [
        { date: '2024-01-01', completed: 45, pending: 12, overdue: 3 },
        { date: '2024-01-02', completed: 52, pending: 8, overdue: 2 },
        { date: '2024-01-03', completed: 38, pending: 15, overdue: 4 },
        { date: '2024-01-04', completed: 67, pending: 10, overdue: 1 },
        { date: '2024-01-05', completed: 43, pending: 18, overdue: 5 },
        { date: '2024-01-06', completed: 58, pending: 7, overdue: 2 },
        { date: '2024-01-07', completed: 61, pending: 13, overdue: 3 },
        { date: '2024-01-08', completed: 49, pending: 11, overdue: 2 },
        { date: '2024-01-09', completed: 55, pending: 16, overdue: 4 },
        { date: '2024-01-10', completed: 72, pending: 9, overdue: 1 },
        { date: '2024-01-11', completed: 41, pending: 14, overdue: 3 },
        { date: '2024-01-12', completed: 63, pending: 12, overdue: 2 }
      ],
      statusDistribution: [
        { name: 'Completed', value: 1089, color: '#10B981' },
        { name: 'In Progress', value: 135, color: '#F59E0B' },
        { name: 'Pending', value: 158, color: '#6B7280' },
        { name: 'Overdue', value: 23, color: '#EF4444' }
      ],
      departmentPerformance: [
        { department: 'Safety', completed: 245, pending: 12, compliance: 95.2 },
        { department: 'Maintenance', completed: 189, pending: 23, compliance: 89.1 },
        { department: 'Operations', completed: 312, pending: 45, compliance: 87.4 },
        { department: 'Quality', completed: 156, pending: 8, compliance: 96.8 },
        { department: 'Environmental', completed: 187, pending: 15, compliance: 92.5 }
      ],
      monthlyTrends: [
        { month: 'Jul', inspections: 234, workOrders: 189, users: 45 },
        { month: 'Aug', inspections: 267, workOrders: 203, users: 48 },
        { month: 'Sep', inspections: 298, workOrders: 234, users: 52 },
        { month: 'Oct', inspections: 321, workOrders: 267, users: 55 },
        { month: 'Nov', inspections: 289, workOrders: 245, users: 58 },
        { month: 'Dec', inspections: 356, workOrders: 289, users: 62 }
      ],
      priorityBreakdown: [
        { priority: 'Critical', count: 45, avgTime: 1.2 },
        { priority: 'High', count: 189, avgTime: 2.1 },
        { priority: 'Medium', count: 567, avgTime: 3.4 },
        { priority: 'Low', count: 234, avgTime: 5.7 }
      ],
      templateUsage: [
        { template: 'Safety Checklist', usage: 234, success: 96.5 },
        { template: 'Equipment Inspection', usage: 189, success: 94.2 },
        { template: 'Fire Safety', usage: 156, success: 98.1 },
        { template: 'Vehicle Inspection', usage: 143, success: 91.6 },
        { template: 'Environmental Check', usage: 98, success: 89.8 }
      ]
    }
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setData(mockData);
      toast({
        title: "Analytics loaded",
        description: `Data refreshed for ${timeRange} period.`,
      });
    } catch (error) {
      toast({
        title: "Failed to load analytics",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const formatTrend = (value: number) => {
    const isPositive = value >= 0;
    return {
      value: Math.abs(value),
      isPositive,
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? 'text-green-600' : 'text-red-600'
    };
  };

  const exportReport = async () => {
    toast({
      title: "Generating report",
      description: "Your analytics report is being prepared...",
    });
    
    // Simulate report generation
    setTimeout(() => {
      toast({
        title: "Report ready",
        description: "Analytics report has been downloaded.",
      });
    }, 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              Analytics & Reports
            </h1>
            <p className="text-muted-foreground">Loading analytics data...</p>
          </div>
        </div>
        
        <div className="grid gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-6 bg-muted rounded animate-pulse" />
                  <div className="h-32 bg-muted rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Analytics & Reports
          </h1>
          <p className="text-muted-foreground">
            Comprehensive insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadAnalytics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Inspections</p>
                <p className="text-2xl font-bold">{data.overview.totalInspections.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-1">
                {(() => {
                  const trend = formatTrend(data.overview.trendsComparison.inspections);
                  const TrendIcon = trend.icon;
                  return (
                    <>
                      <TrendIcon className={`h-4 w-4 ${trend.color}`} />
                      <span className={`text-sm font-medium ${trend.color}`}>
                        {trend.value}%
                      </span>
                    </>
                  );
                })()}
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">
                  {((data.overview.completedInspections / data.overview.totalInspections) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="flex items-center gap-1">
                {(() => {
                  const trend = formatTrend(data.overview.trendsComparison.completion);
                  const TrendIcon = trend.icon;
                  return (
                    <>
                      <TrendIcon className={`h-4 w-4 ${trend.color}`} />
                      <span className={`text-sm font-medium ${trend.color}`}>
                        {trend.value}%
                      </span>
                    </>
                  );
                })()}
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">{data.overview.completedInspections} completed</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Completion Time</p>
                <p className="text-2xl font-bold">{data.overview.avgCompletionTime} days</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-muted-foreground">Target: 3 days</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue Items</p>
                <p className="text-2xl font-bold text-red-600">{data.overview.overdue}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Zap className="h-4 w-4 text-red-600" />
              <span className="text-sm text-muted-foreground">Requires attention</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Inspection Trends</CardTitle>
                <CardDescription>Daily inspection completion over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.charts.inspectionTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="completed" 
                      stackId="1" 
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.6}
                      name="Completed"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="pending" 
                      stackId="1" 
                      stroke="#F59E0B" 
                      fill="#F59E0B" 
                      fillOpacity={0.6}
                      name="Pending"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="overdue" 
                      stackId="1" 
                      stroke="#EF4444" 
                      fill="#EF4444" 
                      fillOpacity={0.6}
                      name="Overdue"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Growth</CardTitle>
                <CardDescription>System activity growth over months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.charts.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="inspections" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      name="Inspections"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="workOrders" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="Work Orders"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#8B5CF6" 
                      strokeWidth={2}
                      name="Active Users"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="status" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
                <CardDescription>Current inspection status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.charts.statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.charts.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Priority Breakdown</CardTitle>
                <CardDescription>Inspections by priority level</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.charts.priorityBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="priority" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
              <CardDescription>Completion rates and compliance by department</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.charts.departmentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#10B981" name="Completed" />
                  <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <h3 className="text-lg font-semibold">Department Compliance Rates</h3>
            {data.charts.departmentPerformance.map((dept) => (
              <Card key={dept.department}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{dept.department}</h4>
                      <p className="text-sm text-muted-foreground">
                        {dept.completed} completed, {dept.pending} pending
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{dept.compliance}%</div>
                      <Badge 
                        className={
                          dept.compliance >= 95 
                            ? 'bg-green-100 text-green-700' 
                            : dept.compliance >= 90 
                            ? 'bg-yellow-100 text-yellow-700' 
                            : 'bg-red-100 text-red-700'
                        }
                      >
                        {dept.compliance >= 95 ? 'Excellent' : dept.compliance >= 90 ? 'Good' : 'Needs Improvement'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Usage Analytics</CardTitle>
              <CardDescription>Most used templates and their success rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.charts.templateUsage.map((template) => (
                  <div key={template.template} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{template.template}</h4>
                      <p className="text-sm text-muted-foreground">
                        {template.usage} uses this period
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{template.success}%</div>
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Available Reports</CardTitle>
                <CardDescription>Generate detailed reports for different aspects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start" onClick={exportReport}>
                  <FileCheck className="h-4 w-4 mr-2" />
                  Inspection Summary Report
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={exportReport}>
                  <Users className="h-4 w-4 mr-2" />
                  User Performance Report
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={exportReport}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Department Analytics Report
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={exportReport}>
                  <PieChartIcon className="h-4 w-4 mr-2" />
                  Compliance Report
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={exportReport}>
                  <Activity className="h-4 w-4 mr-2" />
                  System Usage Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Report Schedule</CardTitle>
                <CardDescription>Automated report generation settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Weekly Summary</div>
                    <div className="text-sm text-muted-foreground">Every Monday at 9:00 AM</div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Monthly Report</div>
                    <div className="text-sm text-muted-foreground">1st of every month</div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Quarterly Review</div>
                    <div className="text-sm text-muted-foreground">End of each quarter</div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-700">Scheduled</Badge>
                </div>
                <Button className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Configure Schedule
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
