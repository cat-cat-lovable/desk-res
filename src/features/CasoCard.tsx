import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown, FileText, Image as ImageIcon, Trash2 } from "lucide-react";
import * as React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/base/Accordion";
import { Button } from "@/shared/components/base/Button";
import { Card, CardContent, CardFooter, CardHeader } from "@/shared/components/base/Card";
import { Separator } from "@/shared/components/base/Separator";
import { Tag } from "@/shared/components/base/Tag";
import type { AccionPrincipal } from "@/shared/lib/caso-helpers";
import {
  accionPrincipal,
  ESTADO_NUEVO_COBRO_INFO,
  motivoTone,
  TIPO_CASO_LABEL,
  TIPO_CASO_TONE,
} from "@/shared/lib/caso-helpers";
import { formatFechaCorta, formatMonto } from "@/shared/lib/utils/format";
import type { Caso } from "@/shared/types/caso";

function Campo({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="min-w-0 rounded-md border border-border-subtle bg-background px-2.5 py-1.5">
      <p className="type-supporting font-semibold text-foreground">{label}</p>
      <p className="type-meta truncate text-muted-foreground">{value}</p>
    </div>
  );
}

function Seccion({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h4 className="type-item-title text-foreground">{title}</h4>
      {children}
    </section>
  );
}

export interface CasoCardProps {
  caso: Caso;
  index?: number;
  onAccion: (accion: AccionPrincipal, caso: Caso) => void;
  onEliminar: (caso: Caso) => void;
}

