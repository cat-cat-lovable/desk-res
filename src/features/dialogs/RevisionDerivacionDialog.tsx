import * as React from "react";

import { AppDialog } from "@/shared/components/base/AppDialog";
import { Checkbox } from "@/shared/components/base/Checkbox";
import { DatePicker } from "@/shared/components/base/DatePicker";
import { Input } from "@/shared/components/base/Input";
import { Label } from "@/shared/components/base/Label";
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
import { dateToIso, isoToDate, normalizarMonto } from "@/shared/lib/utils/format";
import { tipoGestionDeCaso } from "@/shared/lib/utils/plazos";
import { type Caso, type ServicioDerivacion, SERVICIOS_DERIVACION } from "@/shared/types/caso";

import { GestionFields } from "./GestionFields";

export interface RevisionDerivacionDialogProps {
  caso: Caso | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function SeccionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="type-meta font-medium uppercase tracking-wide text-muted-foreground">
      {children}
    </p>
  );
}

/**
 * Reevaluación · motivo "Cambio de servicio": "Resolver" va directo acá —no
 * pasa por las 3 opciones genéricas de `DecisionCierreDialog`, porque el
 * caso ya nació como una posible derivación a otro servicio— y va directo
 * al Acta de derivación, sin preguntar antes si el cliente aprueba o
 * rechaza: el capitán que deriva llena el acta completa (incluida la marca
 * de si el caso requiere un nuevo cobro en Apio) y el caso pasa a
 * `pasoDerivacion = "recepcion"`. De ahí en adelante decide el capitán
 * receptor, viendo esta misma acta (`RecepcionDerivacionDialog`).
 */
