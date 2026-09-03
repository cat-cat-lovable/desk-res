import { ListFilter, X } from "lucide-react";
import * as React from "react";

import { Accordion } from "@/shared/components/base/Accordion";
import { Badge } from "@/shared/components/base/Badge";
import { Button } from "@/shared/components/base/Button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/shared/components/base/Empty";
import { HeaderBar } from "@/shared/components/base/HeaderBar";
import { Logo } from "@/shared/components/base/Logo";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/base/Popover";
import { Searchbox } from "@/shared/components/base/Searchbox";
import { Spinner } from "@/shared/components/base/Spinner";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/base/Tabs";
import type { AccionPrincipal } from "@/shared/lib/caso-helpers";
import { coincideBusqueda } from "@/shared/lib/caso-helpers";
import { recargarCasos } from "@/shared/lib/caso-write";
import { cn } from "@/shared/lib/utils/cn";
import { type Caso, SERVICIOS, type TipoCaso } from "@/shared/types/caso";

import { CasoCard } from "./CasoCard";
import { AgregarCasoDialog } from "./dialogs/AgregarCasoDialog";
import { CompletarInformacionBajaDialog } from "./dialogs/CompletarInformacionBajaDialog";
import { ConfirmarReembolsoBajaDialog } from "./dialogs/ConfirmarReembolsoBajaDialog";
import { DecisionCierreDialog } from "./dialogs/DecisionCierreDialog";
import { EliminarCasoDialog } from "./dialogs/EliminarCasoDialog";
import { GenerarNuevoCobroDialog } from "./dialogs/GenerarNuevoCobroDialog";
import { NuevoCobroDialog } from "./dialogs/NuevoCobroDialog";
import { RecepcionDerivacionDialog } from "./dialogs/RecepcionDerivacionDialog";
import { RevisionMalVendidoDialog } from "./dialogs/RevisionMalVendidoDialog";
import { RevisionPosibleBajaDialog } from "./dialogs/RevisionPosibleBajaDialog";

const TIPO_FILTRO_LABEL: Record<TipoCaso, string> = {
  reevaluacion: "Reevaluación",
  reembolso: "Reembolso",
  "modificacion-contrato": "Modificación de contrato",
  derivacion: "Derivación",
};

function FiltroLista({
  label,
  opciones,
  valor,
  onChange,
}: {
  label: string;
  opciones: { value: string; label: string }[];
  valor: string;
  onChange: (valor: string) => void;
}) {
  return (
    <div className="space-y-1">
      <p className="type-meta font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="space-y-0.5">
        {opciones.map((opcion) => (
          <button
            key={opcion.value}
            type="button"
            onClick={() => onChange(opcion.value)}
            aria-pressed={valor === opcion.value}
            className={cn(
              "block w-full rounded-control px-2 py-1 text-left type-supporting transition-colors",
              valor === opcion.value
                ? "bg-primary/10 font-medium text-primary"
                : "text-foreground hover:bg-accent",
            )}
          >
            {opcion.label}
          </button>
        ))}
      </div>
    </div>
  );
}

type Tab = "activos" | "resueltos";

type DialogoTipo =
  | "recepcion-derivacion"
  | "nuevo-cobro"
  | "generar-nuevo-cobro"
  | "revisar-mal-vendido"
  | "revisar-posible-baja"
  | "completar-informacion-baja"
  | "confirmar-deposito"
  | "resolver"
  | "eliminar"
  | "nuevo-caso";

