import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AdminRequests } from '../components/admin/AdminRequests';
import { AppProvider } from '../context/AppContext';

// Mock the AppContext hooks partially or provide them via provider
vi.mock('../hooks/useRequests', () => ({
  useRequests: () => ({
    requests: [],
    loading: false,
    fetchRequests: vi.fn(),
    addRequest: vi.fn(),
    updateRequest: vi.fn(),
    deleteRequest: vi.fn(),
    archiveRequest: vi.fn(),
    reopenRequest: vi.fn(),
    cloneRequest: vi.fn(),
  }),
}));

describe('AdminRequests Component', () => {
  it('renders the requests module correctly', () => {
    render(
      <AppProvider>
        <AdminRequests
          onOpenFormBuilder={vi.fn()}
          onOpenImportWizard={vi.fn()}
        />
      </AppProvider>
    );

    // Verify it doesn't crash and renders some basic structural text
    expect(screen.getByText(/إدارة حملات وطلبات جمع البيانات/i)).toBeTruthy();
  });
});
