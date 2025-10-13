# Refactorización del Frontend - SIGR

## Objetivo de la Refactorización

Este documento detalla la refactorización completa del frontend del Sistema Integral de Gestión de Rentas (SIGR), migrando de una arquitectura centrada en **tipos de archivos** a una arquitectura modular centrada en **dominios de negocio**.

### Problemas Identificados

La estructura anterior presentaba los siguientes desafíos:

-  **Baja escalabilidad**: Todos los componentes mezclados en una sola carpeta `components/`
-  **Difícil mantenibilidad**: Componentes relacionados dispersos sin cohesión
-  **Falta de organización**: No había separación clara entre lógica de negocio y UI primitiva
-  **Acoplamiento**: Componentes de diferentes dominios coexistiendo sin estructura

### Solución Implementada

-  **Arquitectura modular**: Organización por dominios de negocio en `modules/`
-  **Separación de responsabilidades**: UI primitiva vs. lógica de negocio
-  **Alta cohesión**: Componentes relacionados agrupados en su módulo
-  **Bajo acoplamiento**: Cada módulo es independiente y reutilizable
-  **Escalabilidad mejorada**: Fácil agregar nuevos módulos sin afectar existentes

---

## 📂 Estructura Anterior vs. Nueva

### Estructura Anterior (Desordenada)

```
└── perezcortes-sigr-rentas/
    ├── components/
    │   ├── admin-tabs.tsx                    ← Mezclado
    │   ├── branch-management.tsx             ← Mezclado
    │   ├── dashboard-layout.tsx              ← Mezclado
    │   ├── dashboard-stats.tsx               ← Mezclado
    │   ├── login-form.tsx                    ← Mezclado
    │   ├── rental-management.tsx             ← Mezclado
    │   ├── user-profile.tsx                  ← Mezclado
    │   ├── branch-management/                ← Subcarpetas mezcladas
    │   ├── rental-tabs/                      ← Subcarpetas mezcladas
    │   ├── role-management/                  ← Subcarpetas mezcladas
    │   ├── user-management/                  ← Subcarpetas mezcladas
    │   └── ui/                               ← UI primitiva mezclada
    ├── lib/
    │   └── auth.ts                           ← Lógica de auth mezclada
    └── types/
        └── rental.ts                         ← Tipos dispersos
```

**Problemas:**
- Todos los componentes en una sola carpeta sin organización
- No hay separación entre dominios de negocio
- Difícil encontrar componentes relacionados
- Mezcla de UI primitiva con lógica de negocio

### Estructura Nueva (Modular)

```
└── perezcortes-sigr-rentas/
    ├── app/                      ← Rutas de Next.js (minimalistas)
    ├── components/ui/            ← SOLO primitivas de UI reutilizables
    ├── contexts/                 ← Contextos globales (AuthContext)
    ├── lib/                      ← Utilidades de bajo nivel
    ├── types/                    ← Tipos globales compartidos
    └── modules/                  ← LÓGICA DE NEGOCIO POR DOMINIO
        ├── auth/                 ← Autenticación
        ├── core/                 ← Layouts y Guards
        ├── dashboard/            ← Dashboard y estadísticas
        ├── perfil/               ← Gestión de perfil de usuario
        ├── admin/                ← Administración
        │   ├── branches/         ← Gestión de sucursales
        │   ├── roles/            ← Gestión de roles
        │   └── users/            ← Gestión de usuarios
        └── rentas/               ← Flujo completo de rentas
            ├── components/
            ├── views/
            └── types.ts
```

**Beneficios:**
-  Cada módulo agrupa su lógica completa (componentes, tipos, servicios)
-  Fácil navegación y mantenimiento
-  Separación clara entre UI primitiva y lógica de negocio
-  Escalable: agregar nuevos módulos sin afectar existentes

---

## Fases de Migración Completadas

### **Fase 1: Core y Autenticación** 

Migración de componentes fundamentales del sistema.

| Archivo Original | Destino Final | Función |
|-----------------|---------------|---------|
| `components/dashboard-layout.tsx` | `modules/core/dashboard-layout.tsx` | Layout principal del dashboard |
| `components/protected-route.tsx` | `modules/core/protected-route.tsx` | Guard de rutas protegidas |
| `lib/auth.ts` | `modules/auth/auth.service.ts` | Servicio de autenticación |
| `components/login-form.tsx` | `modules/auth/LoginForm.tsx` | Formulario de inicio de sesión |

---

### **Fase 2: Módulo de Administración** 

Consolidación completa del módulo administrativo con tres subdominios.

#### **Sucursales (Branches)**

