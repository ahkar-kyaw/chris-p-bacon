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

import { INITIAL_ITEMS } from "./data/items.js";

function normalizeTheme(next) {
  return next === "dark" ? "dark" : "light";
}

export default function App() {
  const navigate = useNavigate();

  const [items, setItems] = useState(() => INITIAL_ITEMS);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.documentElement.dataset.theme = normalizeTheme(theme);
  }, [theme]);

  const byId = useMemo(() => new Map(items.map((it) => [it.id, it])), [items]);

  function addItem(nextItem) {
    setItems((prev) => {
      const existing = prev.find((it) => it.id === nextItem.id);
      if (!existing) return [nextItem, ...prev];

      return prev.map((it) => {
        if (it.id !== nextItem.id) return it;
        const mergedQty = Math.max(0, Number(it.qty || 0) + Number(nextItem.qty || 0));
        return { ...it, ...nextItem, qty: mergedQty };
      });
    });
  }

  function deleteItem(id) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function adjustQty(id, delta) {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const nextQty = Math.max(0, Number(it.qty || 0) + delta);
        return { ...it, qty: nextQty };
      }),
    );
  }

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
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  items={items}
                  onGoItems={() => navigate("/items")}
                  onGoAdd={() => navigate("/add-item")}
                />
              }
            />
            <Route
              path="/items"
              element={
                <Items
                  items={items}
                  query={query}
                  category={category}
                  onDelete={deleteItem}
                  onAdjustQty={adjustQty}
                />
              }
            />
            <Route
              path="/add-item"
              element={<AddItem onAddItem={addItem} onDone={() => navigate("/items")} />}
            />
          </Routes>
        </div>

        <Fab onClick={() => navigate("/add-item")} />
      </main>

      {byId.size !== items.length ? (
        <div className="toast" role="status">
          Duplicate IDs detected. Check SKUs.
        </div>
      ) : null}
    </div>
  );
}