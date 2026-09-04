// Modelo de datos del Desk ReS — ver readme-logica-res.md §4 (fuente de verdad
// de negocio) y src/prototype/data-contract/prototype-data-contract.ts (contrato
// de datos del prototipo).

export type TipoCaso = "reevaluacion" | "reembolso" | "modificacion-contrato" | "derivacion";
export type EstadoProceso = "por-evaluar" | "en-evaluacion" | "resuelto";
export type PasoDerivacion = "cliente" | "recepcion" | "acta" | "cobro";
export type PendienteConfirmacion = "nuevo-cobro" | "reembolso-baja";

export type EstadoEvaluacionCliente = "pendiente" | "aceptada" | "rechazada";
export type EstadoRecepcionDerivacion = "pendiente" | "aceptada" | "rechazada";
export type EstadoNuevoCobro =
  "pendiente" | "no-aplica" | "definido" | "confirmado" | "esperando-cliente" | "aceptado-cliente";
export type EstadoReembolsoConfirmacionBaja = "pendiente" | "confirmado";

export const MOTIVOS_REEVALUACION = [
  "Posible mal vendido",
  "Cambio de servicio",
  "Posible baja",
] as const;
export type MotivoReevaluacion = (typeof MOTIVOS_REEVALUACION)[number];

export type CorrespondeMalVendido = "si" | "no";

export const CAMINOS_MAL_VENDIDO = [
  "Mantener sin cambios",
  "Modificar estrategia en origen",
  "Derivar a otro servicio",
  "Dar de baja",
] as const;
export type CaminoMalVendido = (typeof CAMINOS_MAL_VENDIDO)[number];

export const MOTIVOS_MODIFICACION_CONTRATO = ["Agregar nuevo acreedor", "Otros"] as const;
export type MotivoModificacionContrato = (typeof MOTIVOS_MODIFICACION_CONTRATO)[number];

export type ProcedeModificacionContrato = "si" | "no";

export const MOTIVOS_BAJA = [
  "Baja voluntaria",
  "Baja por no pago",
  "Baja por no colaborar",
  "Baja por derivación no aceptada o no completada",
] as const;
export type MotivoBaja = (typeof MOTIVOS_BAJA)[number];

export const ORIGENES_POSIBLE_BAJA = [
  "Ventas",
  "Cobranza",
  "Cuotas impagas",
  "Ops",
  "Voluntaria",
] as const;
export type OrigenPosibleBaja = (typeof ORIGENES_POSIBLE_BAJA)[number];

export type TurnoPosibleBaja = "lider-operaciones" | "capitan";

export const MOTIVOS_POSIBLE_BAJA = [
  "1° cuota impaga",
  "2 cuotas impagas",
  "3 cuotas impagas",
  "4 cuotas impagas",
  "No colaboración",
  "Insatisfacción con el servicio",
  "Problemas económicos",
  "Mal vendido",
  "Inviable",
  "Venta arrepentida",
  "Inubicable",
] as const;
export type MotivoPosibleBaja = (typeof MOTIVOS_POSIBLE_BAJA)[number];

export const RESULTADOS_REEVALUACION = [
  "Se mantiene",
  "Derivación a otro servicio",
  "Dar de baja",
] as const;
export const RESULTADOS_REEMBOLSO = ["Procede sin baja", "Procede con baja", "No procede"] as const;
export const RESULTADOS_MODIFICACION_CONTRATO = ["Procede (nuevo cobro)", "No procede"] as const;
export type Resultado =
  | (typeof RESULTADOS_REEVALUACION)[number]
  | (typeof RESULTADOS_REEMBOLSO)[number]
  | (typeof RESULTADOS_MODIFICACION_CONTRATO)[number];

export const SERVICIOS = ["Renegociación", "Liquidación", "Litigios/PP"] as const;
export type Servicio = (typeof SERVICIOS)[number];

export const SERVICIOS_DERIVACION = ["Renegociación", "Litigios", "Liquidación"] as const;
export type ServicioDerivacion = (typeof SERVICIOS_DERIVACION)[number];

export const MOTIVOS_RECHAZO_RECEPCION = [
  "Derivación a otro equipo",
  "Dar de baja",
  "Otro",
] as const;
export type MotivoRechazoRecepcion = (typeof MOTIVOS_RECHAZO_RECEPCION)[number];

export const ETAPAS_POR_SERVICIO: Record<Servicio, readonly string[]> = {
  Renegociación: ["Levantamiento", "Propuesta", "Negociación", "Cierre"],
  Liquidación: ["Evaluación", "Presentación", "Junta de acreedores", "Liquidación"],
  "Litigios/PP": ["Estudio", "Demanda", "Audiencia", "Sentencia"],
};

export const CAPITANES = [
  "Capi Ventas",
  "Capi RN",
  "Capi LV",
  "Capi LT/PP",
  "Encargada reembolso",
  "Encargada nuevo cobro",
  "Encargada transferencia",
  "Líder de operaciones",
] as const;
export type Capitan = (typeof CAPITANES)[number];

export type Cliente = {
  nombre: string;
  correo: string;
  telefono: string;
  idDefensoria: string;
};

export type CobroAnterior = {
  montoTotal: number;
  cuotas: number;
  montoPrimeraCuota: number;
  fechaInicio: string;
  cuotasPagadas: number;
  cuotasMorosas: number;
  pagoPrimeraCuota: string;
};

export type Acreedor = {
  nombre: string;
  montoContratoActual: number;
  cuotas: number;
  valorPrimeraCuota: number;
  diferencia?: number;
};

export type ActaDerivacion = {
  abogadoVendedor: string;
  acreedores: string;
  montoDeuda: number;
  situacionTributaria: string;
  demandas: string;
  bienes: string;
  prendas: string;
  hipotecario: string;
  pensionAlimentos: string;
  sociedades: string;
  otrosDatosImportantes?: string;
  resumen: string;
  compromisos?: string;
  fechaPagoPrimeraCuota?: string;
  huboDerivacionAnterior?: boolean;
  derivacionAnteriorServicio?: ServicioDerivacion;
  derivacionAnteriorMotivo?: string;
};

export type DetalleDerivacion = {
  servicioTentativo: ServicioDerivacion;
  solicitadoPor: string;
  justificacion: string;
};

export type NuevoCobro = {
  estado: EstadoNuevoCobro;
  aplica: boolean;
  motivoNoAplica?: string;
  valor?: number;
  cuotas?: number;
  observaciones?: string;
  confirmadoPor?: string;
  fechaDefinicion?: string;
  fechaConfirmacion?: string;
};

export type Documento = {
  nombre: string;
  tipo: "pdf" | "word" | "imagen";
  url: string;
};

export type Gestion = {
  capitan: string;
  fecha: string;
  nota: string;
};

export type CasoVinculado = {
  id: string;
  tipo: string;
  label: string;
};

export type Caso = {
  id: string;
  tipoCaso: TipoCaso;
  estadoProceso: EstadoProceso;

  cliente: Cliente;

  abogadoTramitador: string;
  abogadoVendedor: string;
  capitanOrigen?: string;
  capitanACargo: string;

  servicio: Servicio;
  servicioDestino?: ServicioDerivacion;
  etapaStreak?: string;

  motivo?: MotivoReevaluacion;
  motivoBaja?: MotivoBaja;
  comentarioBaja?: string;
  respuestaBaja?: string;
  turnoPosibleBaja?: TurnoPosibleBaja;
  origenPosibleBaja?: OrigenPosibleBaja;
  motivoPosibleBaja?: MotivoPosibleBaja;
  comentariosPosibleBaja?: string;
  motivoSolicitud?: string;
  gestionesEquipo?: string;

  malVendidoCorresponde?: CorrespondeMalVendido;
  malVendidoJustificacion?: string;
  malVendidoCaminoSugerido?: CaminoMalVendido;
  motivoModificacionContrato?: MotivoModificacionContrato;

  cobroAnterior?: CobroAnterior;
  acreedor?: Acreedor;

  cuotasSolicitadas?: string;
  montoReembolso?: number;
  cuotasReembolso?: number;
  notaDevolucion?: string;
  motivoRechazoReembolso?: string;
  cuentaTitular?: string;
  cuentaBanco?: string;
  cuentaTipo?: string;
  cuentaNumero?: string;
  reembolsoConfirmacionBaja?: { estado: EstadoReembolsoConfirmacionBaja };

  actaDerivacion?: ActaDerivacion;
  detalleDerivacion?: DetalleDerivacion;
  pasoDerivacion?: PasoDerivacion;
  evaluacionCliente?: { estado: EstadoEvaluacionCliente };
  recepcionDerivacion?: { estado: EstadoRecepcionDerivacion };
  rechazoRecepcionMotivo?: MotivoRechazoRecepcion;
  rechazoRecepcionJustificacion?: string;
  antecedentesDerivacion?: string;
  nuevoCobro?: NuevoCobro;
  requiereAnalisisModificacionContrato?: boolean;
  modificacionContratoProcede?: ProcedeModificacionContrato;
  modificacionContratoJustificacion?: string;
  casosVinculados?: CasoVinculado[];

  fechaGestion?: string;
  notasEvaluacion?: string;
  descripcionVentas?: string;
  estrategia?: string;
  tacticas?: string;

  resultado?: Resultado;
  detalleResolucion?: string;
  notaCierre?: string;
  cerrado: boolean;
  fechaRegistro: string;

  pendienteConfirmacion?: PendienteConfirmacion;

  documentos?: Documento[];
  gestiones?: Gestion[];
};
