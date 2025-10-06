import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { INPUT_FOCUS, SELECT_FOCUS } from "./constants"

export type BranchFiltersProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  cityId: string
  onCityIdChange: (value: string) => void
  estateId: string
  onEstateIdChange: (value: string) => void
  status: "all" | "active" | "inactive"
  onStatusChange: (value: "all" | "active" | "inactive") => void
}

export function BranchFilters({
  searchValue,
  onSearchChange,
  cityId,
  onCityIdChange,
  estateId,
  onEstateIdChange,
  status,
  onStatusChange,
}: BranchFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <Input
        placeholder="Buscar por nombre, ciudad, responsable…"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        className={INPUT_FOCUS}
      />
      <Input
        placeholder="ciudad (ID)"
        type="number"
        value={cityId}
        onChange={(e) => onCityIdChange(e.target.value)}
        className={INPUT_FOCUS}
      />
      <Input
        placeholder="estate_id (ID)"
        type="number"
        value={estateId}
        onChange={(e) => onEstateIdChange(e.target.value)}
        className={INPUT_FOCUS}
      />
      <Select value={status} onValueChange={(v: "all" | "active" | "inactive") => onStatusChange(v)}>
        <SelectTrigger className={SELECT_FOCUS}>
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="active">Activas</SelectItem>
          <SelectItem value="inactive">Inactivas</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
