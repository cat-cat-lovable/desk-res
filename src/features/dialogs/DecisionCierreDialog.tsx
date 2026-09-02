import * as React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/base/Accordion";
import { AppDialog } from "@/shared/components/base/AppDialog";
import { Input } from "@/shared/components/base/Input";
import { Label } from "@/shared/components/base/Label";
import { RadioGroup, RadioGroupItem } from "@/shared/components/base/RadioGroup";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/base/Select";
import { Separator } from "@/shared/components/base/Separator";
import { Textarea } from "@/shared/components/base/Textarea";
import { toast } from "@/shared/components/base/Toaster";
import { useGestionDefaults } from "@/shared/hooks/useGestionDefaults";
import { useResetOnOpen } from "@/shared/hooks/useResetOnOpen";
import { actualizarCaso } from "@/shared/lib/caso-write";
import { cn } from "@/shared/lib/utils/cn";
import { CUENTA_PRUEBA, CUOTAS_PRUEBA, MONTO_PRUEBA } from "@/shared/lib/utils/datosPrueba";
import { formatFechaCorta, formatMonto, normalizarMonto } from "@/shared/lib/utils/format";
import { tipoGestionDeCaso } from "@/shared/lib/utils/plazos";
import {
  CAPITANES,
  type Caso,
  type MotivoBaja,
  MOTIVOS_BAJA,
  type Resultado,
  RESULTADOS_REEMBOLSO,
  RESULTADOS_REEVALUACION,
  type ServicioDerivacion,
  SERVICIOS_DERIVACION,
} from "@/shared/types/caso";

import { GestionFields } from "./GestionFields";

export interface DecisionCierreDialogProps {
  caso: Caso | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

// Modificación de contrato no pasa por este diálogo: su acción principal
// (caso-helpers.ts) va directo a "Definir nuevo cobro", siempre procede.
function opcionesResultado(caso: Caso): readonly Resultado[] {
  if (caso.tipoCaso === "reembolso") return RESULTADOS_REEMBOLSO;
  return RESULTADOS_REEVALUACION;
}

const RESULTADO_TONO_TEXT = {
  success: "text-success-strong",
  destructive: "text-destructive",
  neutral: "text-muted-foreground",
} as const;

const OPCIONES_DECISION_BAJA = [
  {
    valor: "aprueba" as const,
    titulo: "Se aprueba baja",
    descripcion: "El cliente queda dado de baja del servicio.",
    tono: "destructive" as const,
  },
  {
    valor: "rechaza" as const,
    titulo: "Se rechaza baja",
    descripcion: "El cliente se mantiene en el servicio.",
    tono: "success" as const,
  },
  {
    valor: "falta-informacion" as const,
    titulo: "Falta información",
    descripcion: `El caso queda pendiente en "En evaluación" hasta completar los datos.`,
    tono: "neutral" as const,
  },
] as const;

const COMENTARIO_BAJA_LABEL: Record<(typeof OPCIONES_DECISION_BAJA)[number]["valor"], string> = {
  aprueba: "¿Por qué se aprueba la baja?",
  rechaza: "¿Por qué no se da de baja al cliente?",
  "falta-informacion": "¿Qué información falta por completar?",
};

function resultadoInfo(
  caso: Caso,
  resultado: Resultado,
): { tono: keyof typeof RESULTADO_TONO_TEXT; descripcion: string } {
  if (caso.tipoCaso === "reembolso") {
    if (resultado === "Procede sin baja") {
      return {
        tono: "success",
        descripcion:
          "El reembolso se aprueba y se procesa la devolución. El cliente continúa en el servicio.",
      };
    }
    if (resultado === "Procede con baja") {
      return {
        tono: "destructive",
        descripcion:
          "El reembolso se aprueba. Una vez confirmado el depósito, se procede a dar de baja al cliente.",
      };
    }
    return { tono: "neutral", descripcion: "No corresponde devolución en este caso." };
  }

  if (resultado === "Se mantiene") {
    return {
      tono: "success",
      descripcion: "El caso continúa igual, sin cambios de servicio ni baja.",
    };
  }
  if (resultado === "Dar de baja") {
    return {
      tono: "destructive",
      descripcion: "Se evalúa si corresponde dar de baja al cliente del servicio.",
    };
  }
  return {
    tono: "neutral",
    descripcion: "El caso pasa a otro servicio interno; se inicia el flujo de derivación.",
  };
}

function CampoPreview({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="min-w-0">
      <p className="type-meta text-muted-foreground">{label}</p>
      <p className="type-body truncate text-foreground">{value}</p>
    </div>
  );
}

interface CamposCuentaReembolsoProps {
  idPrefix: string;
  cuentaTitular: string;
  setCuentaTitular: (v: string) => void;
  cuentaBanco: string;
  setCuentaBanco: (v: string) => void;
  cuentaTipo: string;
  setCuentaTipo: (v: string) => void;
  cuentaNumero: string;
  setCuentaNumero: (v: string) => void;
}

function CamposCuentaReembolso({
  idPrefix,
  cuentaTitular,
  setCuentaTitular,
  cuentaBanco,
  setCuentaBanco,
  cuentaTipo,
  setCuentaTipo,
  cuentaNumero,
  setCuentaNumero,
}: CamposCuentaReembolsoProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-titular`}>Titular</Label>
        <Input
          id={`${idPrefix}-titular`}
          value={cuentaTitular}
          onChange={(e) => setCuentaTitular(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-banco`}>Banco</Label>
        <Input
          id={`${idPrefix}-banco`}
          value={cuentaBanco}
          onChange={(e) => setCuentaBanco(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-tipo-cuenta`}>Tipo de cuenta</Label>
        <Input
          id={`${idPrefix}-tipo-cuenta`}
          value={cuentaTipo}
          onChange={(e) => setCuentaTipo(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-numero-cuenta`} required>
          Número de cuenta
        </Label>
        <Input
          id={`${idPrefix}-numero-cuenta`}
          value={cuentaNumero}
          onChange={(e) => setCuentaNumero(e.target.value)}
        />
      </div>
    </div>
  );
}

