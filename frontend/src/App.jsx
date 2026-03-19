import { useEffect, useMemo, useState } from "react";
import { Route, Routes, useNavigate } from "react-router";

import "./styles/tokens.css";
import "./styles/styles.css";

import AppHeader from "./components/AppHeader.jsx";
import AppNav from "./components/AppNav.jsx";
import Fab from "./components/Fab.jsx";

import Home from "./pages/Home.jsx";
import Items from "./pages/Items.jsx";
import AddItem from "./pages/AddItem.jsx";
import Login from "./pages/Login.jsx";

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

export default function App() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [theme, setTheme] = useState("light");
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [itemsError, setItemsError] = useState("");

  useEffect(() => {
    document.documentElement.dataset.theme = normalizeTheme(theme);
  }, [theme]);

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      setIsLoadingItems(true);
      setItemsError("");

      try {
        const response = await fetch("/api/items");

        if (!response.ok) {
          throw new Error(`Error: HTTP ${response.status} ${response.statusText}`);
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
  }, []);

  const byId = useMemo(() => new Map(items.map((it) => [it.id, it])), [items]);

  async function addItem(formData) {
    setItemsError("");

    let response;

    try {
      response = await fetch("/api/items", {
        method: "POST",
        body: formData,
      });
    } catch (err) {
      const message = String(err?.message ?? err);
      setItemsError(message);
      throw new Error(message);
    }

    if (!response.ok) {
      let message = `Error: HTTP ${response.status} ${response.statusText}`;

      try {
        const data = await response.json();
        if (data?.message) message = data.message;
        else if (data?.error) message = data.error;
      } catch {}

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
        },
        body: JSON.stringify({ qty }),
      });

      if (response.status === 404) return;

      if (!response.ok) {
        let message = `Error: HTTP ${response.status} ${response.statusText}`;

        try {
          const data = await response.json();
          if (data?.message) message = data.message;
          else if (data?.error) message = data.error;
        } catch {}

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
      });

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
            <Route path={VALID_ROUTES.HOME} element={homeElement} />
            <Route path={VALID_ROUTES.ITEMS} element={itemsElement} />
            <Route
              path={VALID_ROUTES.ADD_ITEM}
              element={<AddItem onAddItem={addItem} onDone={() => navigate(VALID_ROUTES.ITEMS)} />}
            />
            <Route path={VALID_ROUTES.LOGIN} element={<Login />} />
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