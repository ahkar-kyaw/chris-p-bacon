import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { VALID_ROUTES } from "../shared/ValidRoutes.js";

function getInitialValues(isRegistering) {
  return {
    name: "",
    username: "",
    email: "",
    password: "",
    ...(isRegistering ? { confirmPassword: "" } : {}),
  };
}

export default function LoginPage({ isRegistering, onSubmit, isSubmitting, error }) {
  const [values, setValues] = useState(() => getInitialValues(isRegistering));

  useEffect(() => {
    setValues(getInitialValues(isRegistering));
  }, [isRegistering]);

  const canSubmit = useMemo(() => {
    if (isRegistering) {
      return (
        values.name.trim().length > 0 &&
        values.username.trim().length > 0 &&
        values.email.trim().length > 0 &&
        values.password.length > 0 &&
        values.password === values.confirmPassword
      );
    }

    return values.username.trim().length > 0 && values.password.length > 0;
  }, [isRegistering, values]);

  function update(key, nextValue) {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: nextValue,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit || isSubmitting) return;

    const payload = {
      username: values.username.trim(),
      password: values.password,
    };

    if (isRegistering) {
      payload.name = values.name.trim();
      payload.email = values.email.trim();
    }

    await onSubmit(payload);
  }

  return (
    <div className="login-shell">
      <section className="panel auth-grid">
        <div>
          <h1>{isRegistering ? "Register a new account" : "Login"}</h1>
          <p className="muted form-hint">
            {isRegistering
              ? "Create an account to manage inventory from any machine."
              : "Sign in with your username and password to view your inventory."}
          </p>

          <form onSubmit={handleSubmit} className="form-grid auth-form">
            {isRegistering ? (
              <label className="field">
                <span>Name</span>
                <input
                  type="text"
                  value={values.name}
                  onChange={(event) => update("name", event.target.value)}
                  placeholder="Chris Bacon"
                  disabled={isSubmitting}
                  required
                />
              </label>
            ) : null}

            <label className="field">
              <span>Username</span>
              <input
                type="text"
                value={values.username}
                onChange={(event) => update("username", event.target.value)}
                placeholder="chrispbacon"
                disabled={isSubmitting}
                required
              />
            </label>

            {isRegistering ? (
              <label className="field">
                <span>Email</span>
                <input
                  type="email"
                  value={values.email}
                  onChange={(event) => update("email", event.target.value)}
                  placeholder="you@example.com"
                  disabled={isSubmitting}
                  required
                />
              </label>
            ) : null}

            <label className="field">
              <span>Password</span>
              <input
                type="password"
                value={values.password}
                onChange={(event) => update("password", event.target.value)}
                placeholder="Your password"
                disabled={isSubmitting}
                required
              />
            </label>

            {isRegistering ? (
              <label className="field">
                <span>Confirm password</span>
                <input
                  type="password"
                  value={values.confirmPassword}
                  onChange={(event) => update("confirmPassword", event.target.value)}
                  placeholder="Re-enter your password"
                  disabled={isSubmitting}
                  required
                />
              </label>
            ) : null}

            <div className="form-actions">
              <button type="submit" className="button" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? "Working..." : isRegistering ? "Create account" : "Login"}
              </button>
            </div>
          </form>

          {!canSubmit ? (
            <p className="muted form-hint">
              {isRegistering
                ? "Enter your name, username, email, and matching passwords."
                : "Enter your username and password to continue."}
            </p>
          ) : null}

          {error ? (
            <div
              className="status-panel status-panel--error"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          ) : null}

          <p className="form-hint">
            {isRegistering ? (
              <>
                Already have an account? <Link to={VALID_ROUTES.LOGIN}>Login here</Link>
              </>
            ) : (
              <>
                Do not have an account? <Link to={VALID_ROUTES.REGISTER}>Register here</Link>
              </>
            )}
          </p>
        </div>
      </section>
    </div>
  );
}