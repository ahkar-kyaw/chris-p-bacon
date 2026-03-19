import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router";

import "./styles/tokens.css";
import "./styles/styles.css";

import AppHeader from "./components/AppHeader.jsx";
import AppNav from "./components/AppNav.jsx";
import Fab from "./components/Fab.jsx";

import Home from "./pages/Home.jsx";
import Items from "./pages/Items.jsx";
import AddItem from "./pages/AddItem.jsx";
import Login from "./pages/Login.jsx";

import { ProtectedRoute } from "./ProtectedRoute.jsx";
import { VALID_ROUTES } from "./shared/ValidRoutes.js";

function normalizeTheme(next) {
  return next === "dark" ? "dark" : "light";
}

function LoadingPanel() {
  return (
    <section className="panel">
      <h2 className="panel__title">Loading inventory</h2>
      <p>Please wait while the app loads your items.</p>
    </section>
  );
}

function ErrorPanel({ message }) {
  return (
    <section className="panel">
      <h2 className="panel__title">Could not load inventory</h2>
      <p>{message}</p>
    </section>
  );
}

async function getResponseMessage(response, fallbackMessage) {
  try {
    const data = await response.json();
    return data?.message ?? data?.error ?? fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export default function App() {
  const navigate = useNavigate();

  const [authToken, setAuthToken] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegisteringUser, setIsRegisteringUser] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");

  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [theme, setTheme] = useState("light");
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [itemsError, setItemsError] = useState("");

  useEffect(() => {
    document.documentElement.dataset.theme = normalizeTheme(theme);
  }, [theme]);

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      if (!authToken) {
        setItems([]);
        setItemsError("");
        setIsLoadingItems(false);
        return;
      }

      setIsLoadingItems(true);
      setItemsError("");

      try {
        const response = await fetch("/api/items", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (response.status === 401) {
          if (!cancelled) {
            setAuthToken("");
            setItems([]);
            navigate(VALID_ROUTES.LOGIN, { replace: true });
          }
          return;
        }

        if (!response.ok) {
          const message = await getResponseMessage(
            response,
            `Error: HTTP ${response.status} ${response.statusText}`,
          );
          throw new Error(message);
        }

        const data = await response.json();

        if (!cancelled) {
          setItems(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setItemsError(String(err?.message ?? err));
        }
      } finally {
        if (!cancelled) {
          setIsLoadingItems(false);
        }
      }
    }

    loadItems();

    return () => {
      cancelled = true;
    };
  }, [authToken, navigate]);

  const byId = useMemo(() => new Map(items.map((it) => [it.id, it])), [items]);

  async function requestAuth(path, payload) {
    const response = await fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const message = await getResponseMessage(
        response,
        `Error: HTTP ${response.status} ${response.statusText}`,
      );
      throw new Error(message);
    }

    const data = await response.json();
    if (!data?.token) {
      throw new Error("Server did not return an auth token");
    }

    return data.token;
  }

  async function handleLoginSubmit(payload) {
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const token = await requestAuth("/api/auth/tokens", payload);
      setAuthToken(token);
      navigate(VALID_ROUTES.HOME, { replace: true });
    } catch (err) {
      setLoginError(String(err?.message ?? err));
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function handleRegisterSubmit(payload) {
    setRegisterError("");
    setIsRegisteringUser(true);

    try {
      const token = await requestAuth("/api/users", payload);
      setAuthToken(token);
      navigate(VALID_ROUTES.HOME, { replace: true });
    } catch (err) {
      setRegisterError(String(err?.message ?? err));
    } finally {
      setIsRegisteringUser(false);
    }
  }

  function handleUnauthorized() {
    setAuthToken("");
    setItems([]);
    navigate(VALID_ROUTES.LOGIN, { replace: true });
    throw new Error("Your session expired. Please log in again.");
  }

  async function addItem(formData) {
    setItemsError("");

    let response;

    try {
      response = await fetch("/api/items", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });
    } catch (err) {
      const message = String(err?.message ?? err);
      setItemsError(message);
      throw new Error(message);
    }

    if (response.status === 401) handleUnauthorized();

    if (!response.ok) {
      const message = await getResponseMessage(
        response,
        `Error: HTTP ${response.status} ${response.statusText}`,
      );
      setItemsError(message);
      throw new Error(message);
    }

    const savedItem = await response.json();

    setItems((prev) => {
      const exists = prev.some((it) => it.id === savedItem.id);

      if (!exists) return [savedItem, ...prev];

      return prev.map((it) => (it.id === savedItem.id ? savedItem : it));
    });

    return savedItem;
  }

  async function updateItemQty(id, qty) {
    setItemsError("");

    try {
      const response = await fetch(`/api/items/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ qty }),
      });

      if (response.status === 401) handleUnauthorized();
      if (response.status === 404) return;

      if (!response.ok) {
        const message = await getResponseMessage(
          response,
          `Error: HTTP ${response.status} ${response.statusText}`,
        );
        throw new Error(message);
      }

      const updatedItem = await response.json();

      setItems((prev) => prev.map((it) => (it.id === id ? updatedItem : it)));
    } catch (err) {
      setItemsError(String(err?.message ?? err));
      throw err;
    }
  }

  async function deleteItem(id) {
    setItemsError("");

    try {
      const response = await fetch(`/api/items/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.status === 401) handleUnauthorized();
      if (response.status === 404) return;

      if (!response.ok) {
        throw new Error(`Error: HTTP ${response.status} ${response.statusText}`);
      }

      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch (err) {
      setItemsError(String(err?.message ?? err));
    }
  }

  const homeElement = isLoadingItems ? (
    <LoadingPanel />
  ) : itemsError !== "" && items.length === 0 ? (
    <ErrorPanel message={itemsError} />
  ) : (
    <Home
      items={items}
      onGoItems={() => navigate(VALID_ROUTES.ITEMS)}
      onGoAdd={() => navigate(VALID_ROUTES.ADD_ITEM)}
    />
  );

  const itemsElement = isLoadingItems ? (
    <LoadingPanel />
  ) : itemsError !== "" && items.length === 0 ? (
    <ErrorPanel message={itemsError} />
  ) : (
    <Items
      items={items}
      query={query}
      category={category}
      onDelete={deleteItem}
      onUpdateQty={updateItemQty}
    />
  );

  return (
    <div className="app">
      <AppHeader
        query={query}
        onQueryChange={setQuery}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      />

      <AppNav category={category} onSelectCategory={setCategory} />

      <main className="app-main">
        <div className="app-main__content">
          {itemsError !== "" && items.length > 0 ? (
            <section className="panel">
              <h2 className="panel__title">Inventory sync error</h2>
              <p>{itemsError}</p>
            </section>
          ) : null}

          <Routes>
            <Route
              path={VALID_ROUTES.LOGIN}
              element={
                authToken ? (
                  <Navigate to={VALID_ROUTES.HOME} replace />
                ) : (
                  <Login
                    isRegistering={false}
                    onSubmit={handleLoginSubmit}
                    isSubmitting={isLoggingIn}
                    error={loginError}
                  />
                )
              }
            />

            <Route
              path={VALID_ROUTES.REGISTER}
              element={
                authToken ? (
                  <Navigate to={VALID_ROUTES.HOME} replace />
                ) : (
                  <Login
                    isRegistering={true}
                    onSubmit={handleRegisterSubmit}
                    isSubmitting={isRegisteringUser}
                    error={registerError}
                  />
                )
              }
            />

            <Route
              path={VALID_ROUTES.HOME}
              element={<ProtectedRoute authToken={authToken}>{homeElement}</ProtectedRoute>}
            />

            <Route
              path={VALID_ROUTES.ITEMS}
              element={<ProtectedRoute authToken={authToken}>{itemsElement}</ProtectedRoute>}
            />

            <Route
              path={VALID_ROUTES.ADD_ITEM}
              element={
                <ProtectedRoute authToken={authToken}>
                  <AddItem onAddItem={addItem} onDone={() => navigate(VALID_ROUTES.ITEMS)} />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>

        <Fab onClick={() => navigate(VALID_ROUTES.ADD_ITEM)} />
      </main>

      {byId.size !== items.length ? (
        <div className="toast" role="status">
          Duplicate IDs detected. Check SKUs.
        </div>
      ) : null}
    </div>
  );
}