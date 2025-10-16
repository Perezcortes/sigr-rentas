// lib/api-tenant.ts
import { api } from './api';
import { TenantEntity, CreateTenantDto } from '@/types/tenant';

export const tenantService = {
  /**
   * Obtener inquilino por ID de renta
   */
  async getTenantByRentalId(rentalId: number): Promise<TenantEntity> {
    const response = await api.get(`/rentals/${rentalId}`);
    return response.data.inquilino;
  },

  /**
   * Actualizar inquilino
   */
  async updateTenant(rentalId: number, data: CreateTenantDto): Promise<TenantEntity> {
    const response = await api.put(`/rentals/${rentalId}/inquilino`, data);
    return response.data.inquilino;
  },

  /**
   * Crear inquilino (dentro de una nueva renta manual)
   */
  async createTenant(rentalData: {
    tipo_origen: string;
    creado_por_user_id: number;
    inquilino: CreateTenantDto;
    propietario: any; // Se puede tipar después
    propiedad: any;
    obligado_solidario?: any;
  }): Promise<any> {
    const response = await api.post('/rentals/manual', rentalData);
    return response.data;
  },
};