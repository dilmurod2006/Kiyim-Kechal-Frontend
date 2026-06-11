import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import CartDrawer from "./components/customer/CartDrawer.jsx";
import AdminDashboard from "./components/admin/AdminDashboard.jsx";
import CustomerPage from "./components/customer/CustomerPage.jsx";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import "./App.css";

function FullLoader() {
  return (
    <div className="page-loader">
      <span className="spinner dark" />
    </div>
  );
}

// Redirect "/" based on auth state and role.
function HomeRedirect() {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  if (loading) return <FullLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={isAdmin ? "/admin" : "/customer"} replace />;
}

// Generic guard: requires auth, and optionally a role.
function Protected({ role, children }) {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();
  if (loading) return <FullLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  if (role === "admin" && !isAdmin) return <Navigate to="/customer" replace />;
  if (role === "customer" && isAdmin) return <Navigate to="/admin" replace />;
  return children;
}

// Keep authenticated users away from the auth pages.
function GuestOnly({ children }) {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  if (loading) return <FullLoader />;
  if (isAuthenticated) return <Navigate to={isAdmin ? "/admin" : "/customer"} replace />;
  return children;
}

function NotFound() {
  return (
    <div className="container">
      <div className="state">
        <div className="state-ic">✕</div>
        <h3>Page not found</h3>
        <p>The page you’re looking for doesn’t exist.</p>
      </div>
    </div>
  );
}

function Shell() {
  return (
    <>
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
          <Route path="/signup" element={<GuestOnly><Signup /></GuestOnly>} />
          <Route
            path="/customer"
            element={<Protected role="customer"><CustomerPage /></Protected>}
          />
          <Route
            path="/admin"
            element={<Protected role="admin"><AdminDashboard /></Protected>}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <Shell />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
