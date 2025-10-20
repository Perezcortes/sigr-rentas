// lib/api-tenant.ts 
import { api } from './api';
import { TenantEntity, CreateTenantDto } from '@/types/tenant';

export const tenantService = {
  /**
   * Obtener inquilino por ID de renta
   */
  async getTenantByRentalId(rentalId: string): Promise<TenantEntity> { // Cambiado a string (UUID)
    const response = await api.get(`/rentals/${rentalId}`);
    return response.data.inquilino;
  },

  /**
   * Actualizar inquilino
   */
  async updateTenant(rentalId: string, data: CreateTenantDto): Promise<TenantEntity> { // Cambiado a string
    const response = await api.put(`/rentals/${rentalId}/inquilino`, data);
    return response.data.inquilino;
  },

  /**
   * Crear renta manual completa
   */
  async createManualRental(rentalData: {
    tipoInquilino: 'fisica' | 'moral';
    tipoPropietario?: 'fisica' | 'moral';
    tipoPropiedad?: string;
    observaciones?: string;
    usuarioCreacion: string;
    propiedad?: any;
    inquilinoPf?: any;
    inquilinoPm?: any;
    propietarioPf?: any;
    propietarioPm?: any;
  }): Promise<any> {
    const response = await api.post('/rentals/manual', rentalData);
    return response.data;
  },
};