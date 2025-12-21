import { HazardReport } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StatusBadge, SeverityBadge } from '@/components/common/StatusBadge';
import { MapPin, Clock, User, Brain, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface ReportDetailModalProps {
  report: HazardReport | null;
  onClose: () => void;
}

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

export function ReportDetailModal({ report, onClose }: ReportDetailModalProps) {
  if (!report) return null;

  return (
    <Dialog open={!!report} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{report.title}</span>
            <StatusBadge status={report.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image */}
          <div className="rounded-lg overflow-hidden border border-border">
            <img
              src={report.imageUrl}
              alt={report.title}
              className="w-full aspect-video object-cover"
            />
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">{report.description}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>Location</span>
              </div>
              <p className="text-sm text-foreground">{report.location.address}</p>
              <p className="text-xs text-muted-foreground">{report.location.region}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Reported</span>
              </div>
              <p className="text-sm text-foreground">
                {format(new Date(report.createdAt), 'MMM d, yyyy')}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(report.createdAt), 'h:mm a')}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>Reported By</span>
              </div>
              <p className="text-sm text-foreground">{report.reporterName}</p>
            </div>

            {report.assignedStaffName && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>Assigned To</span>
                </div>
                <p className="text-sm text-foreground">{report.assignedStaffName}</p>
              </div>
            )}
          </div>

          {/* AI Analysis */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-foreground">AI Analysis</span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Hazard Type</p>
                <p className="font-medium text-foreground">
                  {hazardTypeLabels[report.aiAnalysis.hazardType]}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Severity</p>
                <SeverityBadge severity={report.aiAnalysis.severity} />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Confidence</p>
                <p className="font-medium text-foreground">
                  {Math.round(report.aiAnalysis.confidence * 100)}%
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground border-t border-border pt-3">
              {report.aiAnalysis.description}
            </p>
          </div>

          {/* Remarks */}
          {report.remarks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium text-foreground">Status Updates</h4>
              </div>
              <div className="space-y-2">
                {report.remarks.map((remark, index) => (
                  <div
                    key={index}
                    className="bg-muted/50 rounded-md p-3 text-sm text-muted-foreground"
                  >
                    {remark}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-medium text-foreground mb-3">Timeline</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="text-foreground">
                  {format(new Date(report.createdAt), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
              {report.verifiedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Verified</span>
                  <span className="text-foreground">
                    {format(new Date(report.verifiedAt), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
              )}
              {report.resolvedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resolved</span>
                  <span className="text-foreground">
                    {format(new Date(report.resolvedAt), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="text-foreground">
                  {format(new Date(report.updatedAt), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
