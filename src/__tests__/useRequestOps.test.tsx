import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRequestOps } from '../hooks/useRequestOps';
import { requestApi } from '../services';
import * as useUserOps from '../hooks/useUserOps';

vi.mock('../services', () => ({
  requestApi: {
    createRequest: vi.fn(),
    updateDraftRequest: vi.fn(),
  },
}));

vi.mock('../hooks/useUserOps', () => ({
  logAudit: vi.fn(),
}));

describe('useRequestOps Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createRequest calls API and returns success', async () => {
    (requestApi.createRequest as any).mockResolvedValue('new_req_id');

    const { result } = renderHook(() => useRequestOps());

    let res;
    await act(async () => {
      res = await result.current.createRequest({
        requestCode: 'REQ-123',
        titleAr: 'Test Request',
      }, []);
    });

    expect(res?.success).toBe(true);
    expect(res?.data).toBe('new_req_id');
    expect(requestApi.createRequest).toHaveBeenCalled();
    expect(useUserOps.logAudit).toHaveBeenCalledWith(
      'REQUEST_CREATED_VIA_CF',
      'Request',
      'new_req_id',
      expect.any(Object)
    );
  });

  it('updateRequest calls API and returns success', async () => {
    (requestApi.updateDraftRequest as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useRequestOps());

    let res;
    await act(async () => {
      res = await result.current.updateRequest('req_1', { titleAr: 'New Title' });
    });

    expect(res?.success).toBe(true);
    expect(requestApi.updateDraftRequest).toHaveBeenCalledWith('req_1', { titleAr: 'New Title' });
    expect(useUserOps.logAudit).toHaveBeenCalledWith(
      'REQUEST_UPDATED',
      'Request',
      'req_1',
      expect.any(Object)
    );
  });
});