export function DecisionCierreDialog({
  caso,
  open,
  onOpenChange,
  onSaved,
}: DecisionCierreDialogProps) {
  const [resultado, setResultado] = React.useState<Resultado | "">("");
  const [servicioTentativo, setServicioTentativo] = React.useState<ServicioDerivacion | "">("");
  const [solicitadoPor, setSolicitadoPor] = React.useState("");
  const [justificacion, setJustificacion] = React.useState("");
  const [clienteAcepta, setClienteAcepta] = React.useState<"aceptada" | "rechazada">("aceptada");
  const [decisionBaja, setDecisionBaja] = React.useState<
    "aprueba" | "rechaza" | "falta-informacion" | ""
  >("");
  const [comentarioBaja, setComentarioBaja] = React.useState("");
  const [motivoBaja, setMotivoBaja] = React.useState<MotivoBaja | "">("");
  const [conReembolso, setConReembolso] = React.useState<"si" | "no">("no");
  const [montoReembolso, setMontoReembolso] = React.useState("");
  const [cuotasReembolso, setCuotasReembolso] = React.useState("");
  const [notaDevolucion, setNotaDevolucion] = React.useState("");
  const [motivoRechazoReembolso, setMotivoRechazoReembolso] = React.useState("");
  const [cuentaTitular, setCuentaTitular] = React.useState("");
  const [cuentaBanco, setCuentaBanco] = React.useState("");
  const [cuentaTipo, setCuentaTipo] = React.useState("");
  const [cuentaNumero, setCuentaNumero] = React.useState("");
  const { fecha, setFecha } = useGestionDefaults(caso, open);

  useResetOnOpen(open && caso ? caso.id : null, () => {
    setResultado("");
    setServicioTentativo(SERVICIOS_DERIVACION[0]);
    setSolicitadoPor(caso?.capitanACargo || CAPITANES[0]);
    setJustificacion("Justificación de prueba para el flujo de derivación.");
    setClienteAcepta("aceptada");
    setDecisionBaja("");
    setComentarioBaja("Comentario de prueba para la decisión de baja.");
    setMotivoBaja(MOTIVOS_BAJA[0]);
    setConReembolso("no");
    setMontoReembolso(caso?.montoReembolso ? String(caso.montoReembolso) : MONTO_PRUEBA);
    setCuotasReembolso(caso?.cuotasReembolso ? String(caso.cuotasReembolso) : CUOTAS_PRUEBA);
    setNotaDevolucion("Nota de devolución de prueba.");
    setMotivoRechazoReembolso("Motivo de rechazo de prueba.");
    setCuentaTitular(caso?.cuentaTitular ?? caso?.cliente.nombre ?? CUENTA_PRUEBA.titular);
    setCuentaBanco(caso?.cuentaBanco ?? CUENTA_PRUEBA.banco);
    setCuentaTipo(caso?.cuentaTipo ?? CUENTA_PRUEBA.tipo);
    setCuentaNumero(caso?.cuentaNumero ?? CUENTA_PRUEBA.numero);
  });

  if (!caso) return null;

  const opciones = opcionesResultado(caso);
  const tipoGestion = tipoGestionDeCaso(caso);
  const tieneCajaVentas = Boolean(caso.descripcionVentas || caso.cobroAnterior);
  const esProcedeReembolso = resultado === "Procede sin baja" || resultado === "Procede con baja";

  const puedeConfirmar =
    resultado !== "" &&
    !(resultado === "Derivación a otro servicio" && (!servicioTentativo || !justificacion)) &&
    !(resultado === "Dar de baja" && !decisionBaja) &&
    !(resultado === "Dar de baja" && decisionBaja !== "" && comentarioBaja.trim() === "") &&
    !(resultado === "Dar de baja" && decisionBaja === "aprueba" && !motivoBaja) &&
    !(
      resultado === "Dar de baja" &&
      decisionBaja === "aprueba" &&
      conReembolso === "si" &&
      (!montoReembolso || !cuentaNumero)
    ) &&
    !(esProcedeReembolso && (!montoReembolso || !cuotasReembolso || !cuentaNumero)) &&
    !(resultado === "No procede" && caso.tipoCaso === "reembolso" && !motivoRechazoReembolso);

  const handleConfirm = async () => {
    const base = {
      fechaGestion: fecha || caso.fechaGestion,
    };

    if (resultado === "Se mantiene") {
      await actualizarCaso(
        caso.id,
        { ...base, resultado, cerrado: true, estadoProceso: "resuelto" },
        "decisionCierreResuelta",
        {
          description: "Se decide mantener el servicio actual",
          trigger: "Diálogo de decisión de cierre",
          fields: ["resultado", "cerrado", "estadoProceso"],
        },
      );
    } else if (resultado === "Derivación a otro servicio") {
      if (clienteAcepta === "rechazada") {
        await actualizarCaso(
          caso.id,
          {
            ...base,
            resultado: "Dar de baja",
            motivoBaja: "Baja por derivación no aceptada o no completada",
            detalleResolucion: "El cliente no aceptó la derivación propuesta.",
            cerrado: true,
            estadoProceso: "resuelto",
          },
          "decisionCierreResuelta",
          {
            description: "El cliente rechaza la derivación: se cierra como baja",
            trigger: "Diálogo de decisión de cierre",
            fields: ["resultado", "motivoBaja", "cerrado", "estadoProceso"],
          },
        );
      } else {
        await actualizarCaso(
          caso.id,
          {
            ...base,
            resultado,
            servicioDestino: servicioTentativo || undefined,
            detalleDerivacion: {
              servicioTentativo: servicioTentativo as ServicioDerivacion,
              solicitadoPor,
              justificacion,
            },
            evaluacionCliente: { estado: "aceptada" },
            pasoDerivacion: "recepcion",
            estadoProceso: "en-evaluacion",
            cerrado: false,
          },
          "decisionCierreResuelta",
          {
            description: "Se decide derivar el caso a otro servicio",
            trigger: "Diálogo de decisión de cierre",
            fields: [
              "resultado",
              "servicioDestino",
              "detalleDerivacion",
              "evaluacionCliente",
              "pasoDerivacion",
              "estadoProceso",
            ],
          },
        );
      }
    } else if (resultado === "Dar de baja" && decisionBaja === "falta-informacion") {
      await actualizarCaso(
        caso.id,
        {
          ...base,
          comentarioBaja,
          cerrado: false,
          estadoProceso: "en-evaluacion",
        },
        "decisionCierreFaltaInformacion",
        {
          description: "Falta información para decidir la baja",
          trigger: "Diálogo de decisión de cierre",
          fields: ["comentarioBaja", "estadoProceso"],
        },
      );
      toast.success("Caso actualizado: falta información", {
        description: `Caso de ${caso.cliente.nombre}`,
      });
      onSaved();
      return;
    } else if (resultado === "Dar de baja" && decisionBaja === "rechaza") {
      await actualizarCaso(
        caso.id,
        {
          ...base,
          resultado: "Se mantiene",
          comentarioBaja,
          detalleResolucion: comentarioBaja,
          cerrado: true,
          estadoProceso: "resuelto",
        },
        "decisionCierreResuelta",
        {
          description: "Se rechaza la baja: el cliente se mantiene en el servicio",
          trigger: "Diálogo de decisión de cierre",
          fields: ["resultado", "comentarioBaja", "detalleResolucion", "cerrado", "estadoProceso"],
        },
      );
    } else if (resultado === "Dar de baja" && decisionBaja === "aprueba") {
      if (conReembolso === "si") {
        await actualizarCaso(
          caso.id,
          {
            ...base,
            resultado,
            motivoBaja: motivoBaja || undefined,
            comentarioBaja,
            montoReembolso: normalizarMonto(montoReembolso),
            cuotasReembolso: cuotasReembolso ? Number(cuotasReembolso) : undefined,
            cuentaTitular,
            cuentaBanco,
            cuentaTipo,
            cuentaNumero,
            reembolsoConfirmacionBaja: { estado: "pendiente" },
            pendienteConfirmacion: "reembolso-baja",
            estadoProceso: "en-evaluacion",
            cerrado: false,
          },
          "decisionCierreResuelta",
          {
            description: "Se aprueba la baja con reembolso",
            trigger: "Diálogo de decisión de cierre",
            fields: [
              "resultado",
              "motivoBaja",
              "comentarioBaja",
              "montoReembolso",
              "cuotasReembolso",
              "pendienteConfirmacion",
              "estadoProceso",
            ],
          },
        );
      } else {
        await actualizarCaso(
          caso.id,
          {
            ...base,
            resultado,
            motivoBaja: motivoBaja || undefined,
            comentarioBaja,
            detalleResolucion: comentarioBaja,
            cerrado: true,
            estadoProceso: "resuelto",
          },
          "decisionCierreResuelta",
          {
            description: "Se aprueba la baja sin reembolso",
            trigger: "Diálogo de decisión de cierre",
            fields: [
              "resultado",
              "motivoBaja",
              "comentarioBaja",
              "detalleResolucion",
              "cerrado",
              "estadoProceso",
            ],
          },
        );
      }
    } else if (esProcedeReembolso) {
      await actualizarCaso(
        caso.id,
        {
          ...base,
          resultado,
          montoReembolso: normalizarMonto(montoReembolso),
          cuotasReembolso: cuotasReembolso ? Number(cuotasReembolso) : undefined,
          notaDevolucion: notaDevolucion || undefined,
          cuentaTitular,
          cuentaBanco,
          cuentaTipo,
          cuentaNumero,
          reembolsoConfirmacionBaja: { estado: "pendiente" },
          pendienteConfirmacion: "reembolso-baja",
          estadoProceso: "en-evaluacion",
          cerrado: false,
        },
        "decisionCierreResuelta",
        {
          description:
            resultado === "Procede con baja"
              ? "Se aprueba el reembolso y se da de baja al cliente"
              : "Se aprueba el reembolso",
          trigger: "Diálogo de decisión de cierre",
          fields: [
            "resultado",
            "montoReembolso",
            "cuotasReembolso",
            "notaDevolucion",
            "cuentaTitular",
            "cuentaBanco",
            "cuentaTipo",
            "cuentaNumero",
            "pendienteConfirmacion",
            "estadoProceso",
          ],
        },
      );
    } else if (resultado === "No procede") {
      await actualizarCaso(
        caso.id,
        {
          ...base,
          resultado,
          motivoRechazoReembolso:
            caso.tipoCaso === "reembolso" ? motivoRechazoReembolso || undefined : undefined,
          cerrado: true,
          estadoProceso: "resuelto",
        },
        "decisionCierreResuelta",
        {
          description: "El caso no procede",
          trigger: "Diálogo de decisión de cierre",
          fields: ["resultado", "motivoRechazoReembolso", "cerrado", "estadoProceso"],
        },
      );
    }

    toast.success("Caso resuelto", { description: `Caso de ${caso.cliente.nombre}` });
    onSaved();
  };

  return (
    <AppDialog
      trigger={<span className="hidden" />}
      open={open}
      onOpenChange={onOpenChange}
      title="Resolver caso"
      description={`Caso de ${caso.cliente.nombre}`}
      confirmLabel="Guardar resolución"
      confirmDisabled={!puedeConfirmar}
      onConfirm={handleConfirm}
      className="sm:max-w-lg"
    >
      <div className="space-y-4">
        <RadioGroup
          value={resultado}
          onValueChange={(v) => setResultado(v as Resultado)}
          className="gap-2.5"
        >
          {opciones.map((op) => {
            const info = resultadoInfo(caso, op);
            return (
              <Label
                key={op}
                htmlFor={`resultado-${op}`}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-control border p-3 transition-colors hover:bg-muted/40",
                  resultado === op ? "border-primary bg-accent" : "border-border-subtle",
                )}
              >
                <RadioGroupItem value={op} id={`resultado-${op}`} className="mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <p className="type-item-title text-foreground">{op}</p>
                  <p className={cn("type-supporting", RESULTADO_TONO_TEXT[info.tono])}>
                    {info.descripcion}
                  </p>
                </div>
              </Label>
            );
          })}
        </RadioGroup>

        {resultado !== "" && <Separator />}

        {resultado !== "" && tieneCajaVentas && (
          <Accordion
            type="single"
            collapsible
            className="rounded-control border border-border-subtle bg-muted/40"
          >
            <AccordionItem value="post-venta" className="border-none px-3">
              <AccordionTrigger className="type-meta font-medium uppercase tracking-wide text-muted-foreground hover:no-underline">
                Información post-venta
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                {caso.descripcionVentas && (
                  <div className="rounded-control bg-muted p-3">
                    <p className="type-meta font-medium uppercase tracking-wide text-muted-foreground">
                      Descripción del caso
                    </p>
                    <p className="mt-1 type-supporting text-foreground">{caso.descripcionVentas}</p>
                  </div>
                )}
                <div className="space-y-3 rounded-control border border-border-subtle bg-background p-3">
                  <p className="type-meta font-medium uppercase tracking-wide text-muted-foreground">
                    Cobro anterior (post-venta)
                  </p>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <CampoPreview
                      label="Valor contrato"
                      value={caso.cobroAnterior ? formatMonto(caso.cobroAnterior.montoTotal) : "—"}
                    />
                    <CampoPreview label="N.º de cuotas" value={caso.cobroAnterior?.cuotas ?? "—"} />
                    <CampoPreview
                      label="Valor cuota"
                      value={
                        caso.cobroAnterior ? formatMonto(caso.cobroAnterior.montoPrimeraCuota) : "—"
                      }
                    />
                    <CampoPreview
                      label="Fecha cuota"
                      value={
                        caso.cobroAnterior ? formatFechaCorta(caso.cobroAnterior.fechaInicio) : "—"
                      }
                    />
                    <CampoPreview
                      label="Estado pago"
                      value={caso.cobroAnterior?.pagoPrimeraCuota ?? "—"}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {resultado === "Derivación a otro servicio" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="servicio-tentativo" required>
                Servicio tentativo
              </Label>
              <Select
                value={servicioTentativo}
                onValueChange={(v) => setServicioTentativo(v as ServicioDerivacion)}
              >
                <SelectTrigger id="servicio-tentativo">
                  <SelectValue placeholder="Selecciona un servicio" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICIOS_DERIVACION.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="solicitado-por">Solicitado por</Label>
              <Input
                id="solicitado-por"
                value={solicitadoPor}
                onChange={(e) => setSolicitadoPor(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="justificacion" required>
                Justificación
              </Label>
              <Textarea
                id="justificacion"
                value={justificacion}
                onChange={(e) => setJustificacion(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>¿El cliente acepta evaluar la derivación?</Label>
              <RadioGroup
                value={clienteAcepta}
                onValueChange={(v) => setClienteAcepta(v as typeof clienteAcepta)}
                className="gap-2"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="aceptada" id="cliente-acepta" />
                  <Label htmlFor="cliente-acepta">Acepta</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="rechazada" id="cliente-rechaza" />
                  <Label htmlFor="cliente-rechaza">No acepta</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )}

        {resultado === "Dar de baja" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label required>¿Se aprueba la baja?</Label>
              <RadioGroup
                value={decisionBaja}
                onValueChange={(v) => setDecisionBaja(v as typeof decisionBaja)}
                className="gap-2.5"
              >
                {OPCIONES_DECISION_BAJA.map((op) => (
                  <Label
                    key={op.valor}
                    htmlFor={`baja-${op.valor}`}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-control border p-3 transition-colors hover:bg-muted/40",
                      decisionBaja === op.valor
                        ? "border-primary bg-accent"
                        : "border-border-subtle",
                    )}
                  >
                    <RadioGroupItem
                      value={op.valor}
                      id={`baja-${op.valor}`}
                      className="mt-0.5 shrink-0"
                    />
                    <div className="space-y-0.5">
                      <p className="type-item-title text-foreground">{op.titulo}</p>
                      <p className={cn("type-supporting", RESULTADO_TONO_TEXT[op.tono])}>
                        {op.descripcion}
                      </p>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            {decisionBaja !== "" && (
              <div className="space-y-1.5">
                <Label htmlFor="baja-comentario" required>
                  {COMENTARIO_BAJA_LABEL[decisionBaja]}
                </Label>
                <Textarea
                  id="baja-comentario"
                  value={comentarioBaja}
                  onChange={(e) => setComentarioBaja(e.target.value)}
                  placeholder="Detalla el motivo de la decisión."
                />
              </div>
            )}

            {decisionBaja === "aprueba" && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="motivo-baja" required>
                    Motivo de baja
                  </Label>
                  <Select value={motivoBaja} onValueChange={(v) => setMotivoBaja(v as MotivoBaja)}>
                    <SelectTrigger id="motivo-baja">
                      <SelectValue placeholder="Selecciona un motivo" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOTIVOS_BAJA.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>¿Corresponde reembolso?</Label>
                  <RadioGroup
                    value={conReembolso}
                    onValueChange={(v) => setConReembolso(v as typeof conReembolso)}
                    className="gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="no" id="reembolso-no" />
                      <Label htmlFor="reembolso-no">Sin reembolso</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="si" id="reembolso-si" />
                      <Label htmlFor="reembolso-si">Con reembolso</Label>
                    </div>
                  </RadioGroup>
                </div>
                {conReembolso === "si" && (
                  <div className="space-y-4 rounded-control bg-muted p-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="baja-monto" required>
                          Monto aprobado
                        </Label>
                        <Input
                          id="baja-monto"
                          inputMode="numeric"
                          value={montoReembolso}
                          onChange={(e) => setMontoReembolso(e.target.value)}
                          placeholder="$0"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="baja-cuotas">Cuotas reembolsadas</Label>
                        <Input
                          id="baja-cuotas"
                          type="number"
                          min={1}
                          value={cuotasReembolso}
                          onChange={(e) => setCuotasReembolso(e.target.value)}
                        />
                      </div>
                    </div>
                    <CamposCuentaReembolso
                      idPrefix="baja"
                      cuentaTitular={cuentaTitular}
                      setCuentaTitular={setCuentaTitular}
                      cuentaBanco={cuentaBanco}
                      setCuentaBanco={setCuentaBanco}
                      cuentaTipo={cuentaTipo}
                      setCuentaTipo={setCuentaTipo}
                      cuentaNumero={cuentaNumero}
                      setCuentaNumero={setCuentaNumero}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {esProcedeReembolso && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Cuotas solicitadas</Label>
                <p className="type-body text-foreground">{caso.cuotasSolicitadas || "—"}</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reembolso-cuotas" required>
                  Cuotas a reembolsar
                </Label>
                <Input
                  id="reembolso-cuotas"
                  type="number"
                  min={1}
                  value={cuotasReembolso}
                  onChange={(e) => setCuotasReembolso(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reembolso-monto" required>
                Monto aprobado
              </Label>
              <Input
                id="reembolso-monto"
                inputMode="numeric"
                value={montoReembolso}
                onChange={(e) => setMontoReembolso(e.target.value)}
                placeholder="$0"
              />
            </div>
            <div className="space-y-3 rounded-control bg-muted p-3">
              <p className="type-meta font-medium uppercase tracking-wide text-muted-foreground">
                Datos de reembolso
              </p>
              <CamposCuentaReembolso
                idPrefix="reembolso"
                cuentaTitular={cuentaTitular}
                setCuentaTitular={setCuentaTitular}
                cuentaBanco={cuentaBanco}
                setCuentaBanco={setCuentaBanco}
                cuentaTipo={cuentaTipo}
                setCuentaTipo={setCuentaTipo}
                cuentaNumero={cuentaNumero}
                setCuentaNumero={setCuentaNumero}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reembolso-nota-devolucion">Nota de devolución</Label>
              <Textarea
                id="reembolso-nota-devolucion"
                value={notaDevolucion}
                onChange={(e) => setNotaDevolucion(e.target.value)}
                placeholder="Contexto de la devolución que le sirva a quien confirme el depósito."
              />
            </div>
          </div>
        )}

        {resultado === "No procede" && caso.tipoCaso === "reembolso" && (
          <div className="space-y-1.5">
            <Label htmlFor="reembolso-motivo-rechazo" required>
              Motivo de rechazo de reembolso
            </Label>
            <Textarea
              id="reembolso-motivo-rechazo"
              value={motivoRechazoReembolso}
              onChange={(e) => setMotivoRechazoReembolso(e.target.value)}
              placeholder="¿Por qué no procede el reembolso?"
            />
          </div>
        )}

        {resultado !== "" && resultado !== "No procede" && (
          <GestionFields
            idPrefix="decision-cierre"
            fecha={fecha}
            setFecha={setFecha}
            tipo={tipoGestion === "nuevo-cobro" ? undefined : tipoGestion}
          />
        )}
      </div>
    </AppDialog>
  );
}