| Archivo Original | Destino Final |
|-----------------|---------------|
| `components/branch-management.tsx` | `modules/admin/branches/BranchManagementView.tsx` |
| `components/branch-management/BranchDialog.tsx` | `modules/admin/branches/components/BranchDialog.tsx` |
| `components/branch-management/BranchFilters.tsx` | `modules/admin/branches/components/BranchFilters.tsx` |
| `components/branch-management/BranchManagementHeader.tsx` | `modules/admin/branches/components/BranchManagementHeader.tsx` |
| `components/branch-management/BranchTable.tsx` | `modules/admin/branches/components/BranchTable.tsx` |
| `components/branch-management/constants.ts` | `modules/admin/branches/constants.ts` |
| `components/branch-management/types.ts` | `modules/admin/branches/types.ts` |

#### **Usuarios (Users)**

| Archivo Original | Destino Final |
|-----------------|---------------|
| `components/user-management.tsx` | `modules/admin/users/UserManagementView.tsx` |
| `components/user-management/UserDialog.tsx` | `modules/admin/users/components/UserDialog.tsx` |
| `components/user-management/UserManagementHeader.tsx` | `modules/admin/users/components/UserManagementHeader.tsx` |
| `components/user-management/UserMetrics.tsx` | `modules/admin/users/components/UserMetrics.tsx` |
| `components/user-management/UserTable.tsx` | `modules/admin/users/components/UserTable.tsx` |
| `components/user-management/constants.ts` | `modules/admin/users/constants.ts` |
| `components/user-management/types.ts` | `modules/admin/users/types.ts` |

#### **Roles**

| Archivo Original | Destino Final |
|-----------------|---------------|
| `components/role-management.tsx` | `modules/admin/roles/RoleManagementView.tsx` |
| `components/role-management/RoleDialog.tsx` | `modules/admin/roles/components/RoleDialog.tsx` |
| `components/role-management/RoleManagementHeader.tsx` | `modules/admin/roles/components/RoleManagementHeader.tsx` |
| `components/role-management/RoleMetrics.tsx` | `modules/admin/roles/components/RoleMetrics.tsx` |
| `components/role-management/RoleTable.tsx` | `modules/admin/roles/components/RoleTable.tsx` |
| `components/role-management/constants.ts` | `modules/admin/roles/constants.ts` |
| `components/role-management/types.ts` | `modules/admin/roles/types.ts` |

#### **Pestañas de Administración**

| Archivo Original | Destino Final |
|-----------------|---------------|
| `components/admin-tabs.tsx` | `modules/admin/AdminTabs.tsx` |

---

### **Fase 3: Módulo de Rentas** 

Consolidación del flujo completo de gestión de rentas.

| Archivo Original | Destino Final | Función |
|-----------------|---------------|---------|
| `components/rental-management.tsx` | `modules/rentas/views/RentalListView.tsx` | Vista principal de listado |
| `components/rental-process.tsx` | `modules/rentas/views/RentalProcessView.tsx` | Vista de proceso de renta |
| `components/rental-tabs/InquilinoTab.tsx` | `modules/rentas/components/process-forms/InquilinoTab.tsx` | Formulario de inquilino |
| `components/rental-tabs/InquilinoFullForm.tsx` | `modules/rentas/components/process-forms/InquilinoFullForm.tsx` | Formulario completo inquilino |
| `components/rental-tabs/PropietarioTab.tsx` | `modules/rentas/components/process-forms/PropietarioTab.tsx` | Formulario de propietario |
| `components/rental-tabs/PropietarioFullForm.tsx` | `modules/rentas/components/process-forms/PropietarioFullForm.tsx` | Formulario completo propietario |
| `components/rental-tabs/ObligadoTab.tsx` | `modules/rentas/components/process-forms/ObligadoTab.tsx` | Formulario de obligado solidario |
| `components/rental-tabs/PropiedadTab.tsx` | `modules/rentas/components/process-forms/PropiedadTab.tsx` | Formulario de propiedad |
| `types/rental.ts` | `modules/rentas/types.ts` | Tipos específicos de rentas |

---

### **Fase 4: Dashboard y Perfil** 

Consolidación de componentes de visualización y perfil de usuario.

#### **Dashboard**

| Archivo Original | Destino Final | Función |
|-----------------|---------------|---------|
| `components/dashboard-stats.tsx` | `modules/dashboard/DashboardStats.tsx` | Tarjetas de estadísticas |
| `components/prospects-chart.tsx` | `modules/dashboard/ProspectsChart.tsx` | Gráfica de prospectos |
| `components/rentals-chart.tsx` | `modules/dashboard/RentalsChart.tsx` | Gráfica de rentas |
| `components/quick-access.tsx` | `modules/dashboard/QuickAccess.tsx` | Accesos rápidos |
| `components/message-center.tsx` | `modules/dashboard/MessageCenter.tsx` | Centro de mensajes |

#### **Perfil**

| Archivo Original | Destino Final | Función |
|-----------------|---------------|---------|
| `components/user-profile.tsx` | `modules/perfil/UserProfileView.tsx` | Vista principal del perfil |

---

## Resultado Final

### Limpieza Completa de `components/`

La carpeta `components/` ahora contiene **ÚNICAMENTE** la carpeta `ui/` con componentes primitivos reutilizables:

