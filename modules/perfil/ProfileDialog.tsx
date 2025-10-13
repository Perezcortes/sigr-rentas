import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "../../components/ui/use-toast"; // <-- Cambiado de nuevo para una ruta relativa simple que podría funcionar
import { User, ApiProfile } from '@/types/auth'; // Usaremos el tipo User/ApiProfile definido en tu layout original o types/auth.ts
import { Loader2, Save, X } from "lucide-react";

// Nota: Esta es una simplificación de ApiProfile para los campos editables
type EditableProfile = {
    name?: string;
    email?: string;
    officeDisplay?: string;
    roleLabel?: string;
};

interface ProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentProfile: ApiProfile | null;
    officeName: string;
    roleLabel: string;
    // Función para manejar la actualización, recibe el payload de datos
    onProfileUpdate: (data: { name: string; email: string }) => Promise<void>;
}

/**
 * Muestra la información del perfil del usuario y permite la edición de campos básicos.
 */
export function ProfileDialog({ open, onOpenChange, currentProfile, officeName, roleLabel, onProfileUpdate }: ProfileDialogProps) {
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    
    // Estado para los campos editables
    const [editableData, setEditableData] = useState<EditableProfile>({
        name: currentProfile?.name || "",
        email: currentProfile?.email || "",
        officeDisplay: officeName,
        roleLabel: roleLabel,
    });

    // Sincronizar el estado interno cuando el perfil externo o el diálogo se abre
    useEffect(() => {
        if (open && currentProfile) {
            setEditableData({
                name: currentProfile.name || "",
                email: currentProfile.email || "",
                officeDisplay: officeName,
                roleLabel: roleLabel,
            });
        }
    }, [open, currentProfile, officeName, roleLabel]);

    const isDirty = useMemo(() => {
        if (!currentProfile) return false;
        // Solo verificamos si 'name' o 'email' cambiaron, ya que son los únicos editables aquí
        return editableData.name !== (currentProfile.name || "") || editableData.email !== (currentProfile.email || "");
    }, [editableData, currentProfile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isDirty || isSaving) return;

        setIsSaving(true);
        try {
            // Llama a la función de actualización pasada por props
            await onProfileUpdate({
                name: editableData.name || currentProfile?.name || "",
                email: editableData.email || currentProfile?.email || "",
            });

            toast({
                title: "Perfil actualizado",
                description: "Tu información personal ha sido guardada con éxito.",
                variant: "default",
            });
            onOpenChange(false); // Cierra el modal después de guardar
        } catch (error) {
            console.error("Error al actualizar perfil:", error);
            toast({
                title: "Error al guardar",
                description: "Ocurrió un error al actualizar tu perfil. Intenta de nuevo.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Los campos 'officeDisplay' y 'roleLabel' son solo de lectura
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Perfil</DialogTitle>
                    <DialogDescription>
                        Actualiza tu información personal. Haz clic en guardar cuando termines.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        
                        {/* Campo de Nombre (Editable) */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Nombre</Label>
                            <Input
                                id="name"
                                value={editableData.name}
                                onChange={(e) => setEditableData(prev => ({ ...prev, name: e.target.value }))}
                                className="col-span-3"
                                required
                            />
                        </div>

                        {/* Campo de Email (Editable) */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={editableData.email}
                                onChange={(e) => setEditableData(prev => ({ ...prev, email: e.target.value }))}
                                className="col-span-3"
                                required
                            />
                        </div>

                        {/* Campo de Rol (Solo Lectura) */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">Rol</Label>
                            <Input
                                id="role"
                                value={editableData.roleLabel}
                                className="col-span-3 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                                disabled
                            />
                        </div>
                        
                        {/* Campo de Oficina (Solo Lectura) */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="office" className="text-right">Oficina</Label>
                            <Input
                                id="office"
                                value={editableData.officeDisplay}
                                className="col-span-3 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                                disabled
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <Button 
                            type="submit" 
                            disabled={!isDirty || isSaving}
                        >
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {!isSaving ? (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Guardar Cambios
                                </>
                            ) : (
                                "Guardando..."
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
