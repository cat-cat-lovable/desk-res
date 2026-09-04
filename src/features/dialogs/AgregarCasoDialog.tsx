import { Upload, X } from "lucide-react";
import * as React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/base/Accordion";
import { AppDialog } from "@/shared/components/base/AppDialog";
import { Button } from "@/shared/components/base/Button";
import { Checkbox } from "@/shared/components/base/Checkbox";
import { DatePicker } from "@/shared/components/base/DatePicker";
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
import { Tag } from "@/shared/components/base/Tag";
import { Textarea } from "@/shared/components/base/Textarea";
import { toast } from "@/shared/components/base/Toaster";
import { useResetOnOpen } from "@/shared/hooks/useResetOnOpen";
import { TIPO_CASO_LABEL, TIPO_CASO_TONE } from "@/shared/lib/caso-helpers";
import { crearCaso } from "@/shared/lib/caso-write";
import { cn } from "@/shared/lib/utils/cn";
import {
  ACREEDOR_PRUEBA,
  COBRO_ANTERIOR_PRUEBA,
  CUENTA_PRUEBA,
  CUOTAS_NUEVO_CONTRATO_PRUEBA,
  MONTO_NUEVO_CONTRATO_PRUEBA,
  VALOR_PRIMERA_CUOTA_PRUEBA,
} from "@/shared/lib/utils/datosPrueba";
import { archivoADocumento } from "@/shared/lib/utils/documentos";
import {
  dateToIso,
  formatFechaCorta,
  formatMonto,
  hoyIso,
  isoToDate,
  normalizarMonto,
} from "@/shared/lib/utils/format";
import { fechaSugerida, tipoGestionDeCaso } from "@/shared/lib/utils/plazos";
import {
  type Caso,
  type MotivoModificacionContrato,
  type MotivoPosibleBaja,
  type MotivoReevaluacion,
  MOTIVOS_MODIFICACION_CONTRATO,
  MOTIVOS_POSIBLE_BAJA,
  MOTIVOS_REEVALUACION,
  ORIGENES_POSIBLE_BAJA,
  type OrigenPosibleBaja,
  type ServicioDerivacion,
  SERVICIOS,
  SERVICIOS_DERIVACION,
  type TipoCaso,
} from "@/shared/types/caso";

import { GestionFields } from "./GestionFields";

export interface AgregarCasoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

type Paso = "tipo" | "correo" | "formulario";

const TIPOS_NUEVO_CASO: {
  value: TipoCaso;
  titulo: string;
  descripcion: string;
  dot: string;
}[] = [
  {
    value: "reevaluacion",
    titulo: "Reevaluación de continuidad",
    descripcion:
      "El caso necesita ser revisado: puede ser un posible mal vendido, una posible baja o una derivación a otro servicio.",
    dot: "bg-primary",
  },
  {
    value: "reembolso",
    titulo: "Solicitud de reembolso",
    descripcion:
      "El cliente solicita una devolución de dinero. La capitana determinará si corresponde o no.",
    dot: "bg-warning",
  },
  {
    value: "modificacion-contrato",
    titulo: "Modificación de contrato",
    descripcion: "El contrato del cliente debe modificarse: agregar un nuevo acreedor u otros.",
    dot: "bg-success",
  },
];

// Placeholders que representan el TIPO de dato que va a traer el scrapeo de
// caja post-venta (§10 readme-logica-res.md: hoy no está implementado). No
// son datos ficticios con nombre: describen qué dato correspondería mostrar
// ahí una vez que el scraper real esté conectado.
const NOMBRE_PLACEHOLDER = "[nombre de cliente]";
const ID_DEFENSORIA_PLACEHOLDER = "[ID Defensoría]";
const SERVICIO_PLACEHOLDER = "[servicio actual]";
const ETAPA_PLACEHOLDER = "[etapa en Streak]";
const ABOGADO_CARGO_PLACEHOLDER = "[abogado a cargo]";
const ABOGADO_VENDEDOR_PLACEHOLDER = "[abogado vendedor]";
const DESCRIPCION_VENTAS_PLACEHOLDER =
  "[resumen de la caja post-venta: fecha de contratación, deuda total, cantidad de acreedores, duración estimada del proceso]";
const ESTRATEGIA_PLACEHOLDER = "[estrategia sugerida]";
const TACTICAS_PLACEHOLDER = "[tácticas sugeridas]";

function CampoPreview({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border border-border-subtle bg-background px-2.5 py-1.5">
      <p className="type-supporting font-semibold text-foreground">{label}</p>
      <p className="type-meta truncate text-muted-foreground">{value}</p>
    </div>
  );
}

function SeccionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="type-meta font-medium uppercase tracking-wide text-muted-foreground">
      {children}
    </p>
  );
}

const CORREO_VALIDO = /\S+@\S+\.\S+/;

