"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BranchManagement } from "@/components/branch-management"
import { UserManagement } from "@/components/user-management"
import { Building2, Users } from "lucide-react"

export function AdminTabs() {
  return (
    <Tabs defaultValue="branches" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 max-w-md">
        <TabsTrigger value="branches" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Sucursales
        </TabsTrigger>
        <TabsTrigger value="users" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Usuarios
        </TabsTrigger>
      </TabsList>

      <TabsContent value="branches" className="space-y-6">
        <BranchManagement />
      </TabsContent>

      <TabsContent value="users" className="space-y-6">
        <UserManagement />
      </TabsContent>
    </Tabs>
  )
}
