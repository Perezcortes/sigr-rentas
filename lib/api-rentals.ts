// lib/api-rentals.ts
import { api } from './api';
import { TenantFormData } from '@/types/tenant';

export interface CreateRentalRequest {
  tipoInquilino: 'fisica' | 'moral';
  tipoPropietario?: 'fisica' | 'moral';
  tipoPropiedad?: string;
  observaciones?: string;
  usuarioCreacion: string;
  propiedad?: {
    tipoPropiedad: string;
    domCalle: string;
    domNumExt: string;
    domNumInt?: string;
    domCp: string;
    domColonia: string;
    domMunicipio: string;
    domEstado: string;
    precioRenta: number;
  };
  inquilinoPf?: any;
  inquilinoPm?: any;
  propietarioPf?: any;
  propietarioPm?: any;
}

export const rentalsService = {
  // Métodos existentes
  async createManualRental(data: CreateRentalRequest) {
    const response = await api.post('/rentals/manual', data);
    return response.data;
  },

  async getAllRentals() {
    const response = await api.get('/rentals');
    return response.data;
  },

  async getRentalById(id: string) {
    const response = await api.get(`/rentals/${id}`);
    return response.data;
  },

  async updateRentalStatus(id: string, status: string) {
    const response = await api.put(`/rentals/${id}/status`, { status });
    return response.data;
  },

  async deleteRental(id: string) {
    const response = await api.delete(`/rentals/${id}`);
    return response.data;
  },

  // NUEVOS MÉTODOS PARA EDICIÓN
  
  /**
   * Obtener datos del inquilino por ID de renta
   */
  async getTenantByRentalId(rentalId: string): Promise<TenantFormData> {
    const response = await api.get(`/rentals/${rentalId}/inquilino`);
    return response.data;
  },

  /**
   * Actualizar datos del inquilino
   */
  async updateTenant(rentalId: string, tenantData: TenantFormData) {
    const response = await api.put(`/rentals/${rentalId}/inquilino`, tenantData);
    return response.data;
  },

  /**
   * Actualizar datos del propietario
   */
  async updateOwner(rentalId: string, ownerData: any) {
    const response = await api.put(`/rentals/${rentalId}/propietario`, ownerData);
    return response.data;
  },

  /**
   * Actualizar datos de la propiedad
   */
  async updateProperty(rentalId: string, propertyData: any) {
    const response = await api.put(`/rentals/${rentalId}/propiedad`, propertyData);
    return response.data;
  },
};