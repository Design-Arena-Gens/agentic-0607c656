"use client";
import { useMemo, useState } from "react";
import { useAppStore } from "../lib/store";
import { formatCurrency, generateId } from "../lib/utils";

export default function DashboardPage() {
  const { selectedStoreId, stores, products, sales, addSale } = useAppStore();

  if (!selectedStoreId || stores.length === 0) {
    return <div>Please create a store to get started.</div>;
  }

  const storeProducts = products.filter((p) => p.storeId === selectedStoreId);
  const storeSales = sales.filter((s) => s.storeId === selectedStoreId);

  const metrics = useMemo(() => {
    const totalProducts = storeProducts.length;
    const inventoryValue = storeProducts.reduce((sum, p) => sum + p.cost * p.stock, 0);
    const revenue = storeSales.reduce((sum, s) => sum + s.quantity * s.unitPrice, 0);
    const cogs = storeSales.reduce((sum, s) => sum + s.quantity * s.unitCost, 0);
    const profit = revenue - cogs;

    const lowStock = storeProducts.filter((p) => p.stock <= (p.stockAlertThreshold ?? 0));
    return { totalProducts, inventoryValue, revenue, profit, lowStock };
  }, [storeProducts, storeSales]);

  return (
    <div>
      <div className="card-grid">
        <div className="card"><h3>Total Products</h3><div className="value">{metrics.totalProducts}</div></div>
        <div className="card"><h3>Inventory Value</h3><div className="value">{formatCurrency(metrics.inventoryValue)}</div></div>
        <div className="card"><h3>Revenue</h3><div className="value">{formatCurrency(metrics.revenue)}</div></div>
        <div className="card"><h3>Profit</h3><div className="value">{formatCurrency(metrics.profit)}</div></div>
      </div>

      <div className="section row">
        <div className="col card">
          <h2>Quick Sale</h2>
          <QuickSale />
        </div>
        <div className="col card">
          <h2>Low Stock Alerts</h2>
          {metrics.lowStock.length === 0 ? (
            <div className="small">No low-stock products.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Stock</th>
                  <th>Threshold</th>
                </tr>
              </thead>
              <tbody>
                {metrics.lowStock.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td className="small">{p.sku}</td>
                    <td><span className="badge danger">{p.stock}</span></td>
                    <td className="small">{p.stockAlertThreshold ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="section card">
        <h2>Recent Sales</h2>
        <RecentSales />
      </div>
    </div>
  );
}

function QuickSale() {
  const { selectedStoreId, products, addSale } = useAppStore();
  const storeProducts = products.filter((p) => p.storeId === selectedStoreId);
  const [productId, setProductId] = useState(storeProducts[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const selected = storeProducts.find((p) => p.id === productId);
  const [unitPrice, setUnitPrice] = useState<number | "">(selected?.price ?? "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const prod = storeProducts.find((p) => p.id === productId);
        if (!prod) return;
        const price = typeof unitPrice === "number" ? unitPrice : prod.price;
        addSale({
          id: generateId(),
          storeId: prod.storeId,
          productId: prod.id,
          dateISO: new Date().toISOString(),
          quantity: Math.max(1, quantity),
          unitPrice: price,
          unitCost: prod.cost,
        });
        setQuantity(1);
      }}
      className="row"
    >
      <div className="col">
        <label className="small">Product</label>
        <select className="select" value={productId} onChange={(e) => {
          setProductId(e.target.value);
          const next = storeProducts.find((p) => p.id === e.target.value);
          setUnitPrice(next ? next.price : "");
        }}>
          {storeProducts.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="small">Qty</label>
        <input className="input" type="number" min={1} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value || "1", 10))} />
      </div>
      <div>
        <label className="small">Unit Price</label>
        <input className="input" type="number" min={0} step="0.01" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value === "" ? "" : parseFloat(e.target.value))} />
      </div>
      <div style={{ alignSelf: "end" }}>
        <button className="button success" type="submit">Record Sale</button>
      </div>
    </form>
  );
}

function RecentSales() {
  const { selectedStoreId, sales, products } = useAppStore();
  const list = sales
    .filter((s) => s.storeId === selectedStoreId)
    .slice()
    .sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1))
    .slice(0, 10);

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Product</th>
          <th>Qty</th>
          <th>Revenue</th>
          <th>Profit</th>
        </tr>
      </thead>
      <tbody>
        {list.map((s) => {
          const p = products.find((p) => p.id === s.productId);
          const revenue = s.quantity * s.unitPrice;
          const profit = s.quantity * (s.unitPrice - s.unitCost);
          return (
            <tr key={s.id}>
              <td className="small">{new Date(s.dateISO).toLocaleString()}</td>
              <td>{p?.name ?? "Unknown"}</td>
              <td>{s.quantity}</td>
              <td>{formatCurrency(revenue)}</td>
              <td>{formatCurrency(profit)}</td>
            </tr>
          );
        })}
        {list.length === 0 ? (
          <tr><td colSpan={5} className="small">No sales yet.</td></tr>
        ) : null}
      </tbody>
    </table>
  );
}
