import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { HazardReport, User, Region, ReportStatus, HazardType, Severity } from '@/types';
import { generateAIAnalysis } from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DataContextType {
  reports: HazardReport[];
  users: User[];
  regions: Region[];
  isLoading: boolean;
  addReport: (report: Omit<HazardReport, 'id' | 'createdAt' | 'updatedAt' | 'aiAnalysis' | 'remarks' | 'status'>) => Promise<HazardReport | null>;
  updateReportStatus: (reportId: string, status: ReportStatus, remark?: string) => Promise<void>;
  assignReport: (reportId: string, staffId: string, staffName: string) => Promise<void>;
  addRemark: (reportId: string, remark: string) => Promise<void>;
  approveStaff: (userId: string) => Promise<void>;
  getReportsByUser: (userId: string) => HazardReport[];
  getReportsByRegion: (region: string) => HazardReport[];
  getReportsByStatus: (status: ReportStatus) => HazardReport[];
  getPendingStaff: () => User[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Map DB row to app HazardReport
function mapDbReport(row: any): HazardReport {
  return {
    id: row.id,
    reportedBy: row.reported_by,
    reporterName: row.reporter_name,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url || '',
    location: {
      lat: row.location_lat,
      lng: row.location_lng,
      address: row.location_address,
      region: row.location_region,
    },
    aiAnalysis: {
      hazardType: row.ai_hazard_type as HazardType,
      severity: row.ai_severity as Severity,
      confidence: row.ai_confidence || 0,
      description: row.ai_description || '',
      suggestedPriority: row.ai_suggested_priority || 4,
    },
    status: row.status as ReportStatus,
    assignedTo: row.assigned_to || undefined,
    assignedStaffName: row.assigned_staff_name || undefined,
    remarks: row.remarks || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    verifiedAt: row.verified_at || undefined,
    resolvedAt: row.resolved_at || undefined,
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useAuth();
  const [reports, setReports] = useState<HazardReport[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch reports
  const fetchReports = useCallback(async () => {
    const { data, error } = await supabase
      .from('hazard_reports' as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReports((data as any[]).map(mapDbReport));
    }
  }, []);

  // Fetch regions
  const fetchRegions = useCallback(async () => {
    const { data, error } = await supabase
      .from('regions' as any)
      .select('*');

    if (!error && data) {
      setRegions((data as any[]).map(r => ({
        id: r.id,
        name: r.name,
        code: r.code,
        staffCount: r.staff_count,
        activeReports: r.active_reports,
      })));
    }
  }, []);

  // Fetch users (for admin)
  const fetchUsers = useCallback(async () => {
    if (!authUser || authUser.role !== 'admin') return;

    const { data: profiles } = await supabase
      .from('profiles')
      .select('*');

    const { data: roles } = await supabase
      .from('user_roles')
      .select('*');

    if (profiles && roles) {
      const roleMap = new Map(roles.map((r: any) => [r.user_id, r]));
      setUsers(profiles.map((p: any) => {
        const role = roleMap.get(p.user_id);
        return {
          id: p.user_id,
          email: p.email,
          name: p.name,
          role: role?.role || 'citizen',
          region: p.region || undefined,
          createdAt: p.created_at,
          isApproved: role?.is_approved ?? false,
        } as User;
      }));
    }
  }, [authUser]);

  // Initial fetch
  useEffect(() => {
    if (!authUser) {
      setReports([]);
      setUsers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    Promise.all([fetchReports(), fetchRegions(), fetchUsers()]).finally(() => {
      setIsLoading(false);
    });
  }, [authUser, fetchReports, fetchRegions, fetchUsers]);

  // Realtime subscription for reports
  useEffect(() => {
    if (!authUser) return;

    const channel = supabase
      .channel('hazard-reports-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hazard_reports' },
        () => {
          fetchReports();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authUser, fetchReports]);

  const addReport = useCallback(async (reportData: Omit<HazardReport, 'id' | 'createdAt' | 'updatedAt' | 'aiAnalysis' | 'remarks' | 'status'>) => {
    const ai = generateAIAnalysis();
    
    const { data, error } = await supabase
      .from('hazard_reports' as any)
      .insert({
        reported_by: reportData.reportedBy,
        reporter_name: reportData.reporterName,
        title: reportData.title,
        description: reportData.description,
        image_url: reportData.imageUrl,
        location_lat: reportData.location.lat,
        location_lng: reportData.location.lng,
        location_address: reportData.location.address,
        location_region: reportData.location.region,
        ai_hazard_type: ai.hazardType,
        ai_severity: ai.severity,
        ai_confidence: ai.confidence,
        ai_description: ai.description,
        ai_suggested_priority: ai.suggestedPriority,
      } as any)
      .select()
      .single();

    if (error || !data) {
      console.error('Error adding report:', error);
      return null;
    }

    const newReport = mapDbReport(data);
    return newReport;
  }, []);

  const updateReportStatus = useCallback(async (reportId: string, status: ReportStatus, remark?: string) => {
    // Get current report to append remark
    const current = reports.find(r => r.id === reportId);
    const updates: any = { status };

    if (status === 'verified') updates.verified_at = new Date().toISOString();
    if (status === 'resolved') updates.resolved_at = new Date().toISOString();
    if (remark && current) {
      updates.remarks = [...current.remarks, remark];
    }

    await supabase
      .from('hazard_reports' as any)
      .update(updates)
      .eq('id', reportId);
  }, [reports]);

  const assignReport = useCallback(async (reportId: string, staffId: string, staffName: string) => {
    await supabase
      .from('hazard_reports' as any)
      .update({
        assigned_to: staffId,
        assigned_staff_name: staffName,
        status: 'under_review',
      } as any)
      .eq('id', reportId);
  }, []);

  const addRemark = useCallback(async (reportId: string, remark: string) => {
    const current = reports.find(r => r.id === reportId);
    if (!current) return;

    await supabase
      .from('hazard_reports' as any)
      .update({ remarks: [...current.remarks, remark] } as any)
      .eq('id', reportId);
  }, [reports]);

  const approveStaff = useCallback(async (userId: string) => {
    await supabase
      .from('user_roles')
      .update({ is_approved: true })
      .eq('user_id', userId);

    // Refresh users list
    fetchUsers();
  }, [fetchUsers]);

  const getReportsByUser = useCallback((userId: string) => {
    return reports.filter(r => r.reportedBy === userId);
  }, [reports]);

  const getReportsByRegion = useCallback((region: string) => {
    return reports.filter(r => r.location.region === region);
  }, [reports]);

  const getReportsByStatus = useCallback((status: ReportStatus) => {
    return reports.filter(r => r.status === status);
  }, [reports]);

  const getPendingStaff = useCallback(() => {
    return users.filter(u => u.role === 'municipal_staff' && !u.isApproved);
  }, [users]);

  return (
    <DataContext.Provider value={{
      reports,
      users,
      regions,
      isLoading,
      addReport,
      updateReportStatus,
      assignReport,
      addRemark,
      approveStaff,
      getReportsByUser,
      getReportsByRegion,
      getReportsByStatus,
      getPendingStaff,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