export function AgregarCasoDialog({ open, onOpenChange, onSaved }: AgregarCasoDialogProps) {
  const [paso, setPaso] = React.useState<Paso>("tipo");
  const [tipoCaso, setTipoCaso] = React.useState<TipoCaso | null>(null);
  const [correo, setCorreo] = React.useState("");
  const [buscando, setBuscando] = React.useState(false);
  const [motivo, setMotivo] = React.useState<MotivoReevaluacion | "">("");
  const [origenPosibleBaja, setOrigenPosibleBaja] = React.useState<OrigenPosibleBaja | "">("");
  const [motivoPosibleBaja, setMotivoPosibleBaja] = React.useState<MotivoPosibleBaja | "">("");
  const [comentariosPosibleBaja, setComentariosPosibleBaja] = React.useState("");
  const [servicioDerivacionTentativo, setServicioDerivacionTentativo] = React.useState<
    ServicioDerivacion | ""
  >("");
  const [actaAcreedores, setActaAcreedores] = React.useState("");
  const [actaMontoDeuda, setActaMontoDeuda] = React.useState("");
  const [actaSituacionTributaria, setActaSituacionTributaria] = React.useState("");
  const [actaDemanda, setActaDemanda] = React.useState(false);
  const [actaBienes, setActaBienes] = React.useState("");
  const [actaPrenda, setActaPrenda] = React.useState(false);
  const [actaHipotecario, setActaHipotecario] = React.useState(false);
  const [actaPensionAlimentos, setActaPensionAlimentos] = React.useState(false);
  const [actaSociedades, setActaSociedades] = React.useState(false);
  const [actaOtrosDatosImportantes, setActaOtrosDatosImportantes] = React.useState("");
  const [actaResumen, setActaResumen] = React.useState("");
  const [actaCompromisos, setActaCompromisos] = React.useState("");
  const [actaFechaPagoPrimeraCuota, setActaFechaPagoPrimeraCuota] = React.useState("");
  const [actaHuboDerivacionAnterior, setActaHuboDerivacionAnterior] = React.useState(false);
  const [actaDerivacionAnteriorServicio, setActaDerivacionAnteriorServicio] = React.useState<
    ServicioDerivacion | ""
  >("");
  const [actaDerivacionAnteriorMotivo, setActaDerivacionAnteriorMotivo] = React.useState("");
  const [actaRequiereAnalisisModificacionContrato, setActaRequiereAnalisisModificacionContrato] =
    React.useState(false);
  const [motivoSolicitud, setMotivoSolicitud] = React.useState("");
  const [motivoModificacionContrato, setMotivoModificacionContrato] = React.useState<
    MotivoModificacionContrato | ""
  >("");
  const [nombreNuevoAcreedor, setNombreNuevoAcreedor] = React.useState("");
  const [montoNuevoContrato, setMontoNuevoContrato] = React.useState("");
  const [cuotasNuevoAcreedor, setCuotasNuevoAcreedor] = React.useState("");
  const [valorPrimeraCuota, setValorPrimeraCuota] = React.useState("");
  const [gestionesEquipo, setGestionesEquipo] = React.useState("");
  const [cuotasSolicitadas, setCuotasSolicitadas] = React.useState("");
  const [cuentaTitular, setCuentaTitular] = React.useState("");
  const [cuentaBanco, setCuentaBanco] = React.useState("");
  const [cuentaTipo, setCuentaTipo] = React.useState("");
  const [cuentaNumero, setCuentaNumero] = React.useState("");
  const [fecha, setFecha] = React.useState("");
  const [archivos, setArchivos] = React.useState<File[]>([]);
  const inputArchivosRef = React.useRef<HTMLInputElement>(null);

  useResetOnOpen(open ? "nuevo-caso" : null, () => {
    setPaso("tipo");
    setTipoCaso(null);
    setCorreo("cliente.prueba@example.com");
    setBuscando(false);
    setMotivo(MOTIVOS_REEVALUACION[0]);
    setOrigenPosibleBaja(ORIGENES_POSIBLE_BAJA[0]);
    setMotivoPosibleBaja(MOTIVOS_POSIBLE_BAJA[0]);
    setComentariosPosibleBaja("Comentario de prueba para el flujo de posible baja.");
    setServicioDerivacionTentativo(SERVICIOS_DERIVACION[0]);
    setActaAcreedores("BCI, Santander, Itaú.");
    setActaMontoDeuda("");
    setActaSituacionTributaria("Segunda categoría.");
    setActaDemanda(false);
    setActaBienes("");
    setActaPrenda(false);
    setActaHipotecario(false);
    setActaPensionAlimentos(false);
    setActaSociedades(false);
    setActaOtrosDatosImportantes("");
    setActaResumen("Historial del caso, por qué se deriva, contexto de prueba de la conversación.");
    setActaHuboDerivacionAnterior(false);
    setActaDerivacionAnteriorServicio(SERVICIOS_DERIVACION[0]);
    setActaDerivacionAnteriorMotivo("Motivo de prueba de la derivación anterior, antes de esta.");
    setActaCompromisos(
      "El cliente se compromete a mantener los pagos al día en el nuevo servicio.",
    );
    setActaFechaPagoPrimeraCuota("");
    setActaRequiereAnalisisModificacionContrato(false);
    setMotivoSolicitud("Solicita reembolso por prueba de flujo.");
    setGestionesEquipo("Gestión registrada como prueba de flujo.");
    setMotivoModificacionContrato(MOTIVOS_MODIFICACION_CONTRATO[0]);
    setNombreNuevoAcreedor(ACREEDOR_PRUEBA);
    setMontoNuevoContrato(MONTO_NUEVO_CONTRATO_PRUEBA);
    setCuotasNuevoAcreedor(CUOTAS_NUEVO_CONTRATO_PRUEBA);
    setValorPrimeraCuota(VALOR_PRIMERA_CUOTA_PRUEBA);
    setCuotasSolicitadas("A discusión");
    setCuentaTitular(CUENTA_PRUEBA.titular);
    setCuentaBanco(CUENTA_PRUEBA.banco);
    setCuentaTipo(CUENTA_PRUEBA.tipo);
    setCuentaNumero(CUENTA_PRUEBA.numero);
    setFecha("");
    setArchivos([]);
  });

  const correoValido = CORREO_VALIDO.test(correo.trim());
  const tipoGestion = tipoCaso ? tipoGestionDeCaso({ tipoCaso } as Caso) : null;

  const handleSeleccionarTipo = (tipo: TipoCaso) => {
    setTipoCaso(tipo);
    const tipoGestion = tipoGestionDeCaso({ tipoCaso: tipo } as Caso);
    setFecha(tipoGestion === "nuevo-cobro" ? "" : fechaSugerida(tipoGestion));
    setCuotasSolicitadas(tipo === "reembolso" ? "A discusión" : "");
    setPaso("correo");
  };

  const agregarArchivos = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setArchivos((prev) => [...prev, ...Array.from(files)]);
  };

  const quitarArchivo = (index: number) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBuscar = () => {
    if (!correoValido) return;
    setBuscando(true);
    window.setTimeout(() => {
      setBuscando(false);
      setPaso("formulario");
    }, 700);
  };

  const puedeConfirmar =
    paso === "formulario" &&
    fecha !== "" &&
    (tipoCaso !== "reevaluacion" || motivo !== "") &&
    (motivo !== "Posible baja" || (origenPosibleBaja !== "" && motivoPosibleBaja !== "")) &&
    (motivo !== "Cambio de servicio" ||
      (servicioDerivacionTentativo !== "" &&
        actaAcreedores.trim() !== "" &&
        actaResumen.trim() !== "" &&
        (!actaHuboDerivacionAnterior ||
          (actaDerivacionAnteriorServicio !== "" &&
            actaDerivacionAnteriorMotivo.trim() !== "")))) &&
    (tipoCaso !== "reembolso" || motivoSolicitud !== "") &&
    (tipoCaso !== "modificacion-contrato" || motivoModificacionContrato !== "") &&
    (motivoModificacionContrato !== "Agregar nuevo acreedor" ||
      (nombreNuevoAcreedor.trim() !== "" &&
        montoNuevoContrato !== "" &&
        cuotasNuevoAcreedor !== "" &&
        valorPrimeraCuota !== ""));

  const esPosibleBaja = tipoCaso === "reevaluacion" && motivo === "Posible baja";
  const esCambioServicio = tipoCaso === "reevaluacion" && motivo === "Cambio de servicio";

  const handleConfirm = async () => {
    if (!tipoCaso) return false;
    const nuevoCaso: Omit<Caso, "id"> = {
      tipoCaso,
      estadoProceso: esCambioServicio ? "en-evaluacion" : "por-evaluar",
      cliente: {
        nombre: NOMBRE_PLACEHOLDER,
        correo,
        telefono: "",
        idDefensoria: ID_DEFENSORIA_PLACEHOLDER,
      },
      abogadoTramitador: ABOGADO_CARGO_PLACEHOLDER,
      abogadoVendedor: ABOGADO_VENDEDOR_PLACEHOLDER,
      capitanACargo: esPosibleBaja ? "Líder de operaciones" : "",
      servicio: SERVICIOS[0],
      etapaStreak: ETAPA_PLACEHOLDER,
      motivo: tipoCaso === "reevaluacion" && motivo !== "" ? motivo : undefined,
      origenPosibleBaja: esPosibleBaja && origenPosibleBaja !== "" ? origenPosibleBaja : undefined,
      motivoPosibleBaja: esPosibleBaja && motivoPosibleBaja !== "" ? motivoPosibleBaja : undefined,
      comentariosPosibleBaja: esPosibleBaja ? comentariosPosibleBaja || undefined : undefined,
      servicioDestino:
        esCambioServicio && servicioDerivacionTentativo !== ""
          ? servicioDerivacionTentativo
          : undefined,
      resultado: esCambioServicio ? "Derivación a otro servicio" : undefined,
      evaluacionCliente: esCambioServicio ? { estado: "aceptada" } : undefined,
      pasoDerivacion: esCambioServicio ? "recepcion" : undefined,
      requiereAnalisisModificacionContrato: esCambioServicio
        ? actaRequiereAnalisisModificacionContrato
        : undefined,
      nuevoCobro: esCambioServicio
        ? actaRequiereAnalisisModificacionContrato
          ? { estado: "pendiente", aplica: true }
          : { estado: "no-aplica", aplica: false }
        : undefined,
      actaDerivacion: esCambioServicio
        ? {
            abogadoVendedor: ABOGADO_VENDEDOR_PLACEHOLDER,
            acreedores: actaAcreedores,
            montoDeuda: normalizarMonto(actaMontoDeuda),
            situacionTributaria: actaSituacionTributaria,
            demandas: actaDemanda ? "Sí" : "",
            bienes: actaBienes,
            prendas: actaPrenda ? "Sí" : "",
            hipotecario: actaHipotecario ? "Sí" : "",
            pensionAlimentos: actaPensionAlimentos ? "Sí" : "",
            sociedades: actaSociedades ? "Sí" : "",
            otrosDatosImportantes: actaOtrosDatosImportantes || undefined,
            resumen: actaResumen,
            compromisos: actaCompromisos || undefined,
            fechaPagoPrimeraCuota: actaFechaPagoPrimeraCuota || undefined,
            huboDerivacionAnterior: actaHuboDerivacionAnterior,
            derivacionAnteriorServicio: actaHuboDerivacionAnterior
              ? actaDerivacionAnteriorServicio || undefined
              : undefined,
            derivacionAnteriorMotivo: actaHuboDerivacionAnterior
              ? actaDerivacionAnteriorMotivo || undefined
              : undefined,
          }
        : undefined,
      motivoSolicitud: tipoCaso === "reembolso" ? motivoSolicitud : undefined,
      gestionesEquipo: tipoCaso === "reembolso" ? gestionesEquipo : undefined,
      cuotasSolicitadas: tipoCaso === "reembolso" ? cuotasSolicitadas || undefined : undefined,
      cuentaTitular: tipoCaso === "reembolso" ? cuentaTitular || undefined : undefined,
      cuentaBanco: tipoCaso === "reembolso" ? cuentaBanco || undefined : undefined,
      cuentaTipo: tipoCaso === "reembolso" ? cuentaTipo || undefined : undefined,
      cuentaNumero: tipoCaso === "reembolso" ? cuentaNumero || undefined : undefined,
      motivoModificacionContrato:
        tipoCaso === "modificacion-contrato" ? motivoModificacionContrato || undefined : undefined,
      acreedor:
        motivoModificacionContrato === "Agregar nuevo acreedor"
          ? {
              nombre: nombreNuevoAcreedor.trim(),
              montoContratoActual: normalizarMonto(montoNuevoContrato),
              cuotas: Number(cuotasNuevoAcreedor),
              valorPrimeraCuota: normalizarMonto(valorPrimeraCuota),
            }
          : undefined,
      descripcionVentas: DESCRIPCION_VENTAS_PLACEHOLDER,
      estrategia: ESTRATEGIA_PLACEHOLDER,
      tacticas: TACTICAS_PLACEHOLDER,
      cobroAnterior: COBRO_ANTERIOR_PRUEBA,
      documentos: archivos.length > 0 ? archivos.map(archivoADocumento) : undefined,
      fechaGestion: fecha,
      cerrado: false,
      fechaRegistro: hoyIso(),
    };
    await crearCaso(nuevoCaso, "casoCreado", {
      description: "Se registra un nuevo caso en el Desk ReS",
      trigger: "Botón «+ Nuevo caso»",
      fields: [
        "tipoCaso",
        "estadoProceso",
        "cliente",
        "servicio",
        "motivo",
        "origenPosibleBaja",
        "motivoPosibleBaja",
        "comentariosPosibleBaja",
        "servicioDestino",
        "resultado",
        "evaluacionCliente",
        "pasoDerivacion",
        "requiereAnalisisModificacionContrato",
        "nuevoCobro",
        "actaDerivacion",
        "motivoModificacionContrato",
        "acreedor",
        "descripcionVentas",
        "estrategia",
        "tacticas",
        "cobroAnterior",
        "fechaGestion",
        "capitanACargo",
      ],
    });
    toast.success("Caso creado", { description: `Caso de ${correo}` });
    onSaved();
  };

  return (
    <AppDialog
      trigger={<span className="hidden" />}
      open={open}
      onOpenChange={onOpenChange}
      title="Nuevo caso"
      description={paso === "tipo" ? "El tipo define cómo se resuelve el caso." : undefined}
      className="sm:max-w-lg"
      hideFooter={paso === "tipo"}
      confirmLabel="Crear caso"
      confirmDisabled={!puedeConfirmar}
      onConfirm={handleConfirm}
    >
      {paso === "tipo" && (
        <div className="space-y-4">
          <div className="space-y-3">
            {TIPOS_NUEVO_CASO.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => handleSeleccionarTipo(t.value)}
                className="flex w-full items-start gap-3 rounded-lg border border-border p-4 text-left transition-colors hover:border-primary/40 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", t.dot)}
                  aria-hidden="true"
                />
                <span className="space-y-0.5">
                  <span className="block type-item-title text-foreground">{t.titulo}</span>
                  <span className="block type-supporting text-muted-foreground">
                    {t.descripcion}
                  </span>
                </span>
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {paso !== "tipo" && tipoCaso && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Tag tone={TIPO_CASO_TONE[tipoCaso]} shape="rounded">
              {TIPO_CASO_LABEL[tipoCaso]}
            </Tag>
          </div>

          {paso === "correo" ? (
            <div className="space-y-1.5">
              <Label htmlFor="nuevo-caso-correo" required>
                Correo del cliente
              </Label>
              <div className="flex gap-2">
                <Input
                  id="nuevo-caso-correo"
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="cliente@correo.cl"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  loading={buscando}
                  loadingLabel="Buscando…"
                  disabled={!correoValido}
                  onClick={handleBuscar}
                >
                  Buscar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="nuevo-caso-correo-encontrado">Correo del cliente</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="nuevo-caso-correo-encontrado"
                    value={correo}
                    disabled
                    className="flex-1"
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => setPaso("correo")}>
                    Cambiar
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nuevo-caso-id-defensoria">ID Defensoría</Label>
                <Input id="nuevo-caso-id-defensoria" value={ID_DEFENSORIA_PLACEHOLDER} disabled />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nuevo-caso-nombre">Nombre del cliente</Label>
                <Input id="nuevo-caso-nombre" value={NOMBRE_PLACEHOLDER} disabled />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="nuevo-caso-servicio">Servicio actual</Label>
                  <Input id="nuevo-caso-servicio" value={SERVICIO_PLACEHOLDER} disabled />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nuevo-caso-etapa">Etapa</Label>
                  <Input id="nuevo-caso-etapa" value={ETAPA_PLACEHOLDER} disabled />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="nuevo-caso-abogado-cargo">Abogado a cargo</Label>
                  <Input id="nuevo-caso-abogado-cargo" value={ABOGADO_CARGO_PLACEHOLDER} disabled />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nuevo-caso-abogado-vendedor">Abogado vendedor</Label>
                  <Input
                    id="nuevo-caso-abogado-vendedor"
                    value={ABOGADO_VENDEDOR_PLACEHOLDER}
                    disabled
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="nuevo-caso-estrategia">Estrategia</Label>
                  <Input id="nuevo-caso-estrategia" value={ESTRATEGIA_PLACEHOLDER} disabled />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nuevo-caso-tacticas">Tácticas</Label>
                  <Input id="nuevo-caso-tacticas" value={TACTICAS_PLACEHOLDER} disabled />
                </div>
              </div>

              <div className="rounded-control bg-muted p-3">
                <p className="type-meta font-medium uppercase tracking-wide text-muted-foreground">
                  Descripción del caso
                </p>
                <p className="mt-1 type-supporting text-foreground">
                  {DESCRIPCION_VENTAS_PLACEHOLDER}
                </p>
              </div>

              <Accordion
                type="single"
                collapsible
                className="rounded-control border border-border-subtle bg-muted/40"
              >
                <AccordionItem value="cobro-anterior" className="border-none px-3">
                  <AccordionTrigger className="type-meta font-medium uppercase tracking-wide text-muted-foreground hover:no-underline">
                    Cobro anterior (post-venta)
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      <CampoPreview
                        label="Valor contrato"
                        value={formatMonto(COBRO_ANTERIOR_PRUEBA.montoTotal)}
                      />
                      <CampoPreview
                        label="N.º de cuotas"
                        value={String(COBRO_ANTERIOR_PRUEBA.cuotas)}
                      />
                      <CampoPreview
                        label="Valor cuota"
                        value={formatMonto(COBRO_ANTERIOR_PRUEBA.montoPrimeraCuota)}
                      />
                      <CampoPreview
                        label="Fecha cuota"
                        value={formatFechaCorta(COBRO_ANTERIOR_PRUEBA.fechaInicio)}
                      />
                      <CampoPreview
                        label="Estado pago"
                        value={COBRO_ANTERIOR_PRUEBA.pagoPrimeraCuota}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {tipoCaso === "reevaluacion" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="nuevo-caso-motivo" required>
                      Motivo inicial (hipótesis)
                    </Label>
                    <Select
                      value={motivo}
                      onValueChange={(v) => setMotivo(v as MotivoReevaluacion)}
                    >
                      <SelectTrigger id="nuevo-caso-motivo">
                        <SelectValue placeholder="Selecciona una hipótesis" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOTIVOS_REEVALUACION.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {esPosibleBaja && (
                    <div className="space-y-4">
                      <p className="type-meta text-muted-foreground">
                        El caso queda elevado directo a la líder de operaciones.
                      </p>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="nuevo-caso-origen-baja" required>
                            Origen
                          </Label>
                          <Select
                            value={origenPosibleBaja}
                            onValueChange={(v) => setOrigenPosibleBaja(v as OrigenPosibleBaja)}
                          >
                            <SelectTrigger id="nuevo-caso-origen-baja">
                              <SelectValue placeholder="Selecciona origen" />
                            </SelectTrigger>
                            <SelectContent>
                              {ORIGENES_POSIBLE_BAJA.map((o) => (
                                <SelectItem key={o} value={o}>
                                  {o}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="nuevo-caso-motivo-baja" required>
                            Motivo
                          </Label>
                          <Select
                            value={motivoPosibleBaja}
                            onValueChange={(v) => setMotivoPosibleBaja(v as MotivoPosibleBaja)}
                          >
                            <SelectTrigger id="nuevo-caso-motivo-baja">
                              <SelectValue placeholder="Selecciona motivo" />
                            </SelectTrigger>
                            <SelectContent>
                              {MOTIVOS_POSIBLE_BAJA.map((m) => (
                                <SelectItem key={m} value={m}>
                                  {m}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="nuevo-caso-comentarios-baja">Comentarios</Label>
                        <Textarea
                          id="nuevo-caso-comentarios-baja"
                          value={comentariosPosibleBaja}
                          onChange={(e) => setComentariosPosibleBaja(e.target.value)}
                          placeholder="Contexto adicional para la líder de operaciones."
                        />
                      </div>
                    </div>
                  )}

                  {esCambioServicio && (
                    <div className="space-y-4">
                      <p className="type-meta text-muted-foreground">
                        El caso queda a la espera de que el capitán del equipo receptor apruebe o
                        rechace la recepción, en base al acta de derivación.
                      </p>

                      <div className="space-y-1.5">
                        <Label htmlFor="nuevo-caso-servicio-derivacion" required>
                          Servicio destino
                        </Label>
                        <Select
                          value={servicioDerivacionTentativo}
                          onValueChange={(v) =>
                            setServicioDerivacionTentativo(v as ServicioDerivacion)
                          }
                        >
                          <SelectTrigger id="nuevo-caso-servicio-derivacion">
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
                        <Label>Derivaciones realizadas</Label>
                        <RadioGroup
                          value={actaHuboDerivacionAnterior ? "si" : "ninguna"}
                          onValueChange={(v) => setActaHuboDerivacionAnterior(v === "si")}
                          className="gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="ninguna" id="deriv-anterior-ninguna" />
                            <Label htmlFor="deriv-anterior-ninguna">Ninguna</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="si" id="deriv-anterior-si" />
                            <Label htmlFor="deriv-anterior-si">Ha sido derivado antes</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      {actaHuboDerivacionAnterior && (
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="deriv-anterior-servicio" required>
                              Servicio de la derivación anterior
                            </Label>
                            <Select
                              value={actaDerivacionAnteriorServicio}
                              onValueChange={(v) =>
                                setActaDerivacionAnteriorServicio(v as ServicioDerivacion)
                              }
                            >
                              <SelectTrigger id="deriv-anterior-servicio">
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
                            <Label htmlFor="deriv-anterior-motivo" required>
                              Motivo de la derivación anterior
                            </Label>
                            <Textarea
                              id="deriv-anterior-motivo"
                              value={actaDerivacionAnteriorMotivo}
                              onChange={(e) => setActaDerivacionAnteriorMotivo(e.target.value)}
                              placeholder="¿Por qué se derivó antes?"
                            />
                          </div>
                        </div>
                      )}

                      <Separator />
                      <SeccionLabel>Acta de derivación — Antecedentes</SeccionLabel>
                      <div className="space-y-1.5">
                        <Label htmlFor="acta-acreedores" required>
                          Acreedores
                        </Label>
                        <Textarea
                          id="acta-acreedores"
                          value={actaAcreedores}
                          onChange={(e) => setActaAcreedores(e.target.value)}
                          placeholder="BCI, Santander, Itaú..."
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="acta-monto-deuda">Monto total adeudado</Label>
                          <Input
                            id="acta-monto-deuda"
                            inputMode="numeric"
                            value={actaMontoDeuda}
                            onChange={(e) => setActaMontoDeuda(e.target.value)}
                            placeholder="$0"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="acta-situacion-tributaria">Situación tributaria</Label>
                          <Input
                            id="acta-situacion-tributaria"
                            value={actaSituacionTributaria}
                            onChange={(e) => setActaSituacionTributaria(e.target.value)}
                            placeholder="Segunda categoría..."
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="acta-demanda"
                          checked={actaDemanda}
                          onCheckedChange={(v) => setActaDemanda(v === true)}
                        />
                        <Label htmlFor="acta-demanda">Demanda</Label>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="acta-bienes">Bienes</Label>
                        <Textarea
                          id="acta-bienes"
                          value={actaBienes}
                          onChange={(e) => setActaBienes(e.target.value)}
                          placeholder="TV, vehículo, inmueble... (indicar si están pagados)"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="acta-prenda"
                            checked={actaPrenda}
                            onCheckedChange={(v) => setActaPrenda(v === true)}
                          />
                          <Label htmlFor="acta-prenda">Prenda</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="acta-hipotecario"
                            checked={actaHipotecario}
                            onCheckedChange={(v) => setActaHipotecario(v === true)}
                          />
                          <Label htmlFor="acta-hipotecario">Hipotecario</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="acta-pension-alimentos"
                            checked={actaPensionAlimentos}
                            onCheckedChange={(v) => setActaPensionAlimentos(v === true)}
                          />
                          <Label htmlFor="acta-pension-alimentos">Pensión de alimentos</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="acta-sociedades"
                            checked={actaSociedades}
                            onCheckedChange={(v) => setActaSociedades(v === true)}
                          />
                          <Label htmlFor="acta-sociedades">Participación en sociedades</Label>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="acta-otros-datos">Otros datos importantes</Label>
                        <Textarea
                          id="acta-otros-datos"
                          value={actaOtrosDatosImportantes}
                          onChange={(e) => setActaOtrosDatosImportantes(e.target.value)}
                          placeholder="Finiquito, cuenta de ahorro, tramo de sueldo, herencia..."
                        />
                      </div>

                      <Separator />
                      <SeccionLabel>Acta de derivación — Relato</SeccionLabel>
                      <div className="space-y-1.5">
                        <Label htmlFor="acta-resumen" required>
                          Resumen de lo sucedido
                        </Label>
                        <Textarea
                          id="acta-resumen"
                          value={actaResumen}
                          onChange={(e) => setActaResumen(e.target.value)}
                          placeholder="Historial del caso, por qué se deriva (motivo del cambio de servicio), contexto de la conversación con el cliente..."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="acta-compromisos">Compromisos y próximos pasos</Label>
                        <Textarea
                          id="acta-compromisos"
                          value={actaCompromisos}
                          onChange={(e) => setActaCompromisos(e.target.value)}
                          placeholder="Qué se comprometió el cliente, qué sigue después de la derivación..."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="acta-fecha-primera-cuota">
                          Fecha acordada con el cliente para el pago de la 1° cuota
                        </Label>
                        <DatePicker
                          id="acta-fecha-primera-cuota"
                          className="w-full"
                          value={isoToDate(actaFechaPagoPrimeraCuota)}
                          onChange={(d) => setActaFechaPagoPrimeraCuota(dateToIso(d))}
                        />
                      </div>

                      <Separator />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="acta-requiere-analisis-modificacion-contrato"
                            checked={actaRequiereAnalisisModificacionContrato}
                            onCheckedChange={(v) =>
                              setActaRequiereAnalisisModificacionContrato(v === true)
                            }
                          />
                          <Label htmlFor="acta-requiere-analisis-modificacion-contrato">
                            Análisis modificación contrato
                          </Label>
                        </div>
                        <p className="type-meta pl-6 text-muted-foreground">
                          Marca esta opción solo cuando creas que el caso requiere modificación del
                          contrato.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tipoCaso === "modificacion-contrato" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="nuevo-caso-motivo-modificacion" required>
                      ¿Por qué se modifica el contrato?
                    </Label>
                    <Select
                      value={motivoModificacionContrato}
                      onValueChange={(v) =>
                        setMotivoModificacionContrato(v as MotivoModificacionContrato)
                      }
                    >
                      <SelectTrigger id="nuevo-caso-motivo-modificacion">
                        <SelectValue placeholder="Selecciona un motivo" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOTIVOS_MODIFICACION_CONTRATO.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {motivoModificacionContrato === "Agregar nuevo acreedor" && (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="nuevo-caso-nombre-acreedor" required>
                          Nombre del nuevo acreedor
                        </Label>
                        <Input
                          id="nuevo-caso-nombre-acreedor"
                          value={nombreNuevoAcreedor}
                          onChange={(e) => setNombreNuevoAcreedor(e.target.value)}
                          placeholder="Ej: CMR Falabella"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="nuevo-caso-monto-contrato" required>
                          Monto nuevo contrato
                        </Label>
                        <Input
                          id="nuevo-caso-monto-contrato"
                          inputMode="numeric"
                          value={montoNuevoContrato}
                          onChange={(e) => setMontoNuevoContrato(e.target.value)}
                          placeholder="$0"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="nuevo-caso-cuotas-acreedor" required>
                            Número de cuotas
                          </Label>
                          <Input
                            id="nuevo-caso-cuotas-acreedor"
                            inputMode="numeric"
                            value={cuotasNuevoAcreedor}
                            onChange={(e) => setCuotasNuevoAcreedor(e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="nuevo-caso-valor-primera-cuota" required>
                            Valor primera cuota
                          </Label>
                          <Input
                            id="nuevo-caso-valor-primera-cuota"
                            inputMode="numeric"
                            value={valorPrimeraCuota}
                            onChange={(e) => setValorPrimeraCuota(e.target.value)}
                            placeholder="$0"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tipoCaso === "reembolso" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="reembolso-motivo-solicitud" required>
                      Motivo de la solicitud
                    </Label>
                    <Textarea
                      id="reembolso-motivo-solicitud"
                      value={motivoSolicitud}
                      onChange={(e) => setMotivoSolicitud(e.target.value)}
                      placeholder="¿Por qué solicita el reembolso?"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reembolso-gestiones-equipo">Gestiones del equipo</Label>
                    <Textarea
                      id="reembolso-gestiones-equipo"
                      value={gestionesEquipo}
                      onChange={(e) => setGestionesEquipo(e.target.value)}
                      placeholder="Describe las gestiones realizadas que ponderan el monto a reembolsar..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reembolso-cuotas">Cuotas a reembolsar</Label>
                    <Input
                      id="reembolso-cuotas"
                      value={cuotasSolicitadas}
                      onChange={(e) => setCuotasSolicitadas(e.target.value)}
                      placeholder='Ej: "2 cuotas" o "A discusión"'
                    />
                  </div>
                  <div className="space-y-3">
                    <p className="type-meta font-medium uppercase tracking-wide text-muted-foreground">
                      Datos de cuenta para devolución
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Input
                        aria-label="Nombre titular"
                        placeholder="Nombre titular"
                        value={cuentaTitular}
                        onChange={(e) => setCuentaTitular(e.target.value)}
                      />
                      <Input
                        aria-label="Banco"
                        placeholder="Banco"
                        value={cuentaBanco}
                        onChange={(e) => setCuentaBanco(e.target.value)}
                      />
                      <Input
                        aria-label="Tipo de cuenta"
                        placeholder="Tipo de cuenta"
                        value={cuentaTipo}
                        onChange={(e) => setCuentaTipo(e.target.value)}
                      />
                      <Input
                        aria-label="Número de cuenta"
                        placeholder="Número de cuenta"
                        value={cuentaNumero}
                        onChange={(e) => setCuentaNumero(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              <GestionFields
                idPrefix="agregar-caso"
                fecha={fecha}
                setFecha={setFecha}
                tipo={tipoGestion && tipoGestion !== "nuevo-cobro" ? tipoGestion : undefined}
              />

              <div className="space-y-1.5">
                <Label htmlFor="agregar-caso-documentos">Documentos adjuntos (opcional)</Label>
                <input
                  ref={inputArchivosRef}
                  id="agregar-caso-documentos"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,image/*"
                  className="hidden"
                  onChange={(e) => {
                    agregarArchivos(e.target.files);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => inputArchivosRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-4 type-supporting text-muted-foreground transition-colors hover:border-border-strong hover:bg-accent/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <Upload className="size-(--icon-size-inline)" aria-hidden="true" />
                  Adjuntar PDF, Word o imagen
                </button>
                {archivos.length > 0 && (
                  <ul className="space-y-1 pt-1">
                    {archivos.map((archivo, i) => (
                      <li
                        key={`${archivo.name}-${i}`}
                        className="flex items-center justify-between gap-2 rounded-control bg-muted px-2.5 py-1.5"
                      >
                        <span className="truncate type-supporting text-foreground">
                          {archivo.name}
                        </span>
                        <button
                          type="button"
                          aria-label={`Quitar ${archivo.name}`}
                          onClick={() => quitarArchivo(i)}
                          className="shrink-0 rounded-control p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          <X className="size-(--icon-size-inline)" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </AppDialog>
  );
}
