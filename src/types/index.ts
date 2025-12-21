export type UserRole = 'citizen' | 'municipal_staff' | 'admin';

export type HazardType = 
  | 'pothole' 
  | 'crack' 
  | 'flooding' 
  | 'debris' 
  | 'damaged_signage' 
  | 'broken_barrier' 
  | 'uneven_surface'
  | 'erosion';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type ReportStatus = 
  | 'pending' 
  | 'under_review' 
  | 'verified' 
  | 'rejected' 
  | 'in_progress' 
  | 'resolved';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  region?: string;
  createdAt: string;
  isApproved: boolean;
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
  region: string;
}

export interface AIAnalysis {
  hazardType: HazardType;
  severity: Severity;
  confidence: number;
  description: string;
  suggestedPriority: number;
}

export interface HazardReport {
  id: string;
  reportedBy: string;
  reporterName: string;
  title: string;
  description: string;
  imageUrl: string;
  location: Location;
  aiAnalysis: AIAnalysis;
  status: ReportStatus;
  assignedTo?: string;
  assignedStaffName?: string;
  remarks: string[];
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
  resolvedAt?: string;
}

export interface Region {
  id: string;
  name: string;
  code: string;
  staffCount: number;
  activeReports: number;
}

export interface DashboardStats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  averageResolutionTime: number;
  reportsByType: Record<HazardType, number>;
  reportsBySeverity: Record<Severity, number>;
  reportsByRegion: Record<string, number>;
}
