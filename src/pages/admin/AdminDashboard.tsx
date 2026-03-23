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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  UserCheck,
  Filter,
  UserPlus,
  MapPin,
  Brain,
  Calendar,
} from 'lucide-react';
import { HazardReport, HazardType } from '@/types';
import { format, formatDistanceToNow } from 'date-fns';

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
  const { reports, users, getPendingStaff, approveStaff, assignReport } = useData();
  const [successMessage, setSuccessMessage] = useState('');

  // Location filters
  const [filterState, setFilterState] = useState('all');
  const [filterStateId, setFilterStateId] = useState<number | null>(null);
  const [filterDistrict, setFilterDistrict] = useState('all');
  const { states, districts, fetchDistricts } = useIndiaLocations();

  // Assign modal state
  const [assigningReport, setAssigningReport] = useState<HazardReport | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Report detail modal
  const [viewingReport, setViewingReport] = useState<HazardReport | null>(null);

  if (!user) return null;

  const pendingStaff = getPendingStaff();
  const approvedStaff = users.filter(u => u.role === 'municipal_staff' && u.isApproved);

  // Filter reports by location
  const filteredReports = reports.filter(r => {
    if (filterState !== 'all' && r.location.state !== filterState) return false;
    if (filterDistrict !== 'all' && r.location.district !== filterDistrict) return false;
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
    setFilterDistrict('all');
    if (value !== 'all') {
      const id = Number(value);
      const selected = states.find(s => s.state_id === id);
      if (selected) {
        setFilterState(selected.state_name);
        setFilterStateId(selected.state_id);
        fetchDistricts(selected.state_id);
      }
    } else {
      setFilterState('all');
      setFilterStateId(null);
    }
  };

  const handleDistrictFilter = (value: string) => {
    if (value !== 'all') {
      const id = Number(value);
      const selected = districts.find(d => d.district_id === id);
      if (selected) setFilterDistrict(selected.district_name);
    } else {
      setFilterDistrict('all');
    }
  };

  const openAssignModal = (report: HazardReport) => {
    setAssigningReport(report);
    setSelectedStaffId(report.assignedTo || '');
  };

  const handleAssign = async () => {
    if (!assigningReport || !selectedStaffId) return;
    setAssigning(true);
    const staff = approvedStaff.find(s => s.id === selectedStaffId);
    if (staff) {
      await assignReport(assigningReport.id, staff.id, staff.name);
      setSuccessMessage(`Report assigned to ${staff.name}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
    setAssigning(false);
    setAssigningReport(null);
    setSelectedStaffId('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              value={filterStateId !== null ? String(filterStateId) : 'all'}
              onValueChange={handleStateFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="all">All States</SelectItem>
                {states.map(s => (
                  <SelectItem key={s.state_id} value={String(s.state_id)}>{s.state_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filterDistrict === 'all' ? 'all' : String(districts.find(d => d.district_name === filterDistrict)?.district_id ?? 'all')}
              onValueChange={handleDistrictFilter}
              disabled={filterStateId === null}
            >
              <SelectTrigger>
                <SelectValue placeholder={filterStateId === null ? 'Select state first' : 'All Districts'} />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="all">All Districts</SelectItem>
                {districts.map(d => (
                  <SelectItem key={d.district_id} value={String(d.district_id)}>{d.district_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
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
          <TabsList className="w-full sm:w-auto flex">
            <TabsTrigger value="analytics" className="flex-1 sm:flex-initial text-xs sm:text-sm">
              <LayoutDashboard className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex-1 sm:flex-initial text-xs sm:text-sm">
              <Users className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Staff</span>
              {pendingStaff.length > 0 && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                  {pendingStaff.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex-1 sm:flex-initial text-xs sm:text-sm">
              <FileText className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Reports</span>
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
              <div className="bg-card rounded-lg border border-border p-4 sm:p-6">
                <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Pending Staff Approvals
                </h3>
                <div className="space-y-3">
                  {pendingStaff.map(staff => (
                    <div key={staff.id} className="flex flex-col sm:flex-row sm:items-start sm:justify-between p-4 bg-muted/50 rounded-lg gap-3 sm:gap-4">
                      <div className="space-y-2 min-w-0">
                        <div>
                          <p className="font-medium text-foreground">{staff.name}</p>
                          <p className="text-sm text-muted-foreground">{staff.email}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs">
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
                      <Button variant="accent" size="sm" onClick={() => handleApproveStaff(staff.id)} className="shrink-0 w-full sm:w-auto">
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile card view for staff */}
            <div className="sm:hidden space-y-3">
              {users.filter(u => u.role === 'municipal_staff').map(staff => (
                <div key={staff.id} className="bg-card rounded-lg border border-border p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">{staff.name}</p>
                    {staff.isApproved ? (
                      <span className="inline-flex items-center gap-1 text-success text-xs">
                        <CheckCircle className="h-3 w-3" />
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-warning text-xs">
                        <Clock className="h-3 w-3" />
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{staff.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {staff.state ? `${staff.mandal || ''}, ${staff.district || ''}, ${staff.state}` : '-'}
                  </p>
                  <p className="text-xs text-muted-foreground">{new Date(staff.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
            {/* Desktop table */}
            <div className="hidden sm:block bg-card rounded-lg border border-border overflow-hidden">
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
            {/* Mobile card view for reports */}
            <div className="sm:hidden space-y-3">
              {filteredReports.length === 0 ? (
                <div className="bg-card rounded-lg border border-border p-8 text-center text-muted-foreground">
                  No reports found for selected filters
                </div>
              ) : (
                filteredReports.map(report => (
                  <div key={report.id} className="bg-card rounded-lg border border-border p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground line-clamp-1">{report.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <SeverityBadge severity={report.aiAnalysis.severity} />
                        <StatusBadge status={report.status} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {report.location.district || '-'}, {report.location.state || ''}
                    </div>
                    <div className="text-xs">
                      <span className="text-muted-foreground">Assigned: </span>
                      {report.assignedStaffName ? (
                        <span className="font-medium text-foreground">{report.assignedStaffName}</span>
                      ) : (
                        <span className="text-muted-foreground italic">Unassigned</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => setViewingReport(report)}>View</Button>
                      {report.status !== 'resolved' && report.status !== 'rejected' && (
                        <Button size="sm" variant="accent" className="flex-1" onClick={() => openAssignModal(report)}>
                          <UserPlus className="h-3 w-3 mr-1" /> Assign
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Desktop table */}
            <div className="hidden sm:block bg-card rounded-lg border border-border overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Report</th>
                    <th>Location</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th>Actions</th>
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
                        <td>
                          <div>
                            <p className="font-medium text-foreground line-clamp-1">{report.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </td>
                        <td className="text-sm">
                          <div>
                            <p>{report.location.district || '-'}</p>
                            <p className="text-xs text-muted-foreground">{report.location.state || ''}</p>
                          </div>
                        </td>
                        <td><SeverityBadge severity={report.aiAnalysis.severity} /></td>
                        <td><StatusBadge status={report.status} /></td>
                        <td>
                          {report.assignedStaffName ? (
                            <span className="text-sm text-foreground font-medium">{report.assignedStaffName}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">Unassigned</span>
                          )}
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setViewingReport(report)}>View</Button>
                            {report.status !== 'resolved' && report.status !== 'rejected' && (
                              <Button size="sm" variant="accent" onClick={() => openAssignModal(report)}>
                                <UserPlus className="h-3 w-3 mr-1" /> Assign
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Assign Staff Modal */}
      <Dialog open={!!assigningReport} onOpenChange={() => { setAssigningReport(null); setSelectedStaffId(''); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Report to Staff</DialogTitle>
          </DialogHeader>

          {assigningReport && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="font-medium text-foreground text-sm">{assigningReport.title}</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {assigningReport.location.district}, {assigningReport.location.state}
                </p>
                <div className="flex gap-2 mt-2">
                  <StatusBadge status={assigningReport.status} />
                  <SeverityBadge severity={assigningReport.aiAnalysis.severity} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Select Staff Member</label>
                {approvedStaff.length === 0 ? (
                  <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                    No approved staff available. Approve staff members first from the Staff Management tab.
                  </p>
                ) : (
                  <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a staff member..." />
                    </SelectTrigger>
                    <SelectContent>
                      {approvedStaff.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          <div className="flex flex-col">
                            <span>{s.name}</span>
                            {s.district && (
                              <span className="text-xs text-muted-foreground">{s.district}, {s.state}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setAssigningReport(null); setSelectedStaffId(''); }}>
              Cancel
            </Button>
            <Button
              variant="accent"
              onClick={handleAssign}
              disabled={!selectedStaffId || assigning || approvedStaff.length === 0}
            >
              {assigning ? 'Assigning...' : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Detail Modal */}
      <Dialog open={!!viewingReport} onOpenChange={() => setViewingReport(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
          </DialogHeader>

          {viewingReport && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg overflow-hidden border border-border">
                  <img src={viewingReport.imageUrl} alt={viewingReport.title} className="w-full aspect-video object-cover" />
                </div>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-foreground">{viewingReport.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{viewingReport.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{viewingReport.location.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(viewingReport.createdAt), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                  <div className="flex gap-2">
                    <StatusBadge status={viewingReport.status} />
                    <SeverityBadge severity={viewingReport.aiAnalysis.severity} />
                  </div>
                  {viewingReport.assignedStaffName && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Assigned to: </span>
                      <span className="font-medium text-foreground">{viewingReport.assignedStaffName}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium">AI Analysis</span>
                </div>
                <p className="text-sm font-medium">{hazardTypeLabels[viewingReport.aiAnalysis.hazardType]}</p>
                <p className="text-sm text-muted-foreground mt-1">{viewingReport.aiAnalysis.description}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Confidence: {Math.round(viewingReport.aiAnalysis.confidence * 100)}%
                </p>
              </div>

              {viewingReport.remarks.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Remarks</h4>
                  <div className="space-y-2">
                    {viewingReport.remarks.map((r, i) => (
                      <div key={i} className="bg-muted/50 rounded-md p-2 text-sm text-muted-foreground">{r}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
