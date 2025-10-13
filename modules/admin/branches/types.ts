export type BranchStatus = "active" | "inactive"

export interface Branch {
  id: string
  name: string
  address: string
  cityName: string
  stateName: string
  cityId?: number
  stateId?: number
  phone: string
  email: string
  manager: string
  status: BranchStatus
  employees: number
  code?: string
  statusReceiveLeads?: boolean
}

export type BranchFormState = {
  name: string
  code: string
  manager: string
  status: BranchStatus
  statusReceiveLeads: boolean
  phone: string
  email: string
  cityId: number | string
  stateId: number | string
  cityText: string
  street: string
  extNumber: string
  intNumber: string
  neighborhood: string
  municipality: string
  postalCode: string
  lat: number | string
  lng: number | string
}

export const initialBranchForm: BranchFormState = {
  name: "",
  code: "",
  manager: "",
  status: "active",
  statusReceiveLeads: true,
  phone: "",
  email: "",
  cityId: "",
  stateId: "",
  cityText: "",
  street: "",
  extNumber: "",
  intNumber: "",
  neighborhood: "",
  municipality: "",
  postalCode: "",
  lat: "",
  lng: "",
}

export type BranchFormErrors = Partial<Record<keyof BranchFormState, string>>
export type BranchTouched = Partial<Record<keyof BranchFormState, boolean>>

export type BranchFilters = {
  search: string
  cityId?: string
  estateId?: string
  status: "all" | "active" | "inactive"
}

export type PostalInfo = {
  estado?: string
  municipio?: string
  colonias: string[]
}