export function DeskResDesk() {
  const [casos, setCasos] = React.useState<Caso[] | null>(null);
  const [tab, setTab] = React.useState<Tab>("activos");
  const [filtrosAbiertos, setFiltrosAbiertos] = React.useState(false);
  const [busqueda, setBusqueda] = React.useState("");
  const [servicioFiltro, setServicioFiltro] = React.useState<string>("todos");
  const [tipoFiltro, setTipoFiltro] = React.useState<string>("todos");
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [dialogo, setDialogo] = React.useState<{ tipo: DialogoTipo; caso: Caso | null } | null>(
    null,
  );

  const cargar = React.useCallback(() => {
    recargarCasos().then(setCasos);
  }, []);

  React.useEffect(() => {
    cargar();
  }, [cargar]);

  const cerrarDialogo = () => setDialogo(null);
  const handleGuardado = () => {
    cargar();
    cerrarDialogo();
  };

  const conFiltrosBase = (caso: Caso) =>
    coincideBusqueda(caso, busqueda) &&
    (servicioFiltro === "todos" || caso.servicio === servicioFiltro) &&
    (tipoFiltro === "todos" || caso.tipoCaso === tipoFiltro);

  const activos = (casos ?? []).filter((c) => c.estadoProceso !== "resuelto" && conFiltrosBase(c));
  const resueltos = (casos ?? []).filter(
    (c) => c.estadoProceso === "resuelto" && conFiltrosBase(c),
  );
  const visibles = tab === "activos" ? activos : resueltos;

  const filtrosActivos = [
    busqueda.trim() !== "",
    servicioFiltro !== "todos",
    tipoFiltro !== "todos",
  ].filter(Boolean).length;

  const limpiarFiltros = () => {
    setBusqueda("");
    setServicioFiltro("todos");
    setTipoFiltro("todos");
  };

  const handleAccion = (accion: AccionPrincipal, caso: Caso) => {
    setDialogo({ tipo: accion.kind, caso });
  };

  const handleEliminar = (caso: Caso) => {
    setDialogo({ tipo: "eliminar", caso });
  };

  return (
    <div className="min-h-screen bg-secondary">
      <HeaderBar
        sticky
        brand={
          <div className="flex items-center gap-2.5">
            <Logo layout="isotipe" alt="Lexy" className="h-7 w-7" />
            <span className="type-item-title text-foreground">Desk ReS</span>
          </div>
        }
      />

      <Popover open={filtrosAbiertos} onOpenChange={setFiltrosAbiertos}>
        <div className="pointer-events-none fixed inset-x-0 top-20 z-40">
          <div className="pointer-events-auto mx-auto max-w-[1060px] px-4 md:px-6 lg:px-8">
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Filtros"
                className="relative shadow-raised"
              >
                <ListFilter className="size-(--icon-size-control)" aria-hidden="true" />
                {!filtrosAbiertos && filtrosActivos > 0 && (
                  <Badge
                    size="sm"
                    className="absolute -right-1.5 -top-1.5 min-w-4 justify-center px-1"
                  >
                    {filtrosActivos}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
          </div>
        </div>
        <PopoverContent
          side="bottom"
          align="start"
          sideOffset={8}
          className="w-60 max-h-[70vh] overflow-y-auto p-3"
        >
          <div className="space-y-3">
            <Searchbox
              placeholder="Buscar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onClear={() => setBusqueda("")}
            />
            <FiltroLista
              label="Servicio"
              valor={servicioFiltro}
              onChange={setServicioFiltro}
              opciones={[
                { value: "todos", label: "Todos" },
                ...SERVICIOS.map((servicio) => ({ value: servicio, label: servicio })),
              ]}
            />
            <FiltroLista
              label="Tipo"
              valor={tipoFiltro}
              onChange={setTipoFiltro}
              opciones={[
                { value: "todos", label: "Todos" },
                ...(Object.entries(TIPO_FILTRO_LABEL) as [TipoCaso, string][]).map(
                  ([valor, label]) => ({ value: valor, label }),
                ),
              ]}
            />
            {filtrosActivos > 0 && (
              <Button variant="ghost" size="sm" onClick={limpiarFiltros} className="gap-1.5">
                <X className="size-(--icon-size-inline)" aria-hidden="true" />
                Limpiar
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <main className="mx-auto max-w-[1060px] px-4 py-8 md:px-6 lg:px-8">
        <div className="mb-6 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as Tab)}
            className="md:col-start-2 md:row-start-1"
          >
            <TabsList>
              <TabsTrigger value="activos">En evaluación ({activos.length})</TabsTrigger>
              <TabsTrigger value="resueltos">Resueltos ({resueltos.length})</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            className="md:col-start-3 md:row-start-1 md:justify-self-end"
            onClick={() => setDialogo({ tipo: "nuevo-caso", caso: null })}
          >
            + Nuevo caso
          </Button>
        </div>
        {casos === null ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : visibles.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>
                {filtrosActivos > 0
                  ? "Ningún caso calza con estos filtros"
                  : tab === "activos"
                    ? "Todavía no hay casos por evaluar."
                    : "Todavía no hay casos resueltos."}
              </EmptyTitle>
              <EmptyDescription className="rounded-lg border border-dashed border-brand-navy/30 px-4 py-3 text-brand-navy">
                {filtrosActivos > 0
                  ? "Prueba con otra búsqueda o limpia los filtros."
                  : tab === "activos"
                    ? "Presiona '+ Nuevo caso' para registrar uno nuevo: puede ser una reevaluación de servicio (que implica baja, derivación o mal vendido), una solicitud de reembolso o la generación de un nuevo cobro."
                    : "Cuando cierres un caso desde 'En evaluación', va a aparecer aquí junto con su resultado final."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Accordion
            type="single"
            collapsible
            value={expandedId ?? ""}
            onValueChange={(v) => setExpandedId(v || null)}
            className="space-y-3"
          >
            {visibles.map((caso, index) => (
              <CasoCard
                key={caso.id}
                caso={caso}
                index={index}
                onAccion={handleAccion}
                onEliminar={handleEliminar}
              />
            ))}
          </Accordion>
        )}
      </main>

      <AgregarCasoDialog
        open={dialogo?.tipo === "nuevo-caso"}
        onOpenChange={(v) => !v && cerrarDialogo()}
        onSaved={handleGuardado}
      />
      <DecisionCierreDialog
        caso={dialogo?.tipo === "resolver" ? dialogo.caso : null}
        open={dialogo?.tipo === "resolver"}
        onOpenChange={(v) => !v && cerrarDialogo()}
        onSaved={handleGuardado}
      />
      <RecepcionDerivacionDialog
        caso={dialogo?.tipo === "recepcion-derivacion" ? dialogo.caso : null}
        open={dialogo?.tipo === "recepcion-derivacion"}
        onOpenChange={(v) => !v && cerrarDialogo()}
        onSaved={handleGuardado}
      />
      <NuevoCobroDialog
        caso={dialogo?.tipo === "nuevo-cobro" ? dialogo.caso : null}
        casos={casos ?? []}
        open={dialogo?.tipo === "nuevo-cobro"}
        onOpenChange={(v) => !v && cerrarDialogo()}
        onSaved={handleGuardado}
      />
      <GenerarNuevoCobroDialog
        caso={dialogo?.tipo === "generar-nuevo-cobro" ? dialogo.caso : null}
        open={dialogo?.tipo === "generar-nuevo-cobro"}
        onOpenChange={(v) => !v && cerrarDialogo()}
        onSaved={handleGuardado}
      />
      <RevisionMalVendidoDialog
        caso={dialogo?.tipo === "revisar-mal-vendido" ? dialogo.caso : null}
        open={dialogo?.tipo === "revisar-mal-vendido"}
        onOpenChange={(v) => !v && cerrarDialogo()}
        onSaved={handleGuardado}
      />
      <RevisionPosibleBajaDialog
        caso={dialogo?.tipo === "revisar-posible-baja" ? dialogo.caso : null}
        open={dialogo?.tipo === "revisar-posible-baja"}
        onOpenChange={(v) => !v && cerrarDialogo()}
        onSaved={handleGuardado}
      />
      <CompletarInformacionBajaDialog
        caso={dialogo?.tipo === "completar-informacion-baja" ? dialogo.caso : null}
        open={dialogo?.tipo === "completar-informacion-baja"}
        onOpenChange={(v) => !v && cerrarDialogo()}
        onSaved={handleGuardado}
      />
      <ConfirmarReembolsoBajaDialog
        caso={dialogo?.tipo === "confirmar-deposito" ? dialogo.caso : null}
        open={dialogo?.tipo === "confirmar-deposito"}
        onOpenChange={(v) => !v && cerrarDialogo()}
        onSaved={handleGuardado}
      />
      <EliminarCasoDialog
        caso={dialogo?.tipo === "eliminar" ? dialogo.caso : null}
        open={dialogo?.tipo === "eliminar"}
        onOpenChange={(v) => !v && cerrarDialogo()}
        onSaved={handleGuardado}
      />
    </div>
  );
}
