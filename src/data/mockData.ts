import { User, HazardReport, Region, HazardType, Severity, ReportStatus, AIAnalysis } from '@/types';

// Mock Users with realistic data
export const mockUsers: User[] = [
  // Citizens
  {
    id: 'cit-001',
    email: 'james.mitchell@email.com',
    password: 'citizen123',
    name: 'James Mitchell',
    role: 'citizen',
    region: 'Downtown District',
    createdAt: '2024-01-15T08:30:00Z',
    isApproved: true,
  },
  {
    id: 'cit-002',
    email: 'sarah.chen@email.com',
    password: 'citizen123',
    name: 'Sarah Chen',
    role: 'citizen',
    region: 'Westside',
    createdAt: '2024-02-20T14:15:00Z',
    isApproved: true,
  },
  {
    id: 'cit-003',
    email: 'michael.rodriguez@email.com',
    password: 'citizen123',
    name: 'Michael Rodriguez',
    role: 'citizen',
    region: 'Industrial Zone',
    createdAt: '2024-03-10T09:45:00Z',
    isApproved: true,
  },
  // Municipal Staff
  {
    id: 'staff-001',
    email: 'emily.watson@municipality.gov',
    password: 'staff123',
    name: 'Emily Watson',
    role: 'municipal_staff',
    region: 'Downtown District',
    createdAt: '2023-06-01T08:00:00Z',
    isApproved: true,
  },
  {
    id: 'staff-002',
    email: 'david.kim@municipality.gov',
    password: 'staff123',
    name: 'David Kim',
    role: 'municipal_staff',
    region: 'Westside',
    createdAt: '2023-08-15T08:00:00Z',
    isApproved: true,
  },
  {
    id: 'staff-003',
    email: 'lisa.thompson@municipality.gov',
    password: 'staff123',
    name: 'Lisa Thompson',
    role: 'municipal_staff',
    region: 'Industrial Zone',
    createdAt: '2024-01-05T08:00:00Z',
    isApproved: false,
  },
  // Administrators
  {
    id: 'admin-001',
    email: 'robert.anderson@municipality.gov',
    password: 'admin123',
    name: 'Robert Anderson',
    role: 'admin',
    createdAt: '2022-01-01T08:00:00Z',
    isApproved: true,
  },
  {
    id: 'admin-002',
    email: 'amanda.foster@municipality.gov',
    password: 'admin123',
    name: 'Amanda Foster',
    role: 'admin',
    createdAt: '2022-06-15T08:00:00Z',
    isApproved: true,
  },
];

export const mockRegions: Region[] = [
  { id: 'reg-001', name: 'Downtown District', code: 'DTD', staffCount: 3, activeReports: 12 },
  { id: 'reg-002', name: 'Westside', code: 'WST', staffCount: 2, activeReports: 8 },
  { id: 'reg-003', name: 'Industrial Zone', code: 'INZ', staffCount: 2, activeReports: 15 },
  { id: 'reg-004', name: 'Residential North', code: 'RSN', staffCount: 2, activeReports: 6 },
  { id: 'reg-005', name: 'Harbor District', code: 'HBD', staffCount: 1, activeReports: 4 },
];

