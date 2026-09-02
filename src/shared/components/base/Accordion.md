# Accordion

Secciones colapsables para mostrar detalle bajo demanda (Radix). Progressive disclosure: muestra primero los títulos y despliega el contenido al pedirlo.

## Cuándo usarlo

Para revelar detalle bajo demanda cuando los títulos bastan para orientar: FAQs, secciones de ayuda, metadatos de un caso. Progressive disclosure: la persona ve primero el mapa (los títulos) y abre solo lo que le interesa, sin abandonar la página.

## Composición

Cuatro piezas: `Accordion` (contenedor que gobierna el estado), un `AccordionItem` por sección, y dentro de cada una `AccordionTrigger` (el título clickeable con chevron) y `AccordionContent` (el detalle que se pliega). Para el caso data-driven usa `AppAccordion`, que arma esta composición desde un arreglo de items.

## Uso básico

```tsx
<Accordion type="single" collapsible>
  <AccordionItem value="envio">
    <AccordionTrigger>¿Cuánto tarda el envío?</AccordionTrigger>
    <AccordionContent>Entre 3 y 5 días hábiles.</AccordionContent>
  </AccordionItem>
  <AccordionItem value="devolucion">
    <AccordionTrigger>¿Puedo devolver un producto?</AccordionTrigger>
    <AccordionContent>Sí, dentro de 30 días.</AccordionContent>
  </AccordionItem>
</Accordion>
```

## Varias secciones abiertas

```tsx
<Accordion type="multiple" defaultValue={["envio"]}>
  …
</Accordion>
```

## Reglas

- Cada `AccordionItem` necesita `value` único.
- El `AccordionTrigger` lleva un título escaneable (sentence case), no una frase larga.
- No escondas información crítica (costos, errores, próximos pasos) dentro de secciones cerradas.
- Úsalo para detalle secundario u opcional; el contenido principal va visible.

## Cuándo NO usar

- **Categorías pares que se alternan** → `Tabs`.
- **Una sola sección colapsable puntual** → basta un toggle simple; el accordion es para varias.
- **Navegación lateral con jerarquía** → `AppSidebar` (grupos colapsables).
- **Acción puntual en una capa** → `Dialog`/`Sheet`.

## Import

```tsx
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/shared/components/base/Accordion";
```

## Props (esenciales)

| Parte           | Prop                     | Descripción                                                      |
| --------------- | ------------------------ | ---------------------------------------------------------------- |
| `Accordion`     | `type`                   | `"single"` (una abierta) o `"multiple"` (varias). **Requerido.** |
| `Accordion`     | `collapsible`            | En `single`, permite cerrar la abierta.                          |
| `Accordion`     | `value` / `defaultValue` | Sección(es) abierta(s).                                          |
| `AccordionItem` | `value`                  | **Requerido.** Identificador único.                              |
| `AccordionTrigger` | `iconPosition`         | `"end"` (default, chevron a la derecha) o `"start"` (chevron pegado al título, a la izquierda). |

## Para IA

1. Úsalo para FAQ o detalle opcional que conviene plegar.
2. Elige `type="single" collapsible` para una a la vez, `multiple` si conviene comparar.
3. Da `value` único a cada ítem y títulos escaneables al trigger.
4. Nunca ocultes información bloqueante o de riesgo dentro del accordion.