export function CasoCard({ caso, index = 0, onAccion, onEliminar }: CasoCardProps) {
  const accion = accionPrincipal(caso);
  const resuelto = caso.estadoProceso === "resuelto";
  const tieneActa = Boolean(caso.actaDerivacion);
  const tieneDetalleDerivacion =
    caso.tipoCaso === "derivacion" && !tieneActa && Boolean(caso.detalleDerivacion);
  const tieneCajaVentas = Boolean(
    caso.descripcionVentas || caso.cobroAnterior || caso.estrategia || caso.tacticas,
  );
  const entradaDelayMs = Math.min(index * 30, 300);

  return (
    <AccordionPrimitive.Item value={caso.id} asChild>
      <Card
        className="animate-in fade-in slide-in-from-bottom-1 fill-mode-backwards rounded-xl duration-300"
        style={{ animationDelay: `${entradaDelayMs}ms` }}
      >
        <CardHeader className="px-0">
          <AccordionPrimitive.Header className="flex">
            <AccordionPrimitive.Trigger asChild>
              <button
                type="button"
                className="flex w-full cursor-pointer items-start gap-3 px-(--card-inset) text-left [&[data-state=open]>svg]:rotate-180"
              >
                <ChevronDown
                  className="mt-1 size-(--icon-size-control) shrink-0 text-muted-foreground transition-transform duration-[var(--duration-normal)]"
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="type-item-title truncate text-foreground">
                      {caso.cliente.nombre}
                    </span>
                    <Tag tone={TIPO_CASO_TONE[caso.tipoCaso]}>{TIPO_CASO_LABEL[caso.tipoCaso]}</Tag>
                    {resuelto && <Tag tone="success">Resuelto</Tag>}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <p className="type-meta truncate text-muted-foreground">
                      {caso.cliente.correo}
                    </p>
                    <span className="text-border-strong" aria-hidden="true">
                      ·
                    </span>
                    <p className="type-meta truncate text-muted-foreground">
                      ID Defensoría: {caso.cliente.idDefensoria}
                    </p>
                  </div>
                  {caso.fechaGestion && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Tag tone="gray" shape="rounded" size="sm">
                        Plazo {formatFechaCorta(caso.fechaGestion)}
                      </Tag>
                    </div>
                  )}
                </div>
                {(caso.motivo || caso.resultado) && (
                  <Tag tone={motivoTone(caso)} className="shrink-0">
                    {caso.resultado ?? caso.motivo}
                  </Tag>
                )}
              </button>
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
        </CardHeader>

        <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none">
          <CardContent className="border-t border-border-subtle pt-4">
            <div className="space-y-4 rounded-lg bg-sidebar-hover p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <Campo label="Servicio" value={caso.servicio} />
                <Campo label="Abogado a cargo" value={caso.abogadoTramitador} />
                <Campo label="Abogado vendedor" value={caso.abogadoVendedor} />
                <Campo label="Servicio destino" value={caso.servicioDestino} />
              </div>

              {tieneCajaVentas && (
                <Accordion
                  type="multiple"
                  className="rounded-lg border border-brand-lavender/25 bg-brand-lavender/10 px-3"
                >
                  <AccordionItem value="caja-ventas" className="border-none">
                    <AccordionTrigger iconPosition="start" className="py-3">
                      Información post-venta
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3 pb-3">
                      {caso.descripcionVentas && (
                        <div>
                          <p className="type-meta font-medium uppercase tracking-wide text-muted-foreground">
                            Descripción del caso
                          </p>
                          <p className="mt-1 type-supporting text-foreground">
                            {caso.descripcionVentas}
                          </p>
                        </div>
                      )}
                      {(caso.estrategia || caso.tacticas) && (
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <Campo label="Estrategia" value={caso.estrategia} />
                          <Campo label="Tácticas" value={caso.tacticas} />
                        </div>
                      )}
                      <div className="space-y-2">
                        <p className="type-meta font-medium uppercase tracking-wide text-muted-foreground">
                          Cobro anterior (post-venta)
                        </p>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          <Campo
                            label="Valor contrato"
                            value={
                              caso.cobroAnterior ? formatMonto(caso.cobroAnterior.montoTotal) : "—"
                            }
                          />
                          <Campo label="N.º de cuotas" value={caso.cobroAnterior?.cuotas ?? "—"} />
                          <Campo
                            label="Valor cuota"
                            value={
                              caso.cobroAnterior
                                ? formatMonto(caso.cobroAnterior.montoPrimeraCuota)
                                : "—"
                            }
                          />
                          <Campo
                            label="Fecha cuota"
                            value={
                              caso.cobroAnterior
                                ? formatFechaCorta(caso.cobroAnterior.fechaInicio)
                                : "—"
                            }
                          />
                          <Campo
                            label="Estado pago"
                            value={caso.cobroAnterior?.pagoPrimeraCuota ?? "—"}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              {(tieneDetalleDerivacion || tieneActa) && (
                <Accordion
                  type="multiple"
                  className="rounded-lg border border-brand-lavender/25 bg-brand-lavender/10 px-3"
                >
                  {tieneDetalleDerivacion && caso.detalleDerivacion && (
                    <AccordionItem
                      value="detalle-derivacion"
                      className={tieneActa ? undefined : "border-none"}
                    >
                      <AccordionTrigger iconPosition="start" className="py-3">
                        Detalle de la derivación
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2 pb-3">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <Campo
                            label="Servicio tentativo"
                            value={caso.detalleDerivacion.servicioTentativo}
                          />
                          <Campo
                            label="Solicitado por"
                            value={caso.detalleDerivacion.solicitadoPor}
                          />
                        </div>
                        <Campo label="Justificación" value={caso.detalleDerivacion.justificacion} />
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {tieneActa && caso.actaDerivacion && (
                    <AccordionItem value="acta-derivacion" className="border-none">
                      <AccordionTrigger iconPosition="start" className="py-3">
                        Acta de derivación
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2 pb-3">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <Campo
                            label="Abogado vendedor"
                            value={caso.actaDerivacion.abogadoVendedor}
                          />
                          <Campo label="Acreedores" value={caso.actaDerivacion.acreedores} />
                          <Campo
                            label="Monto deuda"
                            value={formatMonto(caso.actaDerivacion.montoDeuda)}
                          />
                          <Campo
                            label="Situación tributaria"
                            value={caso.actaDerivacion.situacionTributaria}
                          />
                          <Campo label="Demandas" value={caso.actaDerivacion.demandas} />
                          <Campo label="Bienes" value={caso.actaDerivacion.bienes} />
                          <Campo label="Prendas" value={caso.actaDerivacion.prendas} />
                          <Campo label="Hipotecario" value={caso.actaDerivacion.hipotecario} />
                          <Campo
                            label="Pensión de alimentos"
                            value={caso.actaDerivacion.pensionAlimentos}
                          />
                          <Campo label="Sociedades" value={caso.actaDerivacion.sociedades} />
                          <Campo
                            label="Fecha pago primera cuota"
                            value={
                              caso.actaDerivacion.fechaPagoPrimeraCuota
                                ? formatFechaCorta(caso.actaDerivacion.fechaPagoPrimeraCuota)
                                : undefined
                            }
                          />
                          <Campo
                            label="Derivaciones realizadas"
                            value={
                              caso.actaDerivacion.huboDerivacionAnterior
                                ? (caso.actaDerivacion.derivacionAnteriorServicio ??
                                  "Ha sido derivado antes")
                                : "Ninguna"
                            }
                          />
                        </div>
                        <Campo
                          label="Otros datos importantes"
                          value={caso.actaDerivacion.otrosDatosImportantes}
                        />
                        <Campo label="Resumen" value={caso.actaDerivacion.resumen} />
                        {caso.actaDerivacion.huboDerivacionAnterior &&
                          caso.actaDerivacion.derivacionAnteriorMotivo && (
                            <p className="type-supporting text-muted-foreground">
                              Motivo de la derivación anterior:{" "}
                              <span className="text-foreground">
                                {caso.actaDerivacion.derivacionAnteriorMotivo}
                              </span>
                            </p>
                          )}
                        <Campo
                          label="Compromisos y próximos pasos"
                          value={caso.actaDerivacion.compromisos}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              )}

              {caso.notasEvaluacion && (
                <Seccion title="Notas de evaluación">
                  <p className="text-foreground">{caso.notasEvaluacion}</p>
                </Seccion>
              )}

              {caso.gestiones && caso.gestiones.length > 0 && (
                <Seccion title="Gestiones realizadas">
                  <ul className="space-y-2">
                    {caso.gestiones.map((gestion, index) => (
                      <li key={index} className="type-supporting text-foreground">
                        <span className="text-muted-foreground">
                          {formatFechaCorta(gestion.fecha)}:
                        </span>{" "}
                        {gestion.nota}
                      </li>
                    ))}
                  </ul>
                </Seccion>
              )}

              {caso.acreedor && (
                <Seccion title="Acreedor">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Campo label="Nombre" value={caso.acreedor.nombre} />
                    <Campo
                      label="Monto nuevo contrato"
                      value={formatMonto(caso.acreedor.montoContratoActual)}
                    />
                    <Campo label="Número de cuotas" value={caso.acreedor.cuotas} />
                    <Campo
                      label="Valor primera cuota"
                      value={formatMonto(caso.acreedor.valorPrimeraCuota)}
                    />
                    {caso.acreedor.diferencia !== undefined && (
                      <Campo label="Diferencia" value={formatMonto(caso.acreedor.diferencia)} />
                    )}
                  </div>
                </Seccion>
              )}

              {caso.documentos && caso.documentos.length > 0 && (
                <Seccion title="Documentos adjuntos">
                  <ul className="space-y-1.5">
                    {caso.documentos.map((doc) => (
                      <li key={doc.url} className="flex items-center gap-2">
                        {doc.tipo === "imagen" ? (
                          <ImageIcon
                            className="size-(--icon-size-inline) shrink-0 text-muted-foreground"
                            aria-hidden="true"
                          />
                        ) : (
                          <FileText
                            className="size-(--icon-size-inline) shrink-0 text-muted-foreground"
                            aria-hidden="true"
                          />
                        )}
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="type-supporting truncate text-primary underline-offset-4 hover:underline"
                        >
                          {doc.nombre}
                        </a>
                      </li>
                    ))}
                  </ul>
                </Seccion>
              )}

              {caso.nuevoCobro &&
                caso.nuevoCobro.estado !== "no-aplica" &&
                caso.nuevoCobro.estado !== "pendiente" && (
                  <Seccion title="Nuevo cobro">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="min-w-0">
                        <p className="type-meta text-muted-foreground">Estado</p>
                        <Tag
                          tone={ESTADO_NUEVO_COBRO_INFO[caso.nuevoCobro.estado].tone}
                          shape="rounded"
                          size="sm"
                          className="mt-0.5"
                        >
                          {ESTADO_NUEVO_COBRO_INFO[caso.nuevoCobro.estado].label}
                        </Tag>
                      </div>
                      <Campo
                        label="Valor contrato"
                        value={caso.nuevoCobro.valor && formatMonto(caso.nuevoCobro.valor)}
                      />
                      <Campo label="Cuotas" value={caso.nuevoCobro.cuotas} />
                      <Campo label="Confirmado por" value={caso.nuevoCobro.confirmadoPor} />
                    </div>
                  </Seccion>
                )}

              {caso.pendienteConfirmacion === "reembolso-baja" && (
                <Seccion title="Transferencia pendiente">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Campo
                      label="Monto"
                      value={caso.montoReembolso && formatMonto(caso.montoReembolso)}
                    />
                    <Campo label="Cuotas" value={caso.cuotasReembolso} />
                    <Campo label="Banco" value={caso.cuentaBanco} />
                    <Campo label="Número de cuenta" value={caso.cuentaNumero} />
                  </div>
                </Seccion>
              )}

              {!resuelto && caso.motivo === "Posible baja" && caso.origenPosibleBaja && (
                <Seccion title="Posible baja — pendiente líder de operaciones">
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <Campo label="Origen" value={caso.origenPosibleBaja} />
                      <Campo label="Motivo" value={caso.motivoPosibleBaja} />
                      <Campo label="A cargo de" value={caso.capitanACargo} />
                    </div>
                    {caso.comentariosPosibleBaja && (
                      <p className="type-supporting text-foreground">
                        {caso.comentariosPosibleBaja}
                      </p>
                    )}
                  </div>
                </Seccion>
              )}

              {resuelto && (
                <Seccion title="Resolución de cierre">
                  <div className="space-y-2 rounded-lg bg-muted p-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Campo label="Resultado" value={caso.resultado} />
                      <Campo
                        label="Monto"
                        value={caso.montoReembolso && formatMonto(caso.montoReembolso)}
                      />
                      <Campo label="Motivo" value={caso.motivoBaja ?? caso.motivo} />
                      {caso.malVendidoCorresponde && (
                        <Campo
                          label="¿Corresponde mal vendido?"
                          value={
                            caso.malVendidoCorresponde === "si"
                              ? "Sí corresponde"
                              : "No corresponde"
                          }
                        />
                      )}
                    </div>
                    {caso.malVendidoJustificacion && (
                      <p className="text-foreground">{caso.malVendidoJustificacion}</p>
                    )}
                    {caso.malVendidoCaminoSugerido && (
                      <p className="type-supporting text-muted-foreground">
                        Camino sugerido para el capitán:{" "}
                        <span className="text-foreground">{caso.malVendidoCaminoSugerido}</span>
                      </p>
                    )}
                    {caso.rechazoRecepcionJustificacion && (
                      <p className="text-foreground">{caso.rechazoRecepcionJustificacion}</p>
                    )}
                    {caso.rechazoRecepcionMotivo && (
                      <p className="type-supporting text-muted-foreground">
                        Opción sugerida al rechazar la recepción:{" "}
                        <span className="text-foreground">{caso.rechazoRecepcionMotivo}</span>
                      </p>
                    )}
                    {caso.detalleResolucion && (
                      <p className="text-foreground">{caso.detalleResolucion}</p>
                    )}
                  </div>
                </Seccion>
              )}
            </div>
          </CardContent>
        </AccordionPrimitive.Content>

        <div className="px-(--card-inset)">
          <Separator className="bg-border-subtle" />
        </div>
        <CardFooter className="justify-end gap-2 bg-muted/50">
          <Button
            size="icon"
            variant="ghost"
            className="size-[var(--control-height-sm)]"
            aria-label={`Eliminar caso de ${caso.cliente.nombre}`}
            onClick={() => onEliminar(caso)}
          >
            <Trash2 className="size-(--icon-size-control)" aria-hidden="true" />
          </Button>
          {accion && (
            <Button size="sm" onClick={() => onAccion(accion, caso)}>
              {accion.label}
            </Button>
          )}
        </CardFooter>
      </Card>
    </AccordionPrimitive.Item>
  );
}