// AI Analysis Generator
export function generateAIAnalysis(imageContext?: string): AIAnalysis {
  const hazardTypes: HazardType[] = ['pothole', 'crack', 'flooding', 'debris', 'damaged_signage', 'broken_barrier', 'uneven_surface', 'erosion'];
  const severities: Severity[] = ['low', 'medium', 'high', 'critical'];
  
  const hazardType = hazardTypes[Math.floor(Math.random() * hazardTypes.length)];
  const severity = severities[Math.floor(Math.random() * severities.length)];
  const confidence = Math.round((0.72 + Math.random() * 0.25) * 100) / 100;
  
  const descriptions: Record<HazardType, string[]> = {
    pothole: [
      'Detected circular depression in road surface approximately 30cm in diameter.',
      'Identified pothole with visible aggregate exposure indicating structural damage.',
      'Located road cavity showing signs of water erosion and traffic wear.',
    ],
    crack: [
      'Linear crack pattern detected extending approximately 2 meters.',
      'Identified alligator cracking pattern suggesting base layer failure.',
      'Surface crack with width indicating potential structural concern.',
    ],
    flooding: [
      'Pooling water detected indicating drainage system blockage.',
      'Identified flood-prone area with inadequate surface drainage.',
      'Water accumulation suggesting compromised road camber.',
    ],
    debris: [
      'Foreign material detected obstructing traffic lane.',
      'Identified scattered debris requiring immediate clearance.',
      'Construction materials detected on roadway surface.',
    ],
    damaged_signage: [
      'Traffic sign showing structural damage affecting visibility.',
      'Identified bent signpost requiring replacement.',
      'Road marking fading detected below visibility standards.',
    ],
    broken_barrier: [
      'Guardrail section showing impact damage.',
      'Identified barrier discontinuity creating safety gap.',
      'Concrete barrier showing structural cracks.',
    ],
    uneven_surface: [
      'Surface irregularity detected creating vehicle hazard.',
      'Identified settlement causing uneven road level.',
      'Pavement heave detected likely from subsurface issues.',
    ],
    erosion: [
      'Edge erosion detected compromising road shoulder.',
      'Identified washout area affecting road stability.',
      'Surface material loss from water flow damage.',
    ],
  };

  const priorityMap: Record<Severity, number> = {
    critical: 1,
    high: 2,
    medium: 3,
    low: 4,
  };

  return {
    hazardType,
    severity,
    confidence,
    description: descriptions[hazardType][Math.floor(Math.random() * descriptions[hazardType].length)],
    suggestedPriority: priorityMap[severity],
  };
}

