import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase.js";
import AdminApp from "./AdminApp.jsx";
import { adminApi } from "./services/adminApi.js";
import { AdminState } from "./components/AdminState/AdminState.jsx";

function AdminRoute() {
  const [accessState, setAccessState] = useState("checking");

  useEffect(() => {
    const controller = new AbortController();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setAccessState("denied");
        return;
      }
      try {
        const data = await adminApi.getSession({ signal: controller.signal });
        setAccessState(data.authorized === true ? "authorized" : "denied");
      } catch (error) {
        if (error.name !== "AbortError") setAccessState("denied");
      }
    });
    return () => {
      controller.abort();
      unsubscribe();
    };
  }, []);

  if (accessState === "checking") {
    return <AdminState fullPage type="loading" title="Validando acceso" />;
  }
  if (accessState !== "authorized") {
    return <AdminState fullPage type="error" title="Página no disponible" message="La sesión no tiene permisos administrativos o no pudo validarse." />;
  }
  return <AdminApp />;
}

export default AdminRoute;
