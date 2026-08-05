import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase.js";
import AdminDashboard from "./AdminDashboard.jsx";
import "./admin.css";

const serverUrl =
  import.meta.env.VITE_CENTRAL_TAGS_SERVER_URL ||
  "https://central-tags-server.onrender.com";

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
        const idToken = await currentUser.getIdToken();
        const response = await fetch(`${serverUrl}/admin/session`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          setAccessState("denied");
          return;
        }

        const data = await response.json();
        setAccessState(data.authorized === true ? "authorized" : "denied");
      } catch (error) {
        if (error.name !== "AbortError") {
          setAccessState("denied");
        }
      }
    });

    return () => {
      controller.abort();
      unsubscribe();
    };
  }, []);

  if (accessState === "checking") {
    return <main className="admin-status">Cargando...</main>;
  }

  if (accessState !== "authorized") {
    return <main className="admin-status">Página no disponible.</main>;
  }

  return <AdminDashboard />;
}

export default AdminRoute;
