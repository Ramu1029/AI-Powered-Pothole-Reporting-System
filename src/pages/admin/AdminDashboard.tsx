import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { StatusBadge, SeverityBadge } from '@/components/common/StatusBadge';
import { FormMessage } from '@/components/common/FormMessage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIndiaLocations } from '@/hooks/useIndiaLocations';
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
  Filter,
} from 'lucide-react';
import { HazardType } from '@/types';

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
  const { reports, users, getPendingStaff, approveStaff } = useData();
  const [successMessage, setSuccessMessage] = useState('');

  // Location filters
  const [filterState, setFilterState] = useState('all');
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [filterMandal, setFilterMandal] = useState('all');
  const { states, districts, mandals, fetchDistricts, fetchMandals } = useIndiaLocations();

  if (!user) return null;

  const pendingStaff = getPendingStaff();

  // Filter reports by location
  const filteredReports = reports.filter(r => {
    if (filterState !== 'all' && r.location.state !== filterState) return false;
    if (filterDistrict !== 'all' && r.location.district !== filterDistrict) return false;
    if (filterMandal !== 'all' && r.location.mandal !== filterMandal) return false;
    return true;
  });

  const stats = {
    totalReports: filteredReports.length,
    pendingReports: filteredReports.filter(r => r.status === 'pending').length,
    resolvedReports: filteredReports.filter(r => r.status === 'resolved').length,
    totalStaff: users.filter(u => u.role === 'municipal_staff').length,
    totalCitizens: users.filter(u => u.role === 'citizen').length,
    criticalReports: filteredReports.filter(r => r.aiAnalysis.severity === 'critical').length,
  };

  const reportsByType = Object.entries(
    filteredReports.reduce((acc, report) => {
      const type = report.aiAnalysis.hazardType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([type, count]) => ({
    name: hazardTypeLabels[type as HazardType] || type,
    value: count,
  }));

  const reportsBySeverity = Object.entries(
    filteredReports.reduce((acc, report) => {
      const severity = report.aiAnalysis.severity;
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([severity, count]) => ({
    name: severity.charAt(0).toUpperCase() + severity.slice(1),
    value: count,
  }));

  // Reports grouped by district
  const reportsByDistrict = Object.entries(
    filteredReports.reduce((acc, report) => {
      const district = report.location.district || 'Unknown';
      acc[district] = (acc[district] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([district, count]) => ({
    name: district,
    reports: count,
  }));

  const handleApproveStaff = async (userId: string) => {
    await approveStaff(userId);
    setSuccessMessage('Staff member approved successfully');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleStateFilter = (value: string) => {
    setFilterState(value);
    setFilterDistrict('all');
    setFilterMandal('all');
    if (value !== 'all') {
      const selected = states.find(s => s.name === value);
      if (selected) fetchDistricts(selected.id);
    }
  };

  const handleDistrictFilter = (value: string) => {
    setFilterDistrict(value);
    setFilterMandal('all');
    if (value !== 'all') {
      const selected = districts.find(d => d.name === value);
      if (selected) fetchMandals(selected.id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Administrator Dashboard</h1>
          <p className="text-muted-foreground mt-1">System overview and management</p>
        </div>

        {successMessage && <FormMessage type="success" message={successMessage} />}

        {/* Location Filters */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filter by Location</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select value={filterState} onValueChange={handleStateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="all">All States</SelectItem>
                {states.map(s => (
                  <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterDistrict} onValueChange={handleDistrictFilter} disabled={filterState === 'all'}>
              <SelectTrigger>
                <SelectValue placeholder={filterState === 'all' ? 'Select state first' : 'All Districts'} />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="all">All Districts</SelectItem>
                {districts.map(d => (
                  <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterMandal} onValueChange={setFilterMandal} disabled={filterDistrict === 'all'}>
              <SelectTrigger>
                <SelectValue placeholder={filterDistrict === 'all' ? 'Select district first' : 'All Mandals'} />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="all">All Mandals</SelectItem>
                {mandals.map(m => (
                  <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

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
            <TabsTrigger value="reports">
              <FileText className="h-4 w-4 mr-2" />
              All Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-sm font-medium text-foreground mb-4">Reports by Hazard Type</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportsByType} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis dataKey="name" type="category" width={100} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px' }} />
                      <Bar dataKey="value" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-sm font-medium text-foreground mb-4">Reports by Severity</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={reportsBySeverity} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                        {reportsBySeverity.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-card rounded-lg border border-border p-6 lg:col-span-2">
                <h3 className="text-sm font-medium text-foreground mb-4">Reports by District</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportsByDistrict}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px' }} />
                      <Bar dataKey="reports" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            {pendingStaff.length > 0 && (
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Pending Staff Approvals
                </h3>
                <div className="space-y-3">
                  {pendingStaff.map(staff => (
                    <div key={staff.id} className="flex items-start justify-between p-4 bg-muted/50 rounded-lg gap-4">
                      <div className="space-y-2 min-w-0">
                        <div>
                          <p className="font-medium text-foreground">{staff.name}</p>
                          <p className="text-sm text-muted-foreground">{staff.email}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                          {staff.phone && (
                            <div>
                              <span className="text-muted-foreground">Phone: </span>
                              <span className="font-medium text-foreground">{staff.phone}</span>
                            </div>
                          )}
                          {staff.state && (
                            <div>
                              <span className="text-muted-foreground">State: </span>
                              <span className="font-medium text-foreground">{staff.state}</span>
                            </div>
                          )}
                          {staff.district && (
                            <div>
                              <span className="text-muted-foreground">District: </span>
                              <span className="font-medium text-foreground">{staff.district}</span>
                            </div>
                          )}
                          {staff.mandal && (
                            <div>
                              <span className="text-muted-foreground">Mandal: </span>
                              <span className="font-medium text-foreground">{staff.mandal}</span>
                            </div>
                          )}
                          {!staff.phone && !staff.state && (
                            <p className="text-muted-foreground col-span-2 italic">Verification details not yet submitted</p>
                          )}
                        </div>
                      </div>
                      <Button variant="accent" size="sm" onClick={() => handleApproveStaff(staff.id)} className="shrink-0">
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => u.role === 'municipal_staff').map(staff => (
                    <tr key={staff.id}>
                      <td className="font-medium text-foreground">{staff.name}</td>
                      <td className="text-muted-foreground">{staff.email}</td>
                      <td className="text-sm">
                        {staff.state ? `${staff.mandal || ''}, ${staff.district || ''}, ${staff.state}` : '-'}
                      </td>
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

          <TabsContent value="reports" className="space-y-6">
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>State</th>
                    <th>District</th>
                    <th>Mandal</th>
                    <th>Severity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground">
                        No reports found for selected filters
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map(report => (
                      <tr key={report.id}>
                        <td className="font-medium text-foreground">{report.title}</td>
                        <td className="text-sm">{report.location.state || '-'}</td>
                        <td className="text-sm">{report.location.district || '-'}</td>
                        <td className="text-sm">{report.location.mandal || '-'}</td>
                        <td><SeverityBadge severity={report.aiAnalysis.severity} /></td>
                        <td><StatusBadge status={report.status} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
