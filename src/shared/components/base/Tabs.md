# Tabs

Pestañas para alternar entre vistas **del mismo nivel** sin salir de la página (Radix). Progressive disclosure: muestra una categoría a la vez.

## Cuándo usarlo

Para alternar entre vistas del mismo nivel sin salir de la página: las pestañas de un detalle (Actividad, Documentos, Notas). Una categoría a la vez, el resto a un click. Si los contenidos son pasos secuenciales, eso es un wizard, no tabs.

## Composición

`Tabs` (estado) contiene `TabsList` con un `TabsTrigger` por pestaña, y un `TabsContent` por panel. Trigger y panel se emparejan por `value`.

## Uso básico

```tsx
<Tabs defaultValue="resumen">
  <TabsList>
    <TabsTrigger value="resumen">Resumen</TabsTrigger>
    <TabsTrigger value="documentos">Documentos</TabsTrigger>
    <TabsTrigger value="actividad">Actividad</TabsTrigger>
  </TabsList>
  <TabsContent value="resumen">…</TabsContent>
  <TabsContent value="documentos">…</TabsContent>
  <TabsContent value="actividad">…</TabsContent>
</Tabs>
```

## Reglas

- Cada `TabsTrigger.value` debe tener su `TabsContent.value` correspondiente.
- Las pestañas son **pares**: contenido del mismo rango que no necesitas ver junto.
- Pocas pestañas (idealmente ≤5) con etiquetas cortas y escaneables.
- No escondas detrás de tabs información crítica o de error que el usuario debe ver siempre.

## Cuándo NO usar

- **Pasos secuenciales de un flujo** → usa un stepper/wizard; las tabs no implican orden.
- **Navegación entre páginas/rutas** → `NavigationMenu` o enlaces.
- **Mostrar/ocultar detalle puntual** → `Accordion` o `Dialog`.

## Import

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/base/Tabs";
```

## Props (esenciales)

| Parte         | Prop                     | Descripción                                         |
| ------------- | ------------------------ | --------------------------------------------------- |
| `Tabs`        | `value` / `defaultValue` | Pestaña activa (controlada / inicial).              |
| `Tabs`        | `onValueChange`          | Cambio de pestaña.                                  |
| `TabsTrigger` | `value`                  | **Requerido.** Debe coincidir con un `TabsContent`. |
| `TabsContent` | `value`                  | **Requerido.** Empareja con su trigger.             |

## Para IA

1. Confirma que son categorías pares del mismo contexto (no pasos, no rutas).
2. Mantén ≤5 pestañas con labels en sentence case.
3. Empareja cada `value` trigger↔content.
4. No ocultes errores, costos o próximos pasos dentro de una pestaña inactiva.
