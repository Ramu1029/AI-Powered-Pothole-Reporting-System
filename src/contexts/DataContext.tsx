import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { HazardReport, User, Region, ReportStatus } from '@/types';
import { mockHazardReports, mockUsers, mockRegions, generateAIAnalysis } from '@/data/mockData';

interface DataContextType {
  reports: HazardReport[];
  users: User[];
  regions: Region[];
  addReport: (report: Omit<HazardReport, 'id' | 'createdAt' | 'updatedAt' | 'aiAnalysis' | 'remarks' | 'status'>) => HazardReport;
  updateReportStatus: (reportId: string, status: ReportStatus, remark?: string) => void;
  assignReport: (reportId: string, staffId: string, staffName: string) => void;
  addRemark: (reportId: string, remark: string) => void;
  approveStaff: (userId: string) => void;
  getReportsByUser: (userId: string) => HazardReport[];
  getReportsByRegion: (region: string) => HazardReport[];
  getReportsByStatus: (status: ReportStatus) => HazardReport[];
  getPendingStaff: () => User[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<HazardReport[]>(mockHazardReports);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [regions] = useState<Region[]>(mockRegions);

  const addReport = useCallback((reportData: Omit<HazardReport, 'id' | 'createdAt' | 'updatedAt' | 'aiAnalysis' | 'remarks' | 'status'>) => {
    const now = new Date().toISOString();
    const newReport: HazardReport = {
      ...reportData,
      id: `rpt-${Date.now()}`,
      aiAnalysis: generateAIAnalysis(),
      status: 'pending',
      remarks: [],
      createdAt: now,
      updatedAt: now,
    };

    setReports(prev => [newReport, ...prev]);
    return newReport;
  }, []);

  const updateReportStatus = useCallback((reportId: string, status: ReportStatus, remark?: string) => {
    setReports(prev => prev.map(report => {
      if (report.id !== reportId) return report;

      const updates: Partial<HazardReport> = {
        status,
        updatedAt: new Date().toISOString(),
      };

      if (status === 'verified') {
        updates.verifiedAt = new Date().toISOString();
      } else if (status === 'resolved') {
        updates.resolvedAt = new Date().toISOString();
      }

      if (remark) {
        updates.remarks = [...report.remarks, remark];
      }

      return { ...report, ...updates };
    }));
  }, []);

  const assignReport = useCallback((reportId: string, staffId: string, staffName: string) => {
    setReports(prev => prev.map(report => {
      if (report.id !== reportId) return report;
      return {
        ...report,
        assignedTo: staffId,
        assignedStaffName: staffName,
        status: 'under_review' as ReportStatus,
        updatedAt: new Date().toISOString(),
      };
    }));
  }, []);

  const addRemark = useCallback((reportId: string, remark: string) => {
    setReports(prev => prev.map(report => {
      if (report.id !== reportId) return report;
      return {
        ...report,
        remarks: [...report.remarks, remark],
        updatedAt: new Date().toISOString(),
      };
    }));
  }, []);

  const approveStaff = useCallback((userId: string) => {
    setUsers(prev => prev.map(user => {
      if (user.id !== userId) return user;
      return { ...user, isApproved: true };
    }));
  }, []);

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
