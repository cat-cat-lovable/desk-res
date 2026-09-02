# deskres

Proyecto Lexy (React + Vite + TS + theme Lexy). Los componentes viven en tu proyecto: míralos con `view`, instálalos con `add`, edítalos con libertad.

```bash
pnpm dev                          # desarrollo
pnpm check:prototype              # validar el contrato de datos del prototipo
npx create-lexy@latest view button       # ver un componente antes de instalarlo
npx create-lexy@latest add button        # instalarlo (local y editable)
```

## La capa de prototipo

Mientras esto sea un prototipo, los datos salen de `src/prototype/mock-store/fixtures.ts`
y el panel del Designer muestra en vivo qué cargas y eventos ejecuta cada pantalla.
Vale tanto en `pnpm dev` como en un build desplegado: **un prototipo desplegado
sigue siendo un prototipo**, así que se puede compartir el link y recorrerlo.

Cuando Desarrollo conecte el backend real:

```bash
VITE_LEXY_PROTOTYPE=false pnpm build   # adapters reales, sin panel
```

Eso cambia `read`/`write` a los adapters de `src/prototype/ports/production.ts`
—stubs que hay que implementar— y saca el panel. El desmontaje definitivo (borrar
la capa completa) está en `ai/PRODUCTION-CLEANUP.md`.
