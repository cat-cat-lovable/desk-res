import * as React from "react";

import { Button } from "@/shared/components/base/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/base/Card";
import { Input } from "@/shared/components/base/Input";
import { Label } from "@/shared/components/base/Label";
import { Logo } from "@/shared/components/base/Logo";

// Acceso al Desk ReS (mundo CRM): una sola tarea, foco único. Auth mock —
// cualquier correo/clave no vacíos entra (readme-logica-res.md §12). Se lee
// vía FormData para soportar autocompletado del navegador.

export interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const pass = String(data.get("pass") ?? "").trim();

    if (!email || !pass) {
      setError("Ingresa tu correo y tu contraseña para entrar.");
      return;
    }
    setError(null);
    onLogin();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-secondary px-margin-mobile">
      <Logo layout="vertical" className="h-20 w-auto" />
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-brand-navy">Desk ReS</CardTitle>
          <CardDescription>
            Ingresa con tu acceso interno para reevaluación de servicio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="tu@lexy.cl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pass">Contraseña</Label>
              <Input
                id="pass"
                name="pass"
                type="password"
                autoComplete="current-password"
                placeholder="Ingresa tu contraseña"
              />
            </div>
            {error && (
              <p role="alert" className="type-supporting text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