// Mock Hazard Reports
export const mockHazardReports: HazardReport[] = [
  {
    id: 'rpt-001',
    reportedBy: 'cit-001',
    reporterName: 'James Mitchell',
    title: 'Large pothole on Main Street',
    description: 'Deep pothole near the intersection causing vehicles to swerve. Has been getting worse over the past week.',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format',
    location: {
      lat: 40.7128,
      lng: -74.0060,
      address: '245 Main Street',
      region: 'Downtown District',
    },
    aiAnalysis: {
      hazardType: 'pothole',
      severity: 'high',
      confidence: 0.94,
      description: 'Detected circular depression in road surface approximately 30cm in diameter.',
      suggestedPriority: 2,
    },
    status: 'verified',
    assignedTo: 'staff-001',
    assignedStaffName: 'Emily Watson',
    remarks: ['Initial assessment complete. Scheduling repair crew.'],
    createdAt: '2024-11-15T10:30:00Z',
    updatedAt: '2024-11-16T14:20:00Z',
    verifiedAt: '2024-11-16T09:15:00Z',
  },
  {
    id: 'rpt-002',
    reportedBy: 'cit-002',
    reporterName: 'Sarah Chen',
    title: 'Flooding at Oak Avenue underpass',
    description: 'Water has been pooling under the bridge for several days. It is getting deeper after each rain.',
    imageUrl: 'https://images.unsplash.com/photo-1446824505046-e43605ffb17f?w=800&auto=format',
    location: {
      lat: 40.7580,
      lng: -73.9855,
      address: 'Oak Avenue Underpass',
      region: 'Westside',
    },
    aiAnalysis: {
      hazardType: 'flooding',
      severity: 'critical',
      confidence: 0.89,
      description: 'Pooling water detected indicating drainage system blockage.',
      suggestedPriority: 1,
    },
    status: 'in_progress',
    assignedTo: 'staff-002',
    assignedStaffName: 'David Kim',
    remarks: ['Drainage team dispatched.', 'Temporary signage installed.'],
    createdAt: '2024-11-14T08:15:00Z',
    updatedAt: '2024-11-17T11:00:00Z',
    verifiedAt: '2024-11-14T10:30:00Z',
  },
  {
    id: 'rpt-003',
    reportedBy: 'cit-001',
    reporterName: 'James Mitchell',
    title: 'Cracked pavement on Industrial Road',
    description: 'Long crack running along the road. Several smaller cracks branching off.',
    imageUrl: 'https://images.unsplash.com/photo-1605106702734-205df224ecce?w=800&auto=format',
    location: {
      lat: 40.7489,
      lng: -73.9680,
      address: '780 Industrial Road',
      region: 'Industrial Zone',
    },
    aiAnalysis: {
      hazardType: 'crack',
      severity: 'medium',
      confidence: 0.87,
      description: 'Identified alligator cracking pattern suggesting base layer failure.',
      suggestedPriority: 3,
    },
    status: 'pending',
    remarks: [],
    createdAt: '2024-11-17T16:45:00Z',
    updatedAt: '2024-11-17T16:45:00Z',
  },
  {
    id: 'rpt-004',
    reportedBy: 'cit-003',
    reporterName: 'Michael Rodriguez',
    title: 'Damaged stop sign at Pine Junction',
    description: 'Stop sign is bent at a 45-degree angle after a vehicle collision. Barely visible to approaching drivers.',
    imageUrl: 'https://images.unsplash.com/photo-1566378179432-b032e5c3dfbc?w=800&auto=format',
    location: {
      lat: 40.7614,
      lng: -73.9776,
      address: 'Pine Street & 3rd Avenue',
      region: 'Residential North',
    },
    aiAnalysis: {
      hazardType: 'damaged_signage',
      severity: 'high',
      confidence: 0.96,
      description: 'Traffic sign showing structural damage affecting visibility.',
      suggestedPriority: 2,
    },
    status: 'under_review',
    assignedTo: 'staff-001',
    assignedStaffName: 'Emily Watson',
    remarks: [],
    createdAt: '2024-11-16T07:20:00Z',
    updatedAt: '2024-11-17T08:30:00Z',
  },
  {
    id: 'rpt-005',
    reportedBy: 'cit-002',
    reporterName: 'Sarah Chen',
    title: 'Road debris near construction site',
    description: 'Gravel and construction materials scattered across the lane. Hazardous for motorcycles and bicycles.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format',
    location: {
      lat: 40.7282,
      lng: -74.0776,
      address: '120 Harbor Boulevard',
      region: 'Harbor District',
    },
    aiAnalysis: {
      hazardType: 'debris',
      severity: 'medium',
      confidence: 0.91,
      description: 'Construction materials detected on roadway surface.',
      suggestedPriority: 3,
    },
    status: 'resolved',
    assignedTo: 'staff-002',
    assignedStaffName: 'David Kim',
    remarks: ['Debris cleared by maintenance crew.', 'Construction company notified about violation.'],
    createdAt: '2024-11-10T13:00:00Z',
    updatedAt: '2024-11-12T15:30:00Z',
    verifiedAt: '2024-11-10T15:45:00Z',
    resolvedAt: '2024-11-12T15:30:00Z',
  },
  {
    id: 'rpt-006',
    reportedBy: 'cit-003',
    reporterName: 'Michael Rodriguez',
    title: 'Guardrail damage on Highway Exit 5',
    description: 'Section of guardrail is missing after recent accident. Gap approximately 3 meters wide.',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format',
    location: {
      lat: 40.7392,
      lng: -74.0018,
      address: 'Highway 1, Exit 5 Ramp',
      region: 'Industrial Zone',
    },
    aiAnalysis: {
      hazardType: 'broken_barrier',
      severity: 'critical',
      confidence: 0.93,
      description: 'Identified barrier discontinuity creating safety gap.',
      suggestedPriority: 1,
    },
    status: 'verified',
    assignedTo: 'staff-001',
    assignedStaffName: 'Emily Watson',
    remarks: ['Emergency temporary barriers installed.', 'Permanent repair scheduled for next week.'],
    createdAt: '2024-11-13T22:10:00Z',
    updatedAt: '2024-11-15T10:00:00Z',
    verifiedAt: '2024-11-14T06:30:00Z',
  },
];

// Login credentials display helper
export const loginCredentials = {
  citizen: {
    email: 'james.mitchell@email.com',
    password: 'citizen123',
    name: 'James Mitchell',
  },
  municipal_staff: {
    email: 'emily.watson@municipality.gov',
    password: 'staff123',
    name: 'Emily Watson',
  },
  admin: {
    email: 'robert.anderson@municipality.gov',
    password: 'admin123',
    name: 'Robert Anderson',
  },
};
