import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Header } from '@/components/layout/Header';
import { StatusBadge, SeverityBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
} from '@/components/ui/dialog';
import { FormMessage } from '@/components/common/FormMessage';
import { HazardReport, ReportStatus } from '@/types';
import {
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Brain,
  User,
  Calendar,
  Camera,
  X,
  Loader2,
  Upload,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

const hazardTypeLabels: Record<string, string> = {
  pothole: 'Pothole',
  crack: 'Road Crack',
  flooding: 'Flooding',
  debris: 'Debris',
  damaged_signage: 'Damaged Signage',
  broken_barrier: 'Broken Barrier',
  uneven_surface: 'Uneven Surface',
  erosion: 'Erosion',
};

export default function StaffDashboard() {
  const { user } = useAuth();
  const { reports, updateReportStatus, assignReport } = useData();
  const [selectedReport, setSelectedReport] = useState<HazardReport | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [remark, setRemark] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const proofInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const regionReports = reports.filter(
    r => r.location.region === user.region || r.assignedTo === user.id
  );

  const filteredReports = statusFilter === 'all'
    ? regionReports
    : regionReports.filter(r => r.status === statusFilter);

  const stats = {
    total: regionReports.length,
    pending: regionReports.filter(r => r.status === 'pending').length,
    assigned: regionReports.filter(r => r.assignedTo === user.id).length,
    resolved: regionReports.filter(r => r.status === 'resolved').length,
  };

  const handleTakeAssignment = async (report: HazardReport) => {
    await assignReport(report.id, user.id, user.name);
    setSuccessMessage('Report assigned to you successfully');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleProofSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return;
    setProofFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setProofPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeProof = () => {
    setProofFile(null);
    setProofPreview(null);
    if (proofInputRef.current) proofInputRef.current.value = '';
  };

  const uploadProofImage = async (): Promise<string | null> => {
    if (!proofFile || !user) return null;
    const ext = proofFile.name.split('.').pop();
    const path = `proofs/${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('hazard-images').upload(path, proofFile);
    if (error) return null;
    const { data } = supabase.storage.from('hazard-images').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleStatusUpdate = async (newStatus: ReportStatus) => {
    if (!selectedReport) return;

    setUploadingProof(true);
    let proofUrl: string | null = null;
    if (proofFile) {
      proofUrl = await uploadProofImage();
    }

    const remarkText = remark.trim() || `Status updated to ${newStatus}`;

    // If proof uploaded, save it to the report
    if (proofUrl) {
      await supabase
        .from('hazard_reports' as any)
        .update({ proof_image_url: proofUrl } as any)
        .eq('id', selectedReport.id);
    }

    await updateReportStatus(selectedReport.id, newStatus, remarkText);

    setUploadingProof(false);
    setSelectedReport(null);
    setRemark('');
    setProofFile(null);
    setProofPreview(null);
    setSuccessMessage('Report status updated successfully');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Staff Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage hazard reports in {user.region}
          </p>
        </div>

        {successMessage && <FormMessage type="success" message={successMessage} />}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <ClipboardList className="h-5 w-5 text-muted-foreground" />
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
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <User className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.assigned}</p>
                <p className="text-sm text-muted-foreground">Assigned to Me</p>
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

        {/* Filter & Reports List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="section-title mb-0">Reports</h2>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reports</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Report</th>
                  <th>Location</th>
                  <th>AI Analysis</th>
                  <th>Status</th>
                  <th>Assigned</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No reports found
                    </td>
                  </tr>
                ) : (
                  filteredReports.map(report => (
                    <tr key={report.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <img src={report.imageUrl} alt="" className="w-12 h-12 rounded-md object-cover" />
                          <div>
                            <p className="font-medium text-foreground line-clamp-1">{report.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="line-clamp-1">{report.location.address}</span>
                        </div>
                      </td>
                      <td>
                        <div className="space-y-1">
                          <p className="text-sm">{hazardTypeLabels[report.aiAnalysis.hazardType]}</p>
                          <SeverityBadge severity={report.aiAnalysis.severity} />
                        </div>
                      </td>
                      <td><StatusBadge status={report.status} /></td>
                      <td>
                        {report.assignedStaffName ? (
                          <span className="text-sm text-foreground">{report.assignedStaffName}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Unassigned</span>
                        )}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          {!report.assignedTo && report.status === 'pending' && (
                            <Button size="sm" variant="accent" onClick={() => handleTakeAssignment(report)}>
                              Take
                            </Button>
                          )}
                          {(report.assignedTo === user.id || report.status !== 'resolved') && (
                            <Button size="sm" variant="outline" onClick={() => setSelectedReport(report)}>
                              Review
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
        </div>
      </main>

      {/* Review Modal */}
      <Dialog open={!!selectedReport} onOpenChange={() => { setSelectedReport(null); removeProof(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Report</DialogTitle>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg overflow-hidden border border-border">
                  <img src={selectedReport.imageUrl} alt={selectedReport.title} className="w-full aspect-video object-cover" />
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-foreground">{selectedReport.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{selectedReport.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedReport.location.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(selectedReport.createdAt), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                  <div className="flex gap-2">
                    <StatusBadge status={selectedReport.status} />
                    <SeverityBadge severity={selectedReport.aiAnalysis.severity} />
                  </div>
                </div>
              </div>

              {/* AI Analysis */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium">AI Analysis</span>
                </div>
                <p className="text-sm text-muted-foreground">{selectedReport.aiAnalysis.description}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Confidence: {Math.round(selectedReport.aiAnalysis.confidence * 100)}%
                </p>
              </div>

              {/* Remarks */}
              {selectedReport.remarks.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Previous Remarks</h4>
                  <div className="space-y-2">
                    {selectedReport.remarks.map((r, i) => (
                      <div key={i} className="bg-muted/50 rounded-md p-2 text-sm text-muted-foreground">{r}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Proof Image Upload */}
              <div className="space-y-2">
                <Label>Proof Image (optional)</Label>
                {proofPreview ? (
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <img src={proofPreview} alt="Proof" className="w-full aspect-video object-cover" />
                    <button
                      type="button"
                      onClick={removeProof}
                      className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-background transition-colors"
                    >
                      <X className="h-4 w-4 text-foreground" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => proofInputRef.current?.click()}
                    className="w-full py-6 rounded-lg border-2 border-dashed border-border hover:border-accent flex flex-col items-center justify-center gap-2 transition-colors bg-muted/30"
                  >
                    <Camera className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upload proof photo</span>
                    <span className="text-xs text-muted-foreground">JPG, PNG up to 5MB</span>
                  </button>
                )}
                <input
                  ref={proofInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProofSelect}
                  className="hidden"
                />
              </div>

              {/* Add Remark */}
              <div>
                <Label>Add Remark</Label>
                <Textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Enter your remarks or observations..."
                  className="mt-2"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {(selectedReport.status === 'pending' || selectedReport.status === 'under_review') && (
                  <>
                    <Button
                      variant="accent"
                      onClick={() => handleStatusUpdate('verified')}
                      className="flex-1"
                      disabled={uploadingProof}
                    >
                      {uploadingProof ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                      Verify
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleStatusUpdate('rejected')}
                      className="flex-1"
                      disabled={uploadingProof}
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </>
                )}
                {selectedReport.status === 'verified' && (
                  <Button
                    variant="warning"
                    onClick={() => handleStatusUpdate('in_progress')}
                    className="flex-1"
                    disabled={uploadingProof}
                  >
                    Mark In Progress
                  </Button>
                )}
                {selectedReport.status === 'in_progress' && (
                  <Button
                    variant="success"
                    onClick={() => handleStatusUpdate('resolved')}
                    className="flex-1"
                    disabled={uploadingProof}
                  >
                    {uploadingProof ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    Mark Resolved
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
