import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProductApi from "../../api/ProductApi.jsx";
import CategoryApi from "../../api/CategoryApi.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import CategoryList from "./CategoryList.jsx";
import ProductGrid from "./ProductGrid.jsx";
import ProductModal from "./ProductModal.jsx";
import { IconSearch, IconArrowRight } from "../Icons.jsx";

const SORTS = {
  featured: { label: "Featured", fn: (a, b) => a.id - b.id },
  "price-asc": { label: "Price: Low to High", fn: (a, b) => a.price - b.price },
  "price-desc": { label: "Price: High to Low", fn: (a, b) => b.price - a.price },
  name: { label: "Alphabetical", fn: (a, b) => a.name.localeCompare(b.name) },
};

function CustomerPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [active, setActive] = useState(null); // product open in modal

  const { add, openCart } = useCart();
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          ProductApi.fetchAllProducts(),
          CategoryApi.fetchCategory(),
        ]);
        if (!alive) return;
        setProducts(prodRes.data || []);
        setCategories(catRes.data || []);
      } catch {
        if (alive) toast.error("Couldn’t load the collection.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [toast]);

  const visible = useMemo(() => {
    let list = products;
    if (selectedCat != null) list = list.filter((p) => p.category?.id === selectedCat);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category?.name?.toLowerCase().includes(q)
      );
    }
    return [...list].sort(SORTS[sort].fn);
  }, [products, selectedCat, query, sort]);

  const handleAdd = (product, qty = 1) => {
    if (!isAuthenticated) {
      toast.show("Please sign in to start shopping");
      navigate("/login", { state: { from: location } });
      return;
    }
    add(product, qty);
    toast.success(`${product.name} added to bag`);
  };

  return (
    <div className="container">
      {/* Hero */}
      <section className="hero" id="new">
        <div className="hero-art" />
        <div className="hero-inner">
          <span className="eyebrow" style={{ color: "var(--gold)" }}>Spring / Summer Edit</span>
          <h1>Considered clothing, made to last.</h1>
          <p>
            A curated wardrobe of timeless essentials — natural fabrics, honest
            construction, and pieces designed to stay with you for years.
          </p>
          <div className="hero-actions">
            <a className="btn btn-accent btn-lg" href="#collection">
              Shop the collection <IconArrowRight width={18} height={18} />
            </a>
            <button className="btn btn-ghost btn-lg" style={{ color: "#fff", borderColor: "rgba(255,255,255,.4)" }} onClick={openCart}>
              View bag
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><div className="n">{products.length || "—"}</div><div className="l">Pieces</div></div>
            <div className="hero-stat"><div className="n">{categories.length || "—"}</div><div className="l">Categories</div></div>
            <div className="hero-stat"><div className="n">100%</div><div className="l">Considered</div></div>
          </div>
        </div>
      </section>

      {/* Collection header */}
      <div id="collection" style={{ marginBottom: 18 }}>
        <span className="eyebrow">The Collection</span>
        <h2 className="section-title">
          {selectedCat
            ? categories.find((c) => c.id === selectedCat)?.name
            : "All Pieces"}
        </h2>
      </div>

      {/* Category chips */}
      <CategoryList categories={categories} selected={selectedCat} onSelect={setSelectedCat} />

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search">
          <IconSearch width={18} height={18} />
          <input
            placeholder="Search pieces, fabrics, categories…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
          {Object.entries(SORTS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {!loading && (
        <p className="section-sub" style={{ marginBottom: 18 }}>
          {visible.length} {visible.length === 1 ? "piece" : "pieces"}
        </p>
      )}

      <ProductGrid products={visible} loading={loading} onOpen={setActive} onAdd={handleAdd} />

      <ProductModal product={active} onClose={() => setActive(null)} onAdd={handleAdd} />
    </div>
  );
}

export default CustomerPage;
