# login — block

Pantalla de acceso: una sola tarea, foco único, ayuda contextual breve. Instálalo con `create-lexy add login` — trae `Card`, `Input`, `Label` y `Button`. La vista queda en tu proyecto (`views/Login.tsx`): edítala con libertad.

## Por mundo

- **Cliente** (como viene): card centrada, copy de acompañamiento (_"Te acompañamos con tu caso desde aquí."_), un solo CTA ancho.
- **CRM**: misma estructura con copy funcional (_"Ingresa al panel de Lexy"_, descripción corta o sin ella) y, si la marca lo pide, `Logo` arriba de la card:

```tsx
import { Logo } from "@/shared/components/base/Logo";

<main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4">
  <Logo layout="horizontal" />
  <Card className="w-full max-w-sm">…</Card>
</main>;
```

## Adaptación

- Para validación y errores (credenciales inválidas), instala `form` y usa `FormField` + `FormMessage`; el error de credenciales va junto al campo de contraseña, en tono neutro.
- "¿Olvidaste tu contraseña?" como `Button variant='link'` bajo el CTA, si el flujo existe.

## Evita

Hero a dos columnas con marketing, social login decorativo que no funciona, y placeholders como único label.

## Degradación móvil

Ya es móvil primero: columna `max-w-sm` centrada con margen lateral de token (`px-margin-mobile`) y botón full-width. No requiere más adaptación.
