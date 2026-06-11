import React, { useState, useEffect, useCallback, useMemo } from "react";
import CategoryApi from "../../api/CategoryApi.jsx";
import ProductApi from "../../api/ProductApi.jsx";
import AddCategoryModal from "./AddCategoryModel.jsx";
import AddProductModal from "./AddProductModel.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { productImage, handleImageError, formatPrice } from "../../utils/catalog.js";
import { IconBox, IconTag, IconPlus, IconSparkle } from "../Icons.jsx";

function AdminDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catModal, setCatModal] = useState(false);
  const [prodModal, setProdModal] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        CategoryApi.fetchCategory(),
        ProductApi.fetchAllProducts(),
      ]);
      setCategories(catRes.data || []);
      setProducts(prodRes.data || []);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const avgPrice = useMemo(() => {
    if (!products.length) return 0;
    return products.reduce((s, p) => s + Number(p.price), 0) / products.length;
  }, [products]);

  const recent = useMemo(
    () => [...products].sort((a, b) => b.id - a.id).slice(0, 8),
    [products]
  );

  return (
    <div className="container">
      <div className="admin-head">
        <div>
          <span className="eyebrow">Atelier Console</span>
          <h1 className="section-title">Welcome, {user?.username}</h1>
          <p className="section-sub">Manage your catalogue, categories and inventory.</p>
        </div>
        <div className="admin-actions">
          <button className="btn btn-ghost" onClick={() => setCatModal(true)}>
            <IconTag width={17} height={17} /> New category
          </button>
          <button className="btn btn-primary" onClick={() => setProdModal(true)}>
            <IconPlus width={17} height={17} /> New product
          </button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-ic"><IconBox width={22} height={22} /></div>
          <div className="stat-n">{loading ? "—" : products.length}</div>
          <div className="stat-l">Total products</div>
        </div>
        <div className="stat-card">
          <div className="stat-ic"><IconTag width={22} height={22} /></div>
          <div className="stat-n">{loading ? "—" : categories.length}</div>
          <div className="stat-l">Categories</div>
        </div>
        <div className="stat-card">
          <div className="stat-ic"><IconSparkle width={22} height={22} /></div>
          <div className="stat-n">{loading ? "—" : formatPrice(avgPrice)}</div>
          <div className="stat-l">Average price</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>Recently added</h3>
          <button className="btn btn-ghost" onClick={() => setProdModal(true)}>
            <IconPlus width={16} height={16} /> Add product
          </button>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Ref.</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ color: "var(--muted)" }}>Loading…</td></tr>
              ) : recent.length === 0 ? (
                <tr><td colSpan={4} style={{ color: "var(--muted)" }}>No products yet. Add your first one.</td></tr>
              ) : (
                recent.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="t-thumb"><img src={productImage(p)} alt={p.name} onError={handleImageError(p)} /></div>
                        <span className="t-name">{p.name}</span>
                      </div>
                    </td>
                    <td><span className="t-cat">{p.category?.name}</span></td>
                    <td>{formatPrice(p.price)}</td>
                    <td style={{ color: "var(--muted)" }}>MSN-{String(p.id).padStart(4, "0")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddCategoryModal isOpen={catModal} onClose={() => setCatModal(false)} onSuccess={refresh} />
      <AddProductModal isOpen={prodModal} onClose={() => setProdModal(false)} onSuccess={refresh} />
    </div>
  );
}

export default AdminDashboard;
