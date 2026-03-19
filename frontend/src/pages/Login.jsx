import { useNavigate } from "react-router";
import { VALID_ROUTES } from "../shared/ValidRoutes.js";

export default function Login() {
  const navigate = useNavigate();

  return (
    <>
      <h1>Login</h1>

      <section className="panel">
        <h2 className="panel__title">Welcome back</h2>
        <p>Login Route (WIP)</p>
        <p>
          <button type="button" className="button" onClick={() => navigate(VALID_ROUTES.HOME)}>
            Return home
          </button>
        </p>
      </section>
    </>
  );
}