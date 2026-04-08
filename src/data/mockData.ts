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
    isVerified: true,
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
    isVerified: true,
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
    isVerified: true,
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
    isVerified: true,
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
    isVerified: true,
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
    isVerified: false,
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
    isVerified: true,
    isApproved: true,
  },
  {
    id: 'admin-002',
    email: 'amanda.foster@municipality.gov',
    password: 'admin123',
    name: 'Amanda Foster',
    role: 'admin',
    createdAt: '2022-06-15T08:00:00Z',
    isVerified: true,
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

// Road damage keyword mappings for intelligent analysis
const hazardKeywordMap: { type: HazardType; keywords: string[]; severityHints: { keyword: string; severity: Severity }[] }[] = [
  {
    type: 'pothole',
    keywords: ['pothole', 'pot hole', 'hole in road', 'road hole', 'cavity', 'depression in road', 'dip in road'],
    severityHints: [
      { keyword: 'deep', severity: 'high' }, { keyword: 'large', severity: 'high' },
      { keyword: 'huge', severity: 'critical' }, { keyword: 'dangerous', severity: 'critical' },
      { keyword: 'small', severity: 'low' }, { keyword: 'minor', severity: 'low' },
    ],
  },
  {
    type: 'crack',
    keywords: ['crack', 'cracked', 'cracking', 'fracture', 'split', 'alligator', 'fissure', 'broken pavement', 'pavement damage'],
    severityHints: [
      { keyword: 'long', severity: 'high' }, { keyword: 'wide', severity: 'high' },
      { keyword: 'spreading', severity: 'critical' }, { keyword: 'small', severity: 'low' },
    ],
  },
  {
    type: 'flooding',
    keywords: ['flood', 'flooding', 'waterlog', 'water logging', 'waterlogging', 'standing water', 'pooling', 'submerged', 'drain', 'blocked drain', 'water accumulation'],
    severityHints: [
      { keyword: 'deep', severity: 'critical' }, { keyword: 'rising', severity: 'critical' },
      { keyword: 'shallow', severity: 'low' }, { keyword: 'minor', severity: 'low' },
    ],
  },
  {
    type: 'debris',
    keywords: ['debris', 'rubble', 'obstruction', 'fallen', 'gravel', 'scattered', 'construction material', 'rocks on road', 'litter', 'oil spill'],
    severityHints: [
      { keyword: 'blocking', severity: 'high' }, { keyword: 'hazardous', severity: 'critical' },
      { keyword: 'small', severity: 'low' },
    ],
  },
  {
    type: 'damaged_signage',
    keywords: ['sign', 'signage', 'signboard', 'traffic sign', 'stop sign', 'bent sign', 'missing sign', 'faded marking', 'road marking', 'visibility'],
    severityHints: [
      { keyword: 'missing', severity: 'high' }, { keyword: 'bent', severity: 'medium' },
      { keyword: 'faded', severity: 'low' },
    ],
  },
  {
    type: 'broken_barrier',
    keywords: ['barrier', 'guardrail', 'guard rail', 'railing', 'fence', 'divider', 'median', 'broken barrier', 'damaged barrier'],
    severityHints: [
      { keyword: 'missing', severity: 'critical' }, { keyword: 'gap', severity: 'critical' },
      { keyword: 'bent', severity: 'medium' }, { keyword: 'cracked', severity: 'medium' },
    ],
  },
  {
    type: 'uneven_surface',
    keywords: ['uneven', 'bumpy', 'bump', 'raised', 'settlement', 'heave', 'rough surface', 'speed bump damage', 'rebar', 'exposed rebar'],
    severityHints: [
      { keyword: 'rebar', severity: 'critical' }, { keyword: 'exposed', severity: 'critical' },
      { keyword: 'slight', severity: 'low' },
    ],
  },
  {
    type: 'erosion',
    keywords: ['erosion', 'eroded', 'washout', 'wash out', 'edge damage', 'shoulder damage', 'sinkhole', 'subsidence', 'cave in', 'collapse', 'landslide'],
    severityHints: [
      { keyword: 'sinkhole', severity: 'critical' }, { keyword: 'collapse', severity: 'critical' },
      { keyword: 'minor', severity: 'low' },
    ],
  },
];

const roadRelatedTerms = [
  'road', 'street', 'highway', 'lane', 'pavement', 'asphalt', 'tar', 'bridge', 'flyover',
  'underpass', 'overpass', 'intersection', 'junction', 'footpath', 'sidewalk', 'curb',
  'kerb', 'median', 'divider', 'culvert', 'manhole', 'gutter', 'drain', 'crossing',
  'traffic', 'vehicle', 'driving', 'ride', 'commute', 'pedestrian', 'walkway',
  ...hazardKeywordMap.flatMap(h => h.keywords),
];

const aiDescriptions: Record<HazardType, string[]> = {
  pothole: [
    'Detected circular depression in road surface. Risk: vehicle damage, tire blowout, loss of control.',
    'Road cavity identified with visible aggregate exposure. Risk: axle damage, cyclist accidents.',
    'Pothole detected showing signs of water erosion and traffic wear. Recommended: patching and resurfacing.',
  ],
  crack: [
    'Linear crack pattern detected. Risk: water infiltration leading to further structural degradation.',
    'Alligator cracking pattern identified suggesting base layer failure. Recommended: full-depth repair.',
    'Surface crack with widening trend. Risk: accelerated deterioration if untreated.',
  ],
  flooding: [
    'Water accumulation detected indicating drainage system failure. Risk: hydroplaning, vehicle stalling.',
    'Flood-prone area with inadequate surface drainage. Risk: pedestrian hazard, infrastructure damage.',
    'Standing water compromising road surface integrity. Recommended: immediate drainage clearance.',
  ],
  debris: [
    'Foreign material detected obstructing traffic lane. Risk: tire puncture, collision avoidance swerving.',
    'Scattered debris creating multi-lane hazard. Recommended: immediate clearance operation.',
    'Construction materials on roadway. Risk: motorcyclist and cyclist accidents.',
  ],
  damaged_signage: [
    'Traffic sign showing structural damage affecting visibility. Risk: driver confusion, intersection accidents.',
    'Road marking below visibility standards. Risk: lane departure, wrong-way driving.',
    'Missing or damaged regulatory sign. Recommended: immediate replacement for traffic safety.',
  ],
  broken_barrier: [
    'Guardrail discontinuity creating safety gap. Risk: vehicles leaving roadway at curves.',
    'Barrier impact damage detected. Risk: reduced crash protection for subsequent incidents.',
    'Structural barrier failure. Recommended: emergency temporary barriers pending permanent repair.',
  ],
  uneven_surface: [
    'Surface irregularity detected creating vehicle hazard. Risk: suspension damage, loss of control.',
    'Pavement heave from subsurface issues. Risk: motorcycle accidents, pedestrian tripping.',
    'Exposed rebar or reinforcement detected. Risk: severe tire damage, pedestrian injury.',
  ],
  erosion: [
    'Edge erosion compromising road shoulder. Risk: vehicles slipping off road edge.',
    'Washout area affecting road stability. Risk: road collapse under heavy vehicle load.',
    'Subsidence detected suggesting underground void. Recommended: immediate investigation and barricading.',
  ],
};

// AI Analysis Generator - context-aware based on title and description
export function generateAIAnalysis(title?: string, description?: string): AIAnalysis {
  const input = `${title || ''} ${description || ''}`.toLowerCase();

  // Check if input is related to road damage
  const isRoadRelated = roadRelatedTerms.some(term => input.includes(term));

  if (!isRoadRelated) {
    return {
      hazardType: 'debris',
      severity: 'low',
      confidence: 0,
      description: 'Fake image: Not representing any road damage or hazard.',
      suggestedPriority: 4,
    };
  }

  // Find best matching hazard type
  let bestMatch: { type: HazardType; score: number } = { type: 'pothole', score: 0 };
  for (const mapping of hazardKeywordMap) {
    let score = 0;
    for (const kw of mapping.keywords) {
      if (input.includes(kw)) score += kw.split(' ').length; // multi-word matches score higher
    }
    if (score > bestMatch.score) {
      bestMatch = { type: mapping.type, score };
    }
  }

  const hazardType = bestMatch.type;

  // Determine severity from context hints
  const mapping = hazardKeywordMap.find(m => m.type === hazardType)!;
  let severity: Severity = 'medium'; // default
  for (const hint of mapping.severityHints) {
    if (input.includes(hint.keyword)) {
      severity = hint.severity;
      break;
    }
  }

  // Boost severity for urgency words
  const urgencyWords = ['urgent', 'emergency', 'immediately', 'dangerous', 'fatal', 'accident', 'injury', 'life threatening'];
  if (urgencyWords.some(w => input.includes(w))) {
    severity = severity === 'low' ? 'medium' : severity === 'medium' ? 'high' : 'critical';
  }

  const confidence = bestMatch.score > 0
    ? Math.min(0.98, Math.round((0.78 + bestMatch.score * 0.04 + Math.random() * 0.08) * 100) / 100)
    : Math.round((0.55 + Math.random() * 0.15) * 100) / 100;

  const priorityMap: Record<Severity, number> = { critical: 1, high: 2, medium: 3, low: 4 };

  const descs = aiDescriptions[hazardType];

  return {
    hazardType,
    severity,
    confidence,
    description: descs[Math.floor(Math.random() * descs.length)],
    suggestedPriority: priorityMap[severity],
  };
}

// Common keywords that users often include while reporting hazards
export const reportKeywords: string[] = [
  'pothole', 'crack', 'flooding', 'debris', 'damaged signage', 'broken barrier',
  'uneven surface', 'erosion', 'standing water', 'blocked drain', 'sinkhole',
  'collapsed', 'obstruction', 'exposed aggregate', 'subsidence', 'edge drop', 'visibility',
  'icy', 'oil spill', 'traffic hazard'
];

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
      region: 'GUNTAKAL, ANANTAPUR',
      state: 'ANDHRA PRADESH',
      district: 'ANANTAPUR',
      mandal: 'GUNTAKAL',
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
      region: 'MUNDRA, KACHCHH',
      state: 'GUJARAT',
      district: 'KACHCHH',
      mandal: 'MUNDRA',
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
      region: 'GUNTAKAL, ANANTAPUR',
      state: 'ANDHRA PRADESH',
      district: 'ANANTAPUR',
      mandal: 'GUNTAKAL',
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
      region: 'MUNDRA, KACHCHH',
      state: 'GUJARAT',
      district: 'KACHCHH',
      mandal: 'MUNDRA',
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
      region: 'ANANTAPUR, ANANTAPUR',
      state: 'ANDHRA PRADESH',
      district: 'ANANTAPUR',
      mandal: 'ANANTAPUR',
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
      region: 'MUNDRA, KACHCHH',
      state: 'GUJARAT',
      district: 'KACHCHH',
      mandal: 'MUNDRA',
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
