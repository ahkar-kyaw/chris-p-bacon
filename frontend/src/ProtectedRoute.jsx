import { Navigate } from "react-router";
import { VALID_ROUTES } from "./shared/ValidRoutes.js";

export function ProtectedRoute({ authToken, children }) {
  if (!authToken) {
    return <Navigate to={VALID_ROUTES.LOGIN} replace />;
  }

  return children;
}