// Valores de relleno para que los diálogos abran con datos ya cargados y se
// pueda recorrer el flujo de gestión sin tipear cada campo a mano. Solo se
// usan como default editable de formularios — no son fixtures ni se guardan
// en el mock-store por sí solos.

export const CUENTA_PRUEBA = {
  titular: "María Soto Pérez",
  banco: "Banco Estado",
  tipo: "Cuenta RUT",
  numero: "11.222.333-4",
};

export const MONTO_PRUEBA = "150000";
export const CUOTAS_PRUEBA = "3";
export const ACREEDOR_PRUEBA = "CMR Falabella";
export const MONTO_NUEVO_CONTRATO_PRUEBA = "800000";
export const CUOTAS_NUEVO_CONTRATO_PRUEBA = "12";
export const VALOR_PRIMERA_CUOTA_PRUEBA = "66000";

export const COBRO_ANTERIOR_PRUEBA = {
  montoTotal: 950000,
  cuotas: 12,
  montoPrimeraCuota: 79000,
  fechaInicio: "2025-03-10",
  cuotasPagadas: 6,
  cuotasMorosas: 1,
  pagoPrimeraCuota: "Pagada",
};

export function comprobantePrueba(nombre = "comprobante-prueba.pdf"): File {
  return new File(["Comprobante de transferencia de prueba."], nombre, {
    type: "application/pdf",
  });
}
