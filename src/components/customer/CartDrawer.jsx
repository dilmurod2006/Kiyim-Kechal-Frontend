import React from "react";
import { useCart } from "../../context/CartContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { productImage, handleImageError, formatPrice } from "../../utils/catalog.js";
import { IconClose, IconBag } from "../Icons.jsx";

function CartDrawer() {
  const { items, open, closeCart, remove, setQty, subtotal, clear, count } = useCart();
  const toast = useToast();

  if (!open) return null;

  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 9.95;
  const total = subtotal + shipping;

  const checkout = () => {
    clear();
    closeCart();
    toast.success("Order placed — thank you!");
  };

  return (
    <>
      <div className="drawer-backdrop" onClick={closeCart} />
      <aside className="drawer" role="dialog" aria-label="Shopping bag">
        <div className="drawer-head">
          <h2 style={{ fontSize: 22 }}>Your bag {count > 0 && `(${count})`}</h2>
          <button className="modal-x" onClick={closeCart}><IconClose width={18} height={18} /></button>
        </div>

        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="state" style={{ padding: "50px 10px" }}>
              <div className="state-ic"><IconBag width={30} height={30} /></div>
              <h3>Your bag is empty</h3>
              <p>Add a few considered pieces to get started.</p>
            </div>
          ) : (
            items.map(({ product, qty }) => (
              <div className="cart-row" key={product.id}>
                <div className="cart-thumb">
                  <img src={productImage(product)} alt={product.name} onError={handleImageError(product)} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="cn">{product.name}</div>
                  <div className="cmeta">{product.category?.name}</div>
                  <div className="cprice">{formatPrice(product.price)}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
                    <div className="qty" style={{ transform: "scale(.85)", transformOrigin: "left" }}>
                      <button onClick={() => setQty(product.id, qty - 1)}>−</button>
                      <span>{qty}</span>
                      <button onClick={() => setQty(product.id, qty + 1)}>+</button>
                    </div>
                    <button className="cart-remove" onClick={() => remove(product.id)}>Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="drawer-foot">
            <div className="summary-row">
              <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span><span>{shipping === 0 ? "Complimentary" : formatPrice(shipping)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span><span>{formatPrice(total)}</span>
            </div>
            <button className="btn btn-primary btn-block btn-lg" onClick={checkout}>
              Checkout
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

export default CartDrawer;
