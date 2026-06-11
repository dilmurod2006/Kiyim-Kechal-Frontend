import React from "react";

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span className="brand-mark">
          MAISON<span className="brand-dot">.</span>
        </span>
        <span>Considered clothing, made to last. Crafted with care.</span>
        <span>© {new Date().getFullYear()} MAISON Atelier</span>
      </div>
    </footer>
  );
}

export default Footer;
