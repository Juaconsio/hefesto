import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/modules/leasing/repositories/lease.repository', () => ({
  leaseRepository: {
    findById: vi.fn(),
    findActiveByProperty: vi.fn(),
    updateStatus: vi.fn(),
  },
}));
vi.mock('@/modules/properties/repositories/property.repository', () => ({
  propertyRepository: { findById: vi.fn() },
}));
vi.mock('@/modules/leasing/repositories/tenant.repository', () => ({
  tenantRepository: { findById: vi.fn() },
}));
vi.mock('@/modules/properties/services/property.service', () => ({
  propertyService: { setStatus: vi.fn() },
}));

import { leaseService } from '@/modules/leasing/services/lease.service';
import { leaseRepository } from '@/modules/leasing/repositories/lease.repository';
import { propertyService } from '@/modules/properties/services/property.service';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('leaseService.activate', () => {
  it('DRAFT -> ACTIVE and marks the property RENTED', async () => {
    vi.mocked(leaseRepository.findById).mockResolvedValue({
      id: 'l1',
      status: 'DRAFT',
      propertyId: 'p1',
    } as never);
    vi.mocked(leaseRepository.findActiveByProperty).mockResolvedValue(null);
    vi.mocked(leaseRepository.updateStatus).mockResolvedValue({} as never);

    await leaseService.activate('l1');

    expect(leaseRepository.updateStatus).toHaveBeenCalledWith('l1', 'ACTIVE');
    expect(propertyService.setStatus).toHaveBeenCalledWith('p1', 'RENTED');
  });

  it('blocks activation when the property already has an active lease', async () => {
    vi.mocked(leaseRepository.findById).mockResolvedValue({
      id: 'l1',
      status: 'DRAFT',
      propertyId: 'p1',
    } as never);
    vi.mocked(leaseRepository.findActiveByProperty).mockResolvedValue({ id: 'other' } as never);

    await expect(leaseService.activate('l1')).rejects.toThrow();
    expect(leaseRepository.updateStatus).not.toHaveBeenCalled();
    expect(propertyService.setStatus).not.toHaveBeenCalled();
  });

  it('rejects an illegal transition from TERMINATED', async () => {
    vi.mocked(leaseRepository.findById).mockResolvedValue({
      id: 'l1',
      status: 'TERMINATED',
      propertyId: 'p1',
    } as never);

    await expect(leaseService.activate('l1')).rejects.toThrow();
  });
});

describe('leaseService.terminate', () => {
  it('ACTIVE -> TERMINATED and frees the property (AVAILABLE)', async () => {
    vi.mocked(leaseRepository.findById).mockResolvedValue({
      id: 'l1',
      status: 'ACTIVE',
      propertyId: 'p1',
    } as never);
    vi.mocked(leaseRepository.updateStatus).mockResolvedValue({} as never);

    await leaseService.terminate('l1');

    expect(leaseRepository.updateStatus).toHaveBeenCalledWith('l1', 'TERMINATED');
    expect(propertyService.setStatus).toHaveBeenCalledWith('p1', 'AVAILABLE');
  });
});
