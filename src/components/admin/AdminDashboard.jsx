import React, { useState, useEffect, useCallback, useMemo } from "react";
import CategoryApi from "../../api/CategoryApi.jsx";
import ProductApi from "../../api/ProductApi.jsx";
import UserApi from "../../api/UserApi.jsx";
import AddCategoryModal from "./AddCategoryModel.jsx";
import AddProductModal from "./AddProductModel.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { productImage, handleImageError, formatPrice, initials } from "../../utils/catalog.js";
import { IconBox, IconTag, IconPlus, IconSparkle, IconUser } from "../Icons.jsx";

function AdminDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
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
      console.error("Failed to load catalogue:", err);
    }
    try {
      const userRes = await UserApi.listUsers();
      setUsers(userRes.data || []);
    } catch (err) {
      console.error("Failed to load users:", err);
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

  const adminCount = useMemo(
    () => users.filter((u) => u.role === "admin").length,
    [users]
  );

  return (
    <div className="container">
      <div className="admin-head">
        <div>
          <span className="eyebrow">Atelier Console</span>
          <h1 className="section-title">Welcome, {user?.username}</h1>
          <p className="section-sub">Manage your catalogue, categories, members and inventory.</p>
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
          <div className="stat-ic"><IconUser width={22} height={22} /></div>
          <div className="stat-n">{loading ? "—" : users.length}</div>
          <div className="stat-l">Members</div>
        </div>
        <div className="stat-card">
          <div className="stat-ic"><IconSparkle width={22} height={22} /></div>
          <div className="stat-n">{loading ? "—" : formatPrice(avgPrice)}</div>
          <div className="stat-l">Average price</div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 24 }}>
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

      <div className="panel">
        <div className="panel-head">
          <h3>Members</h3>
          <span className="section-sub" style={{ margin: 0 }}>
            {loading ? "" : `${users.length} total · ${adminCount} admin · ${users.length - adminCount} customers`}
          </span>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} style={{ color: "var(--muted)" }}>Loading…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={3} style={{ color: "var(--muted)" }}>No members found.</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span className="avatar">{initials(u.username)}</span>
                        <span className="t-name">
                          {u.username}
                          {u.id === user?.id && (
                            <span style={{ color: "var(--muted)", fontWeight: 400 }}> · you</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td><span className={`role-pill ${u.role === "admin" ? "admin" : ""}`}>{u.role}</span></td>
                    <td style={{ color: "var(--muted)" }}>#{String(u.id).padStart(3, "0")}</td>
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
