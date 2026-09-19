import { describe, it, expect, beforeEach } from 'vitest';
import { useDataStore } from '../stores/dataStore';
import { User, RequestItem, RecordItem, AuditLog } from '../types';

describe('useDataStore', () => {
  beforeEach(() => {
    // Reset store state
    useDataStore.setState({
      users: [],
      branches: [],
      regions: [],
      requests: [],
      fields: [],
      assignments: [],
      records: [],
      recordResponses: {},
      templates: [],
      auditLogs: [],
      deviceBindings: [],
      passwordResetRequests: [],
    });
  });

  it('initializes with empty collections', () => {
    const state = useDataStore.getState();
    expect(state.users).toEqual([]);
    expect(state.branches).toEqual([]);
    expect(state.regions).toEqual([]);
    expect(state.requests).toEqual([]);
    expect(state.records).toEqual([]);
    expect(state.auditLogs).toEqual([]);
  });

  it('updates users and local user data correctly', () => {
    const mockUsers: User[] = [
      {
        userId: 'u1',
        username: '101',
        repNo: '101',
        repNameAr: 'أحمد علي',
        repNameEn: 'Ahmed Ali',
        role: 'REP',
        branchId: 'b1',
        regionNo: '101',
        allowedRegionNos: ['101'],
        isActive: true,
        mustChangePassword: false,
        failedLoginCount: 0,
        sessionVersion: 1,
        deviceBindingStatus: 'BOUND',
        maxAllowedDevices: 1,
        createdAt: '2026-05-01',
        updatedAt: '2026-05-01',
      },
    ];

    useDataStore.getState().setUsers(mockUsers);
    expect(useDataStore.getState().users).toHaveLength(1);
    expect(useDataStore.getState().users[0].repNameAr).toBe('أحمد علي');

    // Update user locally
    const updatedUser: User = {
      ...mockUsers[0],
      repNameAr: 'أحمد علي المحدث',
    };
    useDataStore.getState().updateUserLocal(updatedUser);
    expect(useDataStore.getState().users[0].repNameAr).toBe('أحمد علي المحدث');
  });

  it('updates requests and records correctly', () => {
    const mockRequest: RequestItem = {
      requestId: 'req-1',
      requestCode: 'REQ-2026-001',
      titleAr: 'حملة الصيف',
      titleEn: 'Summer Campaign',
      descriptionAr: 'وصف الحملة',
      descriptionEn: 'Campaign Description',
      requestType: 'per_record',
      status: 'Published',
      priority: 'Normal',
      category: 'Sales',
      tags: ['summer'],
      startAt: '2026-06-01',
      dueAt: '2026-08-31',
      allowEditAfterSubmit: false,
      allowEditAfterDueDate: false,
      requireSupervisorApproval: false,
      completionRule: 'all_fields',
      formSchemaVersion: 1,
      createdBy: 'admin-1',
      totalRecords: 10,
      totalAssignments: 1,
      createdAt: '2026-05-01',
      updatedAt: '2026-05-01',
    };

    useDataStore.getState().setRequests([mockRequest]);
    expect(useDataStore.getState().requests).toHaveLength(1);
    expect(useDataStore.getState().requests[0].requestCode).toBe('REQ-2026-001');

    const mockRecord: RecordItem = {
      recordId: 'rec-1',
      requestId: 'req-1',
      assignmentId: 'asgn-1',
      assignedUserId: 'u1',
      assignedRegionNo: '101',
      customerNo: 'CUST-100',
      customerName: 'مؤسسة الرياض',
      branchId: 'b1',
      branchName: 'الرياض',
      regionNo: '101',
      repNo: '101',
      repName: 'أحمد علي',
      rawData: {},
      recordStatus: 'Pending',
      completionPercent: 0,
      createdAt: '2026-05-01',
      updatedAt: '2026-05-01',
    };

    useDataStore.getState().setRecords([mockRecord]);
    expect(useDataStore.getState().records).toHaveLength(1);
    expect(useDataStore.getState().records[0].customerName).toBe('مؤسسة الرياض');
  });

  it('prepends audit logs with addAuditLogLocal', () => {
    const log1: AuditLog = {
      logId: 'log-1',
      userId: 'u1',
      userRole: 'ADMIN',
      userName: 'Admin User',
      action: 'LOGIN',
      entityType: 'AUTH',
      entityId: 'auth-1',
      details: 'Login success',
      createdAt: '2026-05-01T10:00:00Z',
    };

    const log2: AuditLog = {
      logId: 'log-2',
      userId: 'u1',
      userRole: 'ADMIN',
      userName: 'Admin User',
      action: 'CREATE_REQUEST',
      entityType: 'REQUEST',
      entityId: 'req-1',
      details: 'Created Summer Campaign',
      createdAt: '2026-05-01T10:05:00Z',
    };

    useDataStore.getState().setAuditLogs([log1]);
    useDataStore.getState().addAuditLogLocal(log2);

    const logs = useDataStore.getState().auditLogs;
    expect(logs).toHaveLength(2);
    expect(logs[0].logId).toBe('log-2');
    expect(logs[1].logId).toBe('log-1');
  });
});
