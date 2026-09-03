import { mockStore } from "@/prototype/mock-store/mock-store";
import { AppDialog } from "@/shared/components/base/AppDialog";
import { toast } from "@/shared/components/base/Toaster";
import type { Caso } from "@/shared/types/caso";

export interface EliminarCasoDialogProps {
  caso: Caso | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function EliminarCasoDialog({ caso, open, onOpenChange, onSaved }: EliminarCasoDialogProps) {
  if (!caso) return null;

  const handleConfirm = () => {
    // Eliminar es la única operación que el mock-store no expone como evento
    // (write.publish solo crea o funde por id): un backend real tendría un
    // endpoint de borrado; acá tocamos el store del prototipo directo.
    mockStore.transact((draft) => {
      draft.entities.caso = (draft.entities.caso ?? []).filter((record) => record.id !== caso.id);
    });
    toast.success("Caso eliminado", { description: `Caso de ${caso.cliente.nombre}` });
    onSaved();
  };

  return (
    <AppDialog
      trigger={<span className="hidden" />}
      open={open}
      onOpenChange={onOpenChange}
      title="Eliminar caso"
      description={`Se elimina el caso de ${caso.cliente.nombre} de forma permanente. Esta acción no se puede deshacer.`}
      confirmLabel="Eliminar caso"
      confirmVariant="destructive"
      onConfirm={handleConfirm}
    />
  );
}
