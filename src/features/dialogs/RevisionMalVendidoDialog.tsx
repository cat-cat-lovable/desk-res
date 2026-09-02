import { Upload, X } from "lucide-react";
import * as React from "react";

import { AppDialog } from "@/shared/components/base/AppDialog";
import { Label } from "@/shared/components/base/Label";
import { RadioGroup, RadioGroupItem } from "@/shared/components/base/RadioGroup";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/base/Select";
import { Textarea } from "@/shared/components/base/Textarea";
import { toast } from "@/shared/components/base/Toaster";
import { useGestionDefaults } from "@/shared/hooks/useGestionDefaults";
import { useResetOnOpen } from "@/shared/hooks/useResetOnOpen";
import { actualizarCaso } from "@/shared/lib/caso-write";
import { cn } from "@/shared/lib/utils/cn";
import { archivoADocumento } from "@/shared/lib/utils/documentos";
import { tipoGestionDeCaso } from "@/shared/lib/utils/plazos";
import {
  type CaminoMalVendido,
  CAMINOS_MAL_VENDIDO,
  type Caso,
  type CorrespondeMalVendido,
} from "@/shared/types/caso";

import { GestionFields } from "./GestionFields";

export interface RevisionMalVendidoDialogProps {
  caso: Caso | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const OPCIONES = [
  {
    valor: "si" as const,
    titulo: "Sí corresponde",
    descripcion: "Se confirma que el caso corresponde a un posible mal vendido.",
    tono: "success" as const,
  },
  {
    valor: "no" as const,
    titulo: "No corresponde",
    descripcion: "No corresponde mal vendido en este caso.",
    tono: "neutral" as const,
  },
] as const;

const TONO_TEXT = {
  success: "text-success-strong",
  neutral: "text-muted-foreground",
} as const;

/**
 * Reevaluación · motivo "Posible mal vendido": la capitana de ventas revisa
 * si corresponde o no. Cierra el caso en ambos casos —no hay un paso
 * posterior en la app—: la justificación (y, si corresponde, el camino
 * sugerido) quedan registradas en la tarjeta resuelta para que el capitán
 * que ingresó el caso tome la posta fuera de este flujo.
 */
export function RevisionMalVendidoDialog({
  caso,
  open,
  onOpenChange,
  onSaved,
}: RevisionMalVendidoDialogProps) {
  const [corresponde, setCorresponde] = React.useState<CorrespondeMalVendido | "">("");
  const [justificacion, setJustificacion] = React.useState("");
  const [caminoSugerido, setCaminoSugerido] = React.useState<CaminoMalVendido | "">("");
  const [documentos, setDocumentos] = React.useState<File[]>([]);
  const inputDocumentosRef = React.useRef<HTMLInputElement>(null);
  const { fecha, setFecha } = useGestionDefaults(caso, open);

  useResetOnOpen(open && caso ? caso.id : null, () => {
    setCorresponde("");
    setJustificacion("");
    setCaminoSugerido("");
    setDocumentos([]);
  });

  if (!caso) return null;

  const tipoGestion = tipoGestionDeCaso(caso);
  const puedeConfirmar =
    corresponde !== "" &&
    justificacion.trim() !== "" &&
    (corresponde !== "si" || caminoSugerido !== "");

  const agregarDocumentos = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setDocumentos((prev) => [...prev, ...Array.from(files)]);
  };

