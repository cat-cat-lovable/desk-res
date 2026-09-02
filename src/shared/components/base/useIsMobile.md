# useIsMobile — hook

Detecta si el viewport está bajo el breakpoint móvil del sistema (**<768px**, el mismo `--breakpoint-md` del theme). Instálalo con `create-lexy add use-is-mobile`. El hook vive en tu proyecto: edítalo con libertad.

## Cuándo usarlo

Solo cuando el cambio no se pueda expresar con clases responsive (`md:`): montar componentes distintos según el dispositivo (un `Sheet` en móvil frente a un panel fijo en desktop, como hace `Sidebar`), activar o desactivar comportamiento (atajos de teclado, tooltips), o decidir cuánta densidad de datos mostrar.

## Uso

```tsx
import { useIsMobile } from "@/shared/components/base/useIsMobile";

function Acciones() {
  const isMobile = useIsMobile();
  return isMobile ? <AccionesEnSheet /> : <BarraDeAcciones />;
}
```

## Evita

- Usarlo para ocultar o apilar elementos: eso es `hidden md:flex` o `flex-col md:flex-row` — CSS, no JS.
- Duplicar el umbral: importa `MOBILE_BREAKPOINT` desde el hook; no declares otro 768 en tu código.
- Decidir layout completo en JS: la degradación estructural vive en clases responsive (ver pautas/recetas-layout.md).
