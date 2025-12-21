import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Header } from '@/components/layout/Header';
import { HazardCard } from '@/components/common/HazardCard';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Clock, CheckCircle } from 'lucide-react';
import { ReportHazardModal } from './ReportHazardModal';
import { ReportDetailModal } from './ReportDetailModal';
import { HazardReport } from '@/types';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const { getReportsByUser, reports } = useData();
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<HazardReport | null>(null);

  if (!user) return null;

  const userReports = getReportsByUser(user.id);
  const nearbyReports = reports.filter(
    r => r.location.region === user.region && r.reportedBy !== user.id
  ).slice(0, 6);

  const stats = {
    total: userReports.length,
    pending: userReports.filter(r => ['pending', 'under_review'].includes(r.status)).length,
    resolved: userReports.filter(r => r.status === 'resolved').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
        {/* Welcome & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Welcome back, {user.name.split(' ')[0]}</h1>
            <p className="text-muted-foreground mt-1">Track your reports and help improve road safety</p>
          </div>
          <Button onClick={() => setShowReportModal(true)} variant="accent" size="lg">
            <Plus className="h-4 w-4" />
            Report Hazard
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Reports</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.resolved}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>
          </div>
        </div>

        {/* My Reports */}
        <section>
          <h2 className="section-title">My Reports</h2>
          {userReports.length === 0 ? (
            <div className="bg-card rounded-lg border border-border p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No reports yet</h3>
              <p className="text-muted-foreground mb-4">
                Help improve road safety by reporting hazards in your area
              </p>
              <Button onClick={() => setShowReportModal(true)} variant="accent">
                <Plus className="h-4 w-4" />
                Submit Your First Report
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userReports.map(report => (
                <HazardCard
                  key={report.id}
                  report={report}
                  onClick={() => setSelectedReport(report)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Nearby Hazards */}
        {nearbyReports.length > 0 && (
          <section>
            <h2 className="section-title">Nearby Hazards in {user.region}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearbyReports.map(report => (
                <HazardCard
                  key={report.id}
                  report={report}
                  onClick={() => setSelectedReport(report)}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <ReportHazardModal
        open={showReportModal}
        onClose={() => setShowReportModal(false)}
      />

      <ReportDetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
}
