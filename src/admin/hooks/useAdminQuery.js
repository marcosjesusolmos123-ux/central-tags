import { useEffect, useState } from "react";

export function useAdminQuery(load, queryKey) {
  const [state, setState] = useState({ status: "loading", data: null, error: null, revision: 0 });
  const reload = () => setState((current) => ({ ...current, status: "loading", error: null, revision: current.revision + 1 }));

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    load(controller.signal).then((data) => {
      if (active) setState((current) => ({ ...current, status: "success", data, error: null }));
    }).catch((error) => {
      if (active && error.name !== "AbortError") setState((current) => ({ ...current, status: "error", data: null, error }));
    });
    return () => { active = false; controller.abort(); };
  }, [load, queryKey, state.revision]);

  return { ...state, reload };
}