```
components/
└── ui/
    ├── accordion.tsx
    ├── alert.tsx
    ├── avatar.tsx
    ├── badge.tsx
    ├── button.tsx
    ├── card.tsx
    ├── chart.tsx
    ├── checkbox.tsx
    ├── dialog.tsx
    ├── dropdown-menu.tsx
    ├── input.tsx
    ├── label.tsx
    ├── select.tsx
    ├── table.tsx
    ├── tabs.tsx
    └── ... (más componentes de UI)
```

---

## Principios de la Nueva Arquitectura

### 1. **Separación de Responsabilidades**

- **`components/ui/`**: Componentes primitivos reutilizables sin lógica de negocio
- **`modules/`**: Lógica de negocio organizada por dominio
- **`app/`**: Rutas de Next.js minimalistas que consumen módulos
- **`lib/`**: Utilidades de bajo nivel (HTTP client, utils)
- **`contexts/`**: Estado global de la aplicación

### 2. **Estructura de un Módulo**

Cada módulo sigue esta estructura consistente:

```
modules/dominio/
├── components/          ← Componentes específicos del dominio
│   ├── ComponentA.tsx
│   └── ComponentB.tsx
├── views/              ← Vistas/páginas del dominio (opcional)
│   └── MainView.tsx
├── types.ts            ← Tipos específicos del dominio
├── constants.ts        ← Constantes del dominio (opcional)
└── services.ts         ← Servicios/lógica de negocio (opcional)
```

### 3. **Beneficios Obtenidos**

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Organización** | Componentes mezclados | Agrupados por dominio |
| **Mantenibilidad** | Difícil localizar código relacionado | Todo el código del dominio junto |
| **Escalabilidad** | Agregar features complica la estructura | Agregar módulos es trivial |
| **Testing** | Difícil testear en aislamiento | Cada módulo es testeable independientemente |
| **Reusabilidad** | Componentes acoplados | Módulos autocontenidos |
| **Onboarding** | Curva de aprendizaje alta | Estructura clara y predecible |

---

## 🔄 Flujo de Trabajo Post-Refactorización

### Para Agregar Nueva Funcionalidad

1. **Identificar el dominio**: ¿A qué módulo pertenece? (admin, rentas, dashboard, etc.)
2. **Crear en el módulo correcto**: Agregar archivos en `modules/dominio/`
3. **Consumir desde `app/`**: Las páginas en `app/` solo importan y renderizan
4. **Reutilizar UI primitiva**: Usar componentes de `components/ui/`

### Ejemplo: Agregar Gestión de Contratos

```
modules/
└── contratos/                    ← Nuevo módulo
    ├── components/
    │   ├── ContractForm.tsx
    │   ├── ContractTable.tsx
    │   └── ContractFilters.tsx
    ├── views/
    │   └── ContractManagementView.tsx
    ├── types.ts
    └── constants.ts
```

---

## Convenciones y Mejores Prácticas

### Nomenclatura

- **Componentes de Vista**: `*View.tsx` (ej. `RentalListView.tsx`)
- **Componentes UI**: `PascalCase.tsx` (ej. `BranchDialog.tsx`)
- **Servicios**: `*.service.ts` (ej. `auth.service.ts`)
- **Tipos**: `types.ts` dentro de cada módulo
- **Constantes**: `constants.ts` dentro de cada módulo

### Imports

```typescript
// ✅ Correcto: Importar desde módulos
import { RentalListView } from '@/modules/rentas/views/RentalListView'
import { Button } from '@/components/ui/button'

// ❌ Incorrecto: No importar componentes de negocio desde components/
import { RentalManagement } from '@/components/rental-management'
```

---

## Próximos Pasos Recomendados

1. **Testing**: Implementar tests unitarios por módulo
2. **Documentación**: Documentar cada módulo con su propio README
3. **Optimización**: Implementar code splitting por módulo
4. **Storybook**: Documentar componentes de `ui/` en Storybook
5. **CI/CD**: Configurar linting por módulo

---

## Equipo y Contribuciones

Al trabajar en este proyecto:

- Respeta la estructura modular establecida
- Agrupa código relacionado en el módulo correspondiente
- Mantén `components/ui/` limpio de lógica de negocio
- Documenta cambios significativos en la estructura

---

## Resumen de Cambios

### Archivos Movidos: **46 archivos**
### Módulos Creados: **7 módulos**
- ✅ `modules/auth/`
- ✅ `modules/core/`
- ✅ `modules/admin/` (con 3 subdominios)
- ✅ `modules/rentas/`
- ✅ `modules/dashboard/`
- ✅ `modules/perfil/`

### Resultado
- **Escalabilidad**
- **Mantenibilidad**
- **Claridad de código**
- **Tiempo de onboarding**

---

*Este README documenta la refactorización completa del frontend SIGR, transformando una estructura monolítica en una arquitectura modular escalable y mantenible.*