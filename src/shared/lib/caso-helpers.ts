import type { TagProps } from "@/shared/components/base/Tag";
import type { Caso, EstadoNuevoCobro, TipoCaso } from "@/shared/types/caso";

export const TIPO_CASO_LABEL: Record<TipoCaso, string> = {
  reevaluacion: "Reevaluación de servicio",
  reembolso: "Reembolso",
  "modificacion-contrato": "Modificación de contrato",
  derivacion: "Derivación",
};

export const TIPO_CASO_TONE: Record<TipoCaso, TagProps["tone"]> = {
  reevaluacion: "brand",
  reembolso: "warning",
  "modificacion-contrato": "success",
  derivacion: "brand",
};

export type AccionPrincipal = {
  label: string;
  kind:
    | "recepcion-derivacion"
    | "nuevo-cobro"
    | "generar-nuevo-cobro"
    | "revisar-mal-vendido"
    | "revisar-posible-baja"
    | "completar-informacion-baja"
    | "confirmar-deposito"
    | "resolver";
};

/**
 * Botón de acción principal del footer de la tarjeta: cambia según estado y
 * subflujo del caso (readme-logica-res.md §7 / §12). Un caso resuelto no
 * tiene acción principal — la tarjeta muestra el icono de eliminar.
 */
export function accionPrincipal(caso: Caso): AccionPrincipal | null {
  if (caso.estadoProceso === "resuelto") return null;

  const esNuevoAcreedor =
    caso.tipoCaso === "modificacion-contrato" &&
    caso.motivoModificacionContrato === "Agregar nuevo acreedor";

  if (caso.nuevoCobro?.estado === "esperando-cliente") {
    // El cobro ya se generó en Apio (nuevo acreedor, modificación de
    // contrato o derivación con nuevo cobro): queda esperando que el
    // cliente lo acepte ahí. El paso a "Resuelto" lo hace Apio, no esta
    // app — sin acción principal mientras tanto.
    return null;
  }

  if (caso.tipoCaso === "reevaluacion" && caso.motivo === "Posible baja") {
    // Dos turnos que se alternan mientras el caso no esté resuelto (por eso
    // van antes del branch por estadoProceso): si la líder de operaciones
    // pidió información, le toca al capitán completarla; si no, le toca a
    // la líder decidir (Aprobar / Rechazar / Falta información) — sin pasar
    // por las opciones genéricas de reevaluación en ningún caso.
    if (caso.turnoPosibleBaja === "capitan") {
      return { label: "Completar información", kind: "completar-informacion-baja" };
    }
    return { label: "Resolver", kind: "revisar-posible-baja" };
  }

  if (caso.estadoProceso === "por-evaluar") {
    if (caso.tipoCaso === "reembolso") {
      return { label: "Resolver", kind: "resolver" };
    }
    if (esNuevoAcreedor) {
      // Siempre procede: en vez de preguntar, confirma los datos del
      // acreedor y genera el cobro en Apio directamente.
      return { label: "Resolver", kind: "generar-nuevo-cobro" };
    }
    if (caso.tipoCaso === "modificacion-contrato") {
      return { label: "Resolver", kind: "nuevo-cobro" };
    }
    if (caso.tipoCaso === "reevaluacion" && caso.motivo === "Posible mal vendido") {
      // La capitana de ventas revisa si corresponde o no; cierra el caso en
      // ambos casos (no pasa por las opciones genéricas de reevaluación).
      return { label: "Resolver", kind: "revisar-mal-vendido" };
    }
    // "Cambio de servicio" no pasa por acá: el acta de derivación se llena
    // al crear el caso (`AgregarCasoDialog`), así que un caso con este
    // motivo nunca queda "por evaluar" — nace directo en "en-evaluacion"
    // con `pasoDerivacion = "recepcion"` (ver más abajo).
    // Ningún tipo de caso pasa por "Iniciar evaluación": todos van directo a
    // "Resolver" desde que se crean.
    return { label: "Resolver", kind: "resolver" };
  }

  if (caso.pasoDerivacion === "recepcion") {
    return { label: "Resolver", kind: "recepcion-derivacion" };
  }

  if (caso.pendienteConfirmacion === "reembolso-baja") {
    return { label: "Confirmar depósito", kind: "confirmar-deposito" };
  }

  if (
    caso.pendienteConfirmacion === "nuevo-cobro" ||
    (caso.requiereNuevoCobro && caso.nuevoCobro)
  ) {
    return { label: "Definir nuevo cobro", kind: "nuevo-cobro" };
  }

  return { label: "Resolver", kind: "resolver" };
}

/**
 * Cómo se ve el estado del nuevo cobro dentro de la sección "Nuevo cobro"
 * del desplegable de la tarjeta (CasoCard): reemplaza el valor técnico
 * (`caso.nuevoCobro.estado`) por una etiqueta legible con tono semántico,
 * en vez de imprimir el enum en texto plano.
 */
export const ESTADO_NUEVO_COBRO_INFO: Record<
  EstadoNuevoCobro,
  { label: string; tone: TagProps["tone"] }
> = {
  pendiente: { label: "Pendiente", tone: "gray" },
  "no-aplica": { label: "No aplica", tone: "gray" },
  definido: { label: "Definido", tone: "brand" },
  confirmado: { label: "Confirmado", tone: "brand" },
  "esperando-cliente": { label: "Esperando cliente", tone: "warning" },
  "aceptado-cliente": { label: "Aceptado por el cliente", tone: "success" },
};

export function coincideBusqueda(caso: Caso, termino: string): boolean {
  const q = termino.trim().toLowerCase();
  if (!q) return true;
  return (
    caso.cliente.nombre.toLowerCase().includes(q) || caso.cliente.correo.toLowerCase().includes(q)
  );
}
