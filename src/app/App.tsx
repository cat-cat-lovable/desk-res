import * as React from "react";
import { Route, Routes, useLocation } from "react-router";

import { DeskResDesk } from "@/features/DeskResDesk";
import { Login } from "@/features/Login";
import { Toaster } from "@/shared/components/base/Toaster";

import {
  DesignerPanelPage,
  PrototypeDesignerPanel,
} from "../prototype/designer-panel/PrototypeDesignerPanel";

// Estado booleano de sesión (mock, sin backend): no autenticado → Login;
// autenticado → Desk ReS. Ver readme-logica-res.md §12.
const DeskResRoot = () => {
  const [autenticado, setAutenticado] = React.useState(false);

  if (!autenticado) return <Login onLogin={() => setAutenticado(true)} />;
  return <DeskResDesk />;
};

const showPrototypeDesignerPanel = import.meta.env.VITE_LEXY_PROTOTYPE !== "false";

export const App = () => {
  const location = useLocation();
  const isDesignerPanelPage = location.pathname === "/designer-panel";

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<DeskResRoot />} />
        {showPrototypeDesignerPanel ? (
          <Route path="/designer-panel" element={<DesignerPanelPage />} />
        ) : null}
      </Routes>
      {showPrototypeDesignerPanel && !isDesignerPanelPage ? <PrototypeDesignerPanel /> : null}
    </>
  );
};
