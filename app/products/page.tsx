"use client";
import { useMemo, useState } from "react";
import { useAppStore } from "../../lib/store";
import { formatCurrency, generateId } from "../../lib/utils";

export default function ProductsPage() {
  const { selectedStoreId, stores } = useAppStore();
  if (!selectedStoreId || stores.length === 0) {
    return <div>Please create a store to manage products.</div>;
  }
  return (
    <div className="row">
      <div className="col card">
        <h2>Add / Edit Product</h2>
        <ProductForm />
      </div>
      <div className="col card">
        <h2>Products</h2>
        <ProductTable />
      </div>
    </div>
  );
}

function ProductForm() {
  const { selectedStoreId, addProduct, updateProduct } = useAppStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", sku: "", cost: "", price: "", stock: "", stockAlertThreshold: "" } as any);

  const reset = () => {
    setEditingId(null);
    setForm({ name: "", sku: "", cost: "", price: "", stock: "", stockAlertThreshold: "" });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    const payload = {
      id: editingId ?? generateId(),
      storeId: selectedStoreId!,
      name: form.name.trim(),
      sku: form.sku.trim(),
      cost: parseFloat(form.cost || "0") || 0,
      price: parseFloat(form.price || "0") || 0,
      stock: parseInt(form.stock || "0", 10) || 0,
      stockAlertThreshold: parseInt(form.stockAlertThreshold || "0", 10) || 0,
    };
    if (editingId) {
      updateProduct(editingId, payload);
    } else {
      addProduct(payload);
    }
    reset();
  };

  return (
    <form onSubmit={onSubmit} className="row" style={{ flexWrap: "wrap" }}>
      <div className="col">
        <label className="small">Name</label>
        <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" />
      </div>
      <div>
        <label className="small">SKU</label>
        <input className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="SKU" />
      </div>
      <div>
        <label className="small">Cost</label>
        <input className="input" type="number" min={0} step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
      </div>
      <div>
        <label className="small">Price</label>
        <input className="input" type="number" min={0} step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
      </div>
      <div>
        <label className="small">Stock</label>
        <input className="input" type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
      </div>
      <div>
        <label className="small">Alert Threshold</label>
        <input className="input" type="number" min={0} value={form.stockAlertThreshold} onChange={(e) => setForm({ ...form, stockAlertThreshold: e.target.value })} />
      </div>
      <div style={{ alignSelf: "end" }}>
        <button className="button primary" type="submit">{editingId ? "Save" : "Add Product"}</button>
        {editingId ? (
          <button type="button" className="button" onClick={reset} style={{ marginLeft: 8 }}>Cancel</button>
        ) : null}
      </div>
    </form>
  );
}

function ProductTable() {
  const { selectedStoreId, products, sales, deleteProduct } = useAppStore();
  const list = products.filter((p) => p.storeId === selectedStoreId);

  const metrics = useMemo(() => {
    const byId = new Map(
      list.map((p) => [p.id, { sold: 0, revenue: 0, cogs: 0, profit: 0 }])
    );
    sales
      .filter((s) => s.storeId === selectedStoreId)
      .forEach((s) => {
        const m = byId.get(s.productId);
        if (m) {
          m.sold += s.quantity;
          m.revenue += s.quantity * s.unitPrice;
          m.cogs += s.quantity * s.unitCost;
          m.profit = m.revenue - m.cogs;
        }
      });
    return byId;
  }, [list, sales, selectedStoreId]);

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Product</th>
          <th>SKU</th>
          <th>Cost</th>
          <th>Price</th>
          <th>Stock</th>
          <th>Sold</th>
          <th>Revenue</th>
          <th>Profit</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {list.map((p) => {
          const m = metrics.get(p.id)!;
          const low = p.stock <= (p.stockAlertThreshold ?? 0);
          return (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td className="small">{p.sku}</td>
              <td>{formatCurrency(p.cost)}</td>
              <td>{formatCurrency(p.price)}</td>
              <td>
                {low ? <span className="badge danger">{p.stock}</span> : <span className="badge ok">{p.stock}</span>}
              </td>
              <td>{m?.sold ?? 0}</td>
              <td>{formatCurrency(m?.revenue ?? 0)}</td>
              <td>{formatCurrency(m?.profit ?? 0)}</td>
              <td>
                <button className="button danger" onClick={() => {
                  if (confirm("Delete product?")) deleteProduct(p.id);
                }}>Delete</button>
              </td>
            </tr>
          );
        })}
        {list.length === 0 ? (
          <tr><td colSpan={9} className="small">No products yet.</td></tr>
        ) : null}
      </tbody>
    </table>
  );
}
