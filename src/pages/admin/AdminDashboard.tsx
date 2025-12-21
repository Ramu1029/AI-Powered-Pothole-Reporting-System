import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { StatusBadge, SeverityBadge } from '@/components/common/StatusBadge';
import { FormMessage } from '@/components/common/FormMessage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  LayoutDashboard,
  Users,
  MapPin,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { HazardType, Severity } from '@/types';

const COLORS = ['hsl(185, 35%, 35%)', 'hsl(220, 25%, 35%)', 'hsl(160, 40%, 35%)', 'hsl(40, 50%, 45%)', 'hsl(0, 45%, 45%)'];

const hazardTypeLabels: Record<HazardType, string> = {
  pothole: 'Pothole',
  crack: 'Road Crack',
  flooding: 'Flooding',
  debris: 'Debris',
  damaged_signage: 'Damaged Signage',
  broken_barrier: 'Broken Barrier',
  uneven_surface: 'Uneven Surface',
  erosion: 'Erosion',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const { reports, users, regions, getPendingStaff, approveStaff } = useData();
  const [successMessage, setSuccessMessage] = useState('');

  if (!user) return null;

  const pendingStaff = getPendingStaff();

  // Calculate stats
  const stats = {
    totalReports: reports.length,
    pendingReports: reports.filter(r => r.status === 'pending').length,
    resolvedReports: reports.filter(r => r.status === 'resolved').length,
    totalStaff: users.filter(u => u.role === 'municipal_staff').length,
    totalCitizens: users.filter(u => u.role === 'citizen').length,
    criticalReports: reports.filter(r => r.aiAnalysis.severity === 'critical').length,
  };

  // Reports by type for chart
  const reportsByType = Object.entries(
    reports.reduce((acc, report) => {
      const type = report.aiAnalysis.hazardType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([type, count]) => ({
    name: hazardTypeLabels[type as HazardType] || type,
    value: count,
  }));

  // Reports by severity for pie chart
  const reportsBySeverity = Object.entries(
    reports.reduce((acc, report) => {
      const severity = report.aiAnalysis.severity;
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([severity, count]) => ({
    name: severity.charAt(0).toUpperCase() + severity.slice(1),
    value: count,
  }));

  // Reports by region
  const reportsByRegion = Object.entries(
    reports.reduce((acc, report) => {
      const region = report.location.region;
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([region, count]) => ({
    name: region,
    reports: count,
  }));

  const handleApproveStaff = (userId: string) => {
    approveStaff(userId);
    setSuccessMessage('Staff member approved successfully');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Administrator Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            System overview and management
          </p>
        </div>

        {successMessage && (
          <FormMessage type="success" message={successMessage} />
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.totalReports}</p>
                <p className="text-xs text-muted-foreground">Total Reports</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.pendingReports}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.resolvedReports}</p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.criticalReports}</p>
                <p className="text-xs text-muted-foreground">Critical</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.totalStaff}</p>
                <p className="text-xs text-muted-foreground">Staff</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                <Users className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.totalCitizens}</p>
                <p className="text-xs text-muted-foreground">Citizens</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList>
            <TabsTrigger value="analytics">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="staff">
              <Users className="h-4 w-4 mr-2" />
              Staff Management
              {pendingStaff.length > 0 && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                  {pendingStaff.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="regions">
              <MapPin className="h-4 w-4 mr-2" />
              Regions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Reports by Type */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-sm font-medium text-foreground mb-4">Reports by Hazard Type</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportsByType} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis dataKey="name" type="category" width={100} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                        }}
                      />
                      <Bar dataKey="value" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Reports by Severity */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-sm font-medium text-foreground mb-4">Reports by Severity</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportsBySeverity}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {reportsBySeverity.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Reports by Region */}
              <div className="bg-card rounded-lg border border-border p-6 lg:col-span-2">
                <h3 className="text-sm font-medium text-foreground mb-4">Reports by Region</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportsByRegion}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                        }}
                      />
                      <Bar dataKey="reports" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            {/* Pending Approvals */}
            {pendingStaff.length > 0 && (
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Pending Staff Approvals
                </h3>
                <div className="space-y-3">
                  {pendingStaff.map(staff => (
                    <div
                      key={staff.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-foreground">{staff.name}</p>
                        <p className="text-sm text-muted-foreground">{staff.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">Region: {staff.region}</p>
                      </div>
                      <Button variant="accent" size="sm" onClick={() => handleApproveStaff(staff.id)}>
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Staff */}
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Region</th>
                    <th>Status</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => u.role === 'municipal_staff').map(staff => (
                    <tr key={staff.id}>
                      <td className="font-medium text-foreground">{staff.name}</td>
                      <td className="text-muted-foreground">{staff.email}</td>
                      <td>{staff.region}</td>
                      <td>
                        {staff.isApproved ? (
                          <span className="inline-flex items-center gap-1 text-success text-sm">
                            <CheckCircle className="h-3 w-3" />
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-warning text-sm">
                            <Clock className="h-3 w-3" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="text-muted-foreground">
                        {new Date(staff.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="regions" className="space-y-6">
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Region</th>
                    <th>Code</th>
                    <th>Staff Count</th>
                    <th>Active Reports</th>
                  </tr>
                </thead>
                <tbody>
                  {regions.map(region => {
                    const regionReports = reports.filter(
                      r => r.location.region === region.name && r.status !== 'resolved'
                    ).length;
                    const regionStaff = users.filter(
                      u => u.role === 'municipal_staff' && u.region === region.name && u.isApproved
                    ).length;

                    return (
                      <tr key={region.id}>
                        <td className="font-medium text-foreground">{region.name}</td>
                        <td className="text-muted-foreground">{region.code}</td>
                        <td>{regionStaff}</td>
                        <td>
                          <span className={regionReports > 10 ? 'text-destructive font-medium' : ''}>
                            {regionReports}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
