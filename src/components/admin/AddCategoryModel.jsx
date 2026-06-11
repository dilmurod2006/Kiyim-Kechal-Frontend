import React, { useState } from "react";
import CategoryApi from "../../api/CategoryApi.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { IconClose } from "../Icons.jsx";

function AddCategoryModal({ isOpen, onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await CategoryApi.createCategory(name.trim());
      toast.success("Category created");
      setName("");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.status === 409
          ? "That category already exists."
          : "Failed to create category."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>New category</h2>
          <button className="modal-x" onClick={onClose}><IconClose width={18} height={18} /></button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="cat-name">Category name</label>
              <input
                id="cat-name" className="input" autoFocus
                placeholder="e.g. Outerwear" value={name}
                onChange={(e) => setName(e.target.value)} required
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? <span className="spinner" /> : "Create category"}
              </button>
              <button className="btn btn-ghost" type="button" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddCategoryModal;
