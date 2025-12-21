import { HazardReport } from '@/types';
import { StatusBadge, SeverityBadge } from './StatusBadge';
import { MapPin, Clock, Brain } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface HazardCardProps {
  report: HazardReport;
  onClick?: () => void;
  showAIAnalysis?: boolean;
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

export function HazardCard({ report, onClick, showAIAnalysis = true }: HazardCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-card rounded-lg border border-border overflow-hidden transition-shadow duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      }`}
    >
      <div className="aspect-video relative overflow-hidden bg-muted">
        <img
          src={report.imageUrl}
          alt={report.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <StatusBadge status={report.status} />
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-medium text-foreground line-clamp-1">{report.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {report.description}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span className="line-clamp-1">{report.location.address}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}</span>
        </div>

        {showAIAnalysis && (
          <div className="pt-3 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-3 w-3 text-accent" />
              <span className="text-xs font-medium text-accent">AI Analysis</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {hazardTypeLabels[report.aiAnalysis.hazardType]}
              </span>
              <div className="flex items-center gap-2">
                <SeverityBadge severity={report.aiAnalysis.severity} />
                <span className="text-xs text-muted-foreground">
                  {Math.round(report.aiAnalysis.confidence * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
