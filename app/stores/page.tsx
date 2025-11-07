"use client";
import { useState } from "react";
import { useAppStore } from "../../lib/store";

export default function StoresPage() {
  const { stores, selectedStoreId, addStore, renameStore, deleteStore, selectStore } = useAppStore();
  const [name, setName] = useState("");

  return (
    <div className="row">
      <div className="col card">
        <h2>Create Store</h2>
        <form onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return; addStore(name.trim()); setName(""); }} className="row">
          <input className="input" placeholder="Store name" value={name} onChange={(e) => setName(e.target.value)} />
          <button className="button primary" type="submit">Add</button>
        </form>
      </div>

      <div className="col card">
        <h2>Stores</h2>
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Selected</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {stores.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.id === selectedStoreId ? <span className="badge ok">Active</span> : <span className="badge">-</span>}</td>
                <td style={{ display: "flex", gap: 8 }}>
                  <button className="button" onClick={() => selectStore(s.id)}>Select</button>
                  <button className="button" onClick={() => {
                    const nn = prompt("New name", s.name)?.trim();
                    if (nn && nn !== s.name) renameStore(s.id, nn);
                  }}>Rename</button>
                  <button className="button danger" onClick={() => {
                    if (confirm("Delete store and its data?")) deleteStore(s.id);
                  }}>Delete</button>
                </td>
              </tr>
            ))}
            {stores.length === 0 ? (
              <tr><td colSpan={3} className="small">No stores yet.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
