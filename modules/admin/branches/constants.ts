export const MAX_BRANCH_NAME = 80
export const MIN_BRANCH_NAME = 2
export const MAX_MANAGER_NAME = 80
export const MAX_STREET = 120
export const MAX_NEIGHBORHOOD = 80
export const MAX_MUNICIPALITY = 80
export const MAX_CITYTEXT = 80
export const MAX_CODE = 16

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const PHONE_RE = /^[0-9()+\-.\s]{7,18}$/
export const POSTAL_RE = /^\d{5}$/
export const CODE_RE = /^[A-Za-z0-9_-]+$/
export const LAT_RE = /^-?\d+(\.\d+)?$/
export const LNG_RE = /^-?\d+(\.\d+)?$/

export const INPUT_FOCUS =
  "placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-secondary focus-visible:border-secondary"
export const SELECT_FOCUS = "focus:ring-2 focus:ring-secondary focus:border-secondary"
