import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Header } from '@/components/layout/Header';
import { StatusBadge, SeverityBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FormMessage } from '@/components/common/FormMessage';
import { ProfileFormModal } from '@/components/common/ProfileFormModal';
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
  AlertTriangle,
  Phone,
  MapPinned,
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
  const { reports, updateReportStatus } = useData();
  const [selectedReport, setSelectedReport] = useState<HazardReport | null>(null);
  const [remark, setRemark] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const proofInputRef = useRef<HTMLInputElement>(null);

  // Profile state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const isProfileComplete = !!(user?.phone && user?.state && user?.district && user?.mandal);

  // Show mandatory modal if profile is incomplete
  useEffect(() => {
    if (user && !isProfileComplete) {
      setShowProfileModal(true);
    }
  }, [user, isProfileComplete]);

  if (!user) return null;

  // Staff sees only reports assigned to them
  const myReports = reports.filter(r => r.assignedTo === user.id);

  const stats = {
    total: myReports.length,
    pending: myReports.filter(r => r.status === 'pending' || r.status === 'under_review').length,
    inProgress: myReports.filter(r => r.status === 'in_progress' || r.status === 'verified').length,
    resolved: myReports.filter(r => r.status === 'resolved').length,
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

    if (newStatus === 'resolved' && !proofFile) {
      return;
    }

    setUploadingProof(true);
    let proofUrl: string | null = null;
    if (proofFile) {
      proofUrl = await uploadProofImage();
    }

    const remarkText = remark.trim() || `Status updated to ${newStatus}`;

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

  const closeModal = () => {
    setSelectedReport(null);
    removeProof();
    setRemark('');
  };

  const canResolve = selectedReport?.status === 'in_progress';
  const needsProofForResolve = canResolve && !proofFile;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Staff Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Reports assigned to you in {user.district ? `${user.district}, ${user.state}` : user.region || 'your region'}
            </p>
          </div>
        </div>

        {successMessage && <FormMessage type="success" message={successMessage} />}

        {/* Profile Info Card */}
        {isProfileComplete && (
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{user.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPinned className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{user.mandal}, {user.district}, {user.state}</span>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <ClipboardList className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Assigned to Me</p>
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
                <p className="text-sm text-muted-foreground">Needs Review</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <User className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{stats.inProgress}</p>
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

        {/* Reports List */}
        <div className="space-y-4">
          <h2 className="section-title mb-0">My Assigned Reports</h2>

          {myReports.length === 0 ? (
            <div className="bg-card rounded-lg border border-border p-12 text-center">
              <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-foreground font-medium">No reports assigned yet</p>
              <p className="text-muted-foreground text-sm mt-1">The admin will assign reports to you. Check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myReports.map(report => (
                <div
                  key={report.id}
                  className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {report.imageUrl && (
                      <img
                        src={report.imageUrl}
                        alt={report.title}
                        className="w-20 h-20 rounded-lg object-cover border border-border shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-medium text-foreground">{report.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{report.description}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <StatusBadge status={report.status} />
                          <SeverityBadge severity={report.aiAnalysis.severity} />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {report.location.district}, {report.location.state}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Brain className="h-3 w-3" />
                          {hazardTypeLabels[report.aiAnalysis.hazardType]}
                        </span>
                      </div>

                      {report.remarks.length > 0 && (
                        <p className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
                          Last remark: {report.remarks[report.remarks.length - 1]}
                        </p>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="accent"
                      className="shrink-0"
                      onClick={() => setSelectedReport(report)}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Review & Response Modal */}
      <Dialog open={!!selectedReport} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review & Respond to Report</DialogTitle>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-6">
              {/* Report Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg overflow-hidden border border-border">
                  <img src={selectedReport.imageUrl} alt={selectedReport.title} className="w-full aspect-video object-cover" />
                </div>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-foreground">{selectedReport.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{selectedReport.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedReport.location.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
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
                <p className="text-sm font-medium">{hazardTypeLabels[selectedReport.aiAnalysis.hazardType]}</p>
                <p className="text-sm text-muted-foreground mt-1">{selectedReport.aiAnalysis.description}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Confidence: {Math.round(selectedReport.aiAnalysis.confidence * 100)}%
                </p>
              </div>

              {/* Previous Remarks */}
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
                <Label>
                  Proof Image
                  {canResolve && <span className="text-destructive ml-1">*</span>}
                  {!canResolve && <span className="text-muted-foreground ml-1">(optional)</span>}
                </Label>
                {canResolve && (
                  <p className="text-xs text-muted-foreground">Upload a photo showing the hazard has been resolved. Required to mark as resolved.</p>
                )}
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
                <Label>Add Remark / Observation</Label>
                <Textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Describe your findings, actions taken, or any observations..."
                  className="mt-2"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                {(selectedReport.status === 'pending' || selectedReport.status === 'under_review') && (
                  <div className="flex gap-3">
                    <Button
                      variant="accent"
                      onClick={() => handleStatusUpdate('verified')}
                      className="flex-1"
                      disabled={uploadingProof}
                    >
                      {uploadingProof ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                      Verify Report
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleStatusUpdate('rejected')}
                      className="flex-1"
                      disabled={uploadingProof}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}

                {selectedReport.status === 'verified' && (
                  <Button
                    variant="warning"
                    onClick={() => handleStatusUpdate('in_progress')}
                    className="w-full"
                    disabled={uploadingProof}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Mark In Progress
                  </Button>
                )}

                {selectedReport.status === 'in_progress' && (
                  <div className="space-y-2">
                    {needsProofForResolve && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Please upload a proof image before marking as resolved
                      </p>
                    )}
                    <Button
                      variant="success"
                      onClick={() => handleStatusUpdate('resolved')}
                      className="w-full"
                      disabled={uploadingProof || needsProofForResolve}
                    >
                      {uploadingProof ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                      Mark Resolved (with proof)
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Profile Modal */}
      <ProfileFormModal
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
        mandatory={!isProfileComplete}
      />
    </div>
  );
}
