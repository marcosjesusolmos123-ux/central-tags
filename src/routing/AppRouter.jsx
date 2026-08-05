import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "../App.jsx";
import AdminRoute from "../admin/AdminRoute.jsx";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminRoute />} />
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
