import * as React from "react";

import { AppDialog } from "@/shared/components/base/AppDialog";
import { Label } from "@/shared/components/base/Label";
import { Textarea } from "@/shared/components/base/Textarea";
import { toast } from "@/shared/components/base/Toaster";
import { useGestionDefaults } from "@/shared/hooks/useGestionDefaults";
import { useResetOnOpen } from "@/shared/hooks/useResetOnOpen";
import { actualizarCaso } from "@/shared/lib/caso-write";
import { tipoGestionDeCaso } from "@/shared/lib/utils/plazos";
import type { Caso } from "@/shared/types/caso";

import { GestionFields } from "./GestionFields";

export interface CompletarInformacionBajaDialogProps {
  caso: Caso | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

/**
 * Reevaluación · motivo "Posible baja", turno del capitán: la líder de
 * operaciones marcó "Falta información" y dejó un pedido en
 * `caso.comentarioBaja`. Este diálogo se lo muestra y el capitán solo
 * responde ese pedido — no decide nada (aprobar/rechazar no es su turno).
 * Al guardar, el caso sigue en "En evaluación" y el turno vuelve a la líder
 * (`turnoPosibleBaja = "lider-operaciones"`), que vuelve a ver "Resolver" y,
 * dentro de `RevisionPosibleBajaDialog`, el pedido junto con esta respuesta.
 */
export function CompletarInformacionBajaDialog({
  caso,
  open,
  onOpenChange,
  onSaved,
}: CompletarInformacionBajaDialogProps) {
  const [respuestaBaja, setRespuestaBaja] = React.useState("");
  const { fecha, setFecha } = useGestionDefaults(caso, open);

  useResetOnOpen(open && caso ? caso.id : null, () => {
    setRespuestaBaja("Información completada de prueba.");
  });

  if (!caso) return null;

  const tipoGestion = tipoGestionDeCaso(caso);
  const puedeConfirmar = respuestaBaja.trim() !== "";

  const handleConfirm = async () => {
    await actualizarCaso(
      caso.id,
      {
        respuestaBaja,
        turnoPosibleBaja: "lider-operaciones",
        fechaGestion: fecha || caso.fechaGestion,
        estadoProceso: "en-evaluacion",
        cerrado: false,
      },
      "posibleBajaInformacionCompletada",
      {
        description: "El capitán completa la información solicitada para la posible baja",
        trigger: "Diálogo de completar información",
        fields: ["respuestaBaja", "turnoPosibleBaja", "estadoProceso"],
      },
    );
    toast.success("Información enviada a la líder de operaciones", {
      description: `Caso de ${caso.cliente.nombre}`,
    });
    onSaved();
  };

  return (
    <AppDialog
      trigger={<span className="hidden" />}
      open={open}
      onOpenChange={onOpenChange}
      title="Completar información"
      description={`Caso de ${caso.cliente.nombre}. Vuelve a la líder de operaciones al guardar.`}
      confirmLabel="Guardar información"
      confirmDisabled={!puedeConfirmar}
      onConfirm={handleConfirm}
      className="sm:max-w-lg"
    >
      <div className="space-y-4">
        <div className="rounded-control bg-muted p-3">
          <p className="type-meta font-medium uppercase tracking-wide text-muted-foreground">
            Información solicitada por la líder de operaciones
          </p>
          <p className="mt-1 type-supporting text-foreground">{caso.comentarioBaja}</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="completar-baja-respuesta" required>
            Completa la información solicitada
          </Label>
          <Textarea
            id="completar-baja-respuesta"
            value={respuestaBaja}
            onChange={(e) => setRespuestaBaja(e.target.value)}
            placeholder="Detalla la información que faltaba."
          />
        </div>

        <GestionFields
          idPrefix="completar-baja"
          fecha={fecha}
          setFecha={setFecha}
          tipo={tipoGestion === "nuevo-cobro" ? undefined : tipoGestion}
        />
      </div>
    </AppDialog>
  );
}