export function RevisionDerivacionDialog({
  caso,
  open,
  onOpenChange,
  onSaved,
}: RevisionDerivacionDialogProps) {
  const [servicioDestino, setServicioDestino] = React.useState<ServicioDerivacion | "">("");
  const [acreedores, setAcreedores] = React.useState("");
  const [montoDeuda, setMontoDeuda] = React.useState("");
  const [situacionTributaria, setSituacionTributaria] = React.useState("");
  const [demanda, setDemanda] = React.useState(false);
  const [bienes, setBienes] = React.useState("");
  const [prenda, setPrenda] = React.useState(false);
  const [hipotecario, setHipotecario] = React.useState(false);
  const [pensionAlimentos, setPensionAlimentos] = React.useState(false);
  const [sociedades, setSociedades] = React.useState(false);
  const [otrosDatosImportantes, setOtrosDatosImportantes] = React.useState("");
  const [resumen, setResumen] = React.useState("");
  const [compromisos, setCompromisos] = React.useState("");
  const [fechaPagoPrimeraCuota, setFechaPagoPrimeraCuota] = React.useState("");
  const [requiereNuevoCobro, setRequiereNuevoCobro] = React.useState(false);
  const { fecha, setFecha } = useGestionDefaults(caso, open);

  useResetOnOpen(open && caso ? caso.id : null, () => {
    setServicioDestino(caso?.servicioDestino ?? SERVICIOS_DERIVACION[0]);
    setAcreedores("BCI, Santander, Itaú.");
    setMontoDeuda("");
    setSituacionTributaria("Segunda categoría.");
    setDemanda(false);
    setBienes("");
    setPrenda(false);
    setHipotecario(false);
    setPensionAlimentos(false);
    setSociedades(false);
    setOtrosDatosImportantes("");
    setResumen("Historial del caso, por qué se deriva, contexto de prueba de la conversación.");
    setCompromisos("El cliente se compromete a mantener los pagos al día en el nuevo servicio.");
    setFechaPagoPrimeraCuota("");
    setRequiereNuevoCobro(false);
  });

  if (!caso) return null;

  const tipoGestion = tipoGestionDeCaso(caso);
  const puedeConfirmar =
    servicioDestino !== "" && acreedores.trim() !== "" && resumen.trim() !== "";

  const handleConfirm = async () => {
    const base = { fechaGestion: fecha || caso.fechaGestion };

    await actualizarCaso(
      caso.id,
      {
        ...base,
        resultado: "Derivación a otro servicio",
        servicioDestino: servicioDestino || undefined,
        evaluacionCliente: { estado: "aceptada" },
        actaDerivacion: {
          abogadoVendedor: caso.abogadoVendedor,
          acreedores,
          montoDeuda: normalizarMonto(montoDeuda),
          situacionTributaria,
          demandas: demanda ? "Sí" : "",
          bienes,
          prendas: prenda ? "Sí" : "",
          hipotecario: hipotecario ? "Sí" : "",
          pensionAlimentos: pensionAlimentos ? "Sí" : "",
          sociedades: sociedades ? "Sí" : "",
          otrosDatosImportantes: otrosDatosImportantes || undefined,
          resumen,
          compromisos: compromisos || undefined,
          fechaPagoPrimeraCuota: fechaPagoPrimeraCuota || undefined,
        },
        requiereNuevoCobro,
        nuevoCobro: requiereNuevoCobro
          ? { estado: "pendiente", aplica: true }
          : { estado: "no-aplica", aplica: false },
        pasoDerivacion: "recepcion",
        estadoProceso: "en-evaluacion",
        cerrado: false,
      },
      "decisionCierreResuelta",
      {
        description: "El cliente acepta evaluar la derivación: se completa el acta",
        trigger: "Diálogo de revisión de derivación",
        fields: [
          "resultado",
          "servicioDestino",
          "evaluacionCliente",
          "actaDerivacion",
          "requiereNuevoCobro",
          "nuevoCobro",
          "pasoDerivacion",
          "estadoProceso",
        ],
      },
    );
    toast.success("Acta guardada: a la espera del capitán receptor", {
      description: `Caso de ${caso.cliente.nombre}`,
    });
    onSaved();
  };

  return (
    <AppDialog
      trigger={<span className="hidden" />}
      open={open}
      onOpenChange={onOpenChange}
      title="Acta de derivación"
      description={`Caso de ${caso.cliente.nombre}`}
      confirmLabel="Guardar acta"
      confirmDisabled={!puedeConfirmar}
      onConfirm={handleConfirm}
      className="sm:max-w-lg"
    >
      <div className="space-y-4">
        <SeccionLabel>Identificación</SeccionLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="acta-cliente">Cliente</Label>
            <Input id="acta-cliente" value={caso.cliente.nombre} disabled />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="acta-correo">Correo</Label>
            <Input id="acta-correo" value={caso.cliente.correo} disabled />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="acta-servicio-origen">Servicio origen</Label>
            <Input id="acta-servicio-origen" value={caso.servicio} disabled />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="acta-servicio-destino" required>
              Servicio destino
            </Label>
            <Select
              value={servicioDestino}
              onValueChange={(v) => setServicioDestino(v as ServicioDerivacion)}
            >
              <SelectTrigger id="acta-servicio-destino">
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
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="acta-abogado-vendedor">Abogado/a vendedor/a</Label>
          <Input id="acta-abogado-vendedor" value={caso.abogadoVendedor} disabled />
        </div>

        <Separator />
        <SeccionLabel>Antecedentes</SeccionLabel>
        <div className="space-y-1.5">
          <Label htmlFor="acta-acreedores" required>
            Acreedores
          </Label>
          <Textarea
            id="acta-acreedores"
            value={acreedores}
            onChange={(e) => setAcreedores(e.target.value)}
            placeholder="BCI, Santander, Itaú..."
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="acta-monto-deuda">Monto total adeudado</Label>
            <Input
              id="acta-monto-deuda"
              inputMode="numeric"
              value={montoDeuda}
              onChange={(e) => setMontoDeuda(e.target.value)}
              placeholder="$0"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="acta-situacion-tributaria">Situación tributaria</Label>
            <Input
              id="acta-situacion-tributaria"
              value={situacionTributaria}
              onChange={(e) => setSituacionTributaria(e.target.value)}
              placeholder="Segunda categoría..."
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="acta-demanda"
            checked={demanda}
            onCheckedChange={(v) => setDemanda(v === true)}
          />
          <Label htmlFor="acta-demanda">Demanda</Label>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="acta-bienes">Bienes</Label>
          <Textarea
            id="acta-bienes"
            value={bienes}
            onChange={(e) => setBienes(e.target.value)}
            placeholder="TV, vehículo, inmueble... (indicar si están pagados)"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="acta-prenda"
              checked={prenda}
              onCheckedChange={(v) => setPrenda(v === true)}
            />
            <Label htmlFor="acta-prenda">Prenda</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="acta-hipotecario"
              checked={hipotecario}
              onCheckedChange={(v) => setHipotecario(v === true)}
            />
            <Label htmlFor="acta-hipotecario">Hipotecario</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="acta-pension-alimentos"
              checked={pensionAlimentos}
              onCheckedChange={(v) => setPensionAlimentos(v === true)}
            />
            <Label htmlFor="acta-pension-alimentos">Pensión de alimentos</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="acta-sociedades"
              checked={sociedades}
              onCheckedChange={(v) => setSociedades(v === true)}
            />
            <Label htmlFor="acta-sociedades">Participación en sociedades</Label>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="acta-otros-datos">Otros datos importantes</Label>
          <Textarea
            id="acta-otros-datos"
            value={otrosDatosImportantes}
            onChange={(e) => setOtrosDatosImportantes(e.target.value)}
            placeholder="Finiquito, cuenta de ahorro, tramo de sueldo, herencia..."
          />
        </div>

        <Separator />
        <SeccionLabel>Relato</SeccionLabel>
        <div className="space-y-1.5">
          <Label htmlFor="acta-resumen" required>
            Resumen de lo sucedido
          </Label>
          <Textarea
            id="acta-resumen"
            value={resumen}
            onChange={(e) => setResumen(e.target.value)}
            placeholder="Historial del caso, por qué se deriva, contexto de la conversación con el cliente..."
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="acta-compromisos">Compromisos y próximos pasos</Label>
          <Textarea
            id="acta-compromisos"
            value={compromisos}
            onChange={(e) => setCompromisos(e.target.value)}
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
            value={isoToDate(fechaPagoPrimeraCuota)}
            onChange={(d) => setFechaPagoPrimeraCuota(dateToIso(d))}
          />
        </div>

        <Separator />
        <div className="flex items-center gap-2">
          <Checkbox
            id="acta-requiere-nuevo-cobro"
            checked={requiereNuevoCobro}
            onCheckedChange={(v) => setRequiereNuevoCobro(v === true)}
          />
          <Label htmlFor="acta-requiere-nuevo-cobro">Requiere nuevo cobro</Label>
        </div>

        <GestionFields
          idPrefix="revision-derivacion"
          fecha={fecha}
          setFecha={setFecha}
          tipo={tipoGestion === "nuevo-cobro" ? undefined : tipoGestion}
        />
      </div>
    </AppDialog>
  );
}
