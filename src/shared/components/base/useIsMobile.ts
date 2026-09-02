import * as React from "react";

/**
 * Breakpoint móvil del sistema: <768px. Es el mismo umbral que
 * `--breakpoint-md` en registry/theme/lexy-theme.css — si el contrato
 * cambia, cambia en ambos lugares.
 */
export const MOBILE_BREAKPOINT = 768;

/**
 * Hook público del registry: ¿estamos bajo el breakpoint móvil?
 *
 * Úsalo solo cuando el cambio no se pueda expresar con clases responsive
 * (`md:`): montar componentes distintos según el dispositivo (un `Sheet`
 * en móvil vs. un panel fijo en desktop, como hace `Sidebar`), activar o
 * desactivar comportamiento, etc. Para ocultar o apilar, prefiere CSS.
 */
export function useIsMobile() {
  // Estado inicial calculado de inmediato (SPA: window siempre existe);
  // el efecto solo suscribe a los cambios.
  const [isMobile, setIsMobile] = React.useState(() => window.innerWidth < MOBILE_BREAKPOINT);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