  const quitarDocumento = (index: number) => {
    setDocumentos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = async () => {
    if (!corresponde) return;
    await actualizarCaso(
      caso.id,
      {
        malVendidoCorresponde: corresponde,
        malVendidoJustificacion: justificacion,
        malVendidoCaminoSugerido: corresponde === "si" ? caminoSugerido || undefined : undefined,
        documentos:
          documentos.length > 0
            ? [...(caso.documentos ?? []), ...documentos.map(archivoADocumento)]
            : caso.documentos,
        fechaGestion: fecha || caso.fechaGestion,
        cerrado: true,
        estadoProceso: "resuelto",
      },
      "revisionMalVendidoResuelta",
      {
        description:
          corresponde === "si"
            ? "La capitana de ventas confirma que corresponde mal vendido"
            : "La capitana de ventas determina que no corresponde mal vendido",
        trigger: "Diálogo de revisión de mal vendido",
        fields: [
          "malVendidoCorresponde",
          "malVendidoJustificacion",
          "malVendidoCaminoSugerido",
          "documentos",
          "cerrado",
          "estadoProceso",
        ],
      },
    );
    toast.success("Revisión guardada: caso cerrado", {
      description: `Caso de ${caso.cliente.nombre}. El capitán queda notificado para tomar la posta.`,
    });
    onSaved();
  };

  return (
    <AppDialog
      trigger={<span className="hidden" />}
      open={open}
      onOpenChange={onOpenChange}
      title="Revisión de mal vendido"
      description={`Caso de ${caso.cliente.nombre}. Cierra el caso al confirmar.`}
      confirmLabel="Guardar revisión"
      confirmDisabled={!puedeConfirmar}
      onConfirm={handleConfirm}
      className="sm:max-w-lg"
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label required>¿Corresponde mal vendido?</Label>
          <RadioGroup
            value={corresponde}
            onValueChange={(v) => setCorresponde(v as CorrespondeMalVendido)}
            className="gap-2.5"
          >
            {OPCIONES.map((op) => (
              <Label
                key={op.valor}
                htmlFor={`mal-vendido-${op.valor}`}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-control border p-3 transition-colors hover:bg-muted/40",
                  corresponde === op.valor ? "border-primary bg-accent" : "border-border-subtle",
                )}
              >
                <RadioGroupItem
                  value={op.valor}
                  id={`mal-vendido-${op.valor}`}
                  className="mt-0.5 shrink-0"
                />
                <div className="space-y-0.5">
                  <p className="type-item-title text-foreground">{op.titulo}</p>
                  <p className={cn("type-supporting", TONO_TEXT[op.tono])}>{op.descripcion}</p>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </div>

        {corresponde !== "" && (
          <div className="space-y-1.5">
            <Label htmlFor="mal-vendido-justificacion" required>
              {corresponde === "si"
                ? "¿Por qué corresponde mal vendido?"
                : "¿Por qué no corresponde mal vendido?"}
            </Label>
            <Textarea
              id="mal-vendido-justificacion"
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              placeholder="Detalla el motivo de la decisión."
            />
          </div>
        )}

        {corresponde === "si" && (
          <div className="space-y-1.5">
            <Label htmlFor="mal-vendido-camino" required>
              Camino sugerido para el capitán
            </Label>
            <Select
              value={caminoSugerido}
              onValueChange={(v) => setCaminoSugerido(v as CaminoMalVendido)}
            >
              <SelectTrigger id="mal-vendido-camino">
                <SelectValue placeholder="Selecciona una sugerencia" />
              </SelectTrigger>
              <SelectContent>
                {CAMINOS_MAL_VENDIDO.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="type-meta text-muted-foreground">
              Es solo una sugerencia: el capitán decide y ejecuta el flujo real por fuera de este
              caso.
            </p>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="mal-vendido-documentos">Documentos adjuntos (opcional)</Label>
          <input
            ref={inputDocumentosRef}
            id="mal-vendido-documentos"
            type="file"
            multiple
            accept=".pdf,.doc,.docx,image/*"
            className="hidden"
            onChange={(e) => {
              agregarDocumentos(e.target.files);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => inputDocumentosRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-4 type-supporting text-muted-foreground transition-colors hover:border-border-strong hover:bg-accent/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Upload className="size-(--icon-size-inline)" aria-hidden="true" />
            Adjuntar PDF, Word o imagen
          </button>
          {documentos.length > 0 && (
            <ul className="space-y-1 pt-1">
              {documentos.map((archivo, i) => (
                <li
                  key={`${archivo.name}-${i}`}
                  className="flex items-center justify-between gap-2 rounded-control bg-muted px-2.5 py-1.5"
                >
                  <span className="truncate type-supporting text-foreground">{archivo.name}</span>
                  <button
                    type="button"
                    aria-label={`Quitar ${archivo.name}`}
                    onClick={() => quitarDocumento(i)}
                    className="shrink-0 rounded-control p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <X className="size-(--icon-size-inline)" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <GestionFields
          idPrefix="revision-mal-vendido"
          fecha={fecha}
          setFecha={setFecha}
          tipo={tipoGestion === "nuevo-cobro" ? undefined : tipoGestion}
        />
      </div>
    </AppDialog>
  );
}
