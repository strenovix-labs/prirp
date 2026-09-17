import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAdminOrders,
  updateOrderStatus,
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  fetchAdminPromos,
  createAdminPromo,
} from "../api/client";
import { useAuth } from "../context/AuthContext";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const { user, token, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview"); // overview, orders, products, promos
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter
  const [orderSearch, setOrderSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");

  // Selected Order for Modal View
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Add Product Modal State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    id: "",
    sku: "",
    name: "",
    category: "tees",
    categoryLabel: "CAPSULE",
    price_usd: "$45.00",
    numeric_price: 45.0,
    price_inr: "₹12,499",
    tag: "NEW DROP",
    description: "",
    image_url: "/merch/tee-signature.jpg",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Obsidian Black"],
    gsm: "280 GSM Heavyweight",
    stock_qty: 100,
  });

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState(null);

  // Add Promo Modal State
  const [isAddPromoOpen, setIsAddPromoOpen] = useState(false);
  const [newPromo, setNewPromo] = useState({
    code: "",
    discount_percent: 15.0,
    description: "Special Vault Promo",
    max_uses: 100,
  });

  const authToken = token || localStorage.getItem("prirp_admin_token") || localStorage.getItem("prirp_token");

  useEffect(() => {
    if (!authToken) {
      navigate("/admin");
      return;
    }

    loadDashboardData();
  }, [authToken]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    const [ordersRes, productsRes, promosRes] = await Promise.all([
      fetchAdminOrders(authToken),
      fetchAdminProducts(authToken),
      fetchAdminPromos(authToken),
    ]);

    if (ordersRes.success) setOrders(ordersRes.data || []);
    if (productsRes.success) setProducts(productsRes.data || []);
    if (promosRes.success) setPromos(promosRes.data || []);

    if (!ordersRes.success && ordersRes.status === 403) {
      setError("Admin access required. Please sign in with an Admin account.");
    }

    setLoading(false);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const res = await updateOrderStatus(authToken, orderId, newStatus);
    if (res.success) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } else {
      alert(`Failed to update status: ${res.error}`);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.sku || !newProduct.numeric_price) {
      alert("Please fill in Product Name, SKU, and Price");
      return;
    }

    const payload = {
      ...newProduct,
      id: newProduct.id || newProduct.sku.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      numeric_price: floatValue(newProduct.numeric_price),
      stock_qty: parseInt(newProduct.stock_qty || 100),
    };

    const res = await createAdminProduct(authToken, payload);
    if (res.success) {
      setProducts([res.data, ...products]);
      setIsAddProductOpen(false);
      alert("Product added successfully!");
    } else {
      alert(`Error creating product: ${res.error}`);
    }
  };

  const handleUpdateProductSubmit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    const payload = {
      name: editingProduct.name,
      numeric_price: floatValue(editingProduct.numeric_price),
      price_usd: `$${floatValue(editingProduct.numeric_price).toFixed(2)}`,
      stock_qty: parseInt(editingProduct.stock_qty || 0),
      is_active: editingProduct.is_active,
    };

    const res = await updateAdminProduct(authToken, editingProduct.id, payload);
    if (res.success) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? res.data : p))
      );
      setEditingProduct(null);
      alert("Product updated successfully!");
    } else {
      alert(`Error updating product: ${res.error}`);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    const res = await deleteAdminProduct(authToken, productId);
    if (res.success || res.status === 204) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } else {
      alert(`Failed to delete product: ${res.error}`);
    }
  };

  const handleCreatePromo = async (e) => {
    e.preventDefault();
    if (!newPromo.code || !newPromo.discount_percent) {
      alert("Please enter promo code and discount percentage");
      return;
    }

    const res = await createAdminPromo(authToken, {
      code: newPromo.code.toUpperCase().strip(),
      discount_percent: floatValue(newPromo.discount_percent),
      description: newPromo.description,
      max_uses: parseInt(newPromo.max_uses || 100),
    });

    if (res.success) {
      setPromos([res.data, ...promos]);
      setIsAddPromoOpen(false);
      alert("Promo code created successfully!");
    } else {
      alert(`Error creating promo: ${res.error}`);
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem("prirp_admin_token");
    navigate("/admin");
  };

  const floatValue = (val) => {
    const num = float(val);
    return isNaN(num) ? 0.0 : num;
  };

  function float(val) {
    if (typeof val === "number") return val;
    return parseFloat(String(val).replace(/[^0-9.]/g, "")) || 0;
  }

  // Calculate Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status === "PENDING").length;
  const shippedOrdersCount = orders.filter((o) => o.status === "SHIPPED").length;

  const filteredOrders = orders.filter((o) => {
    if (!orderSearch) return true;
    const q = orderSearch.toLowerCase();
    return (
      o.order_number?.toLowerCase().includes(q) ||
      o.customer_name?.toLowerCase().includes(q) ||
      o.customer_email?.toLowerCase().includes(q) ||
      o.status?.toLowerCase().includes(q)
    );
  });

  const filteredProducts = products.filter((p) => {
    if (productCategoryFilter === "all") return true;
    return p.category === productCategoryFilter;
  });

  return (
    <div className="admin-dashboard-page">
      {/* Top Navbar */}
      <nav className="admin-navbar">
        <div className="admin-brand">
          <img src="/prirplogoo.png" alt="PRIRP" className="admin-brand-logo" />
          <span className="admin-brand-text font-display">PRIRP SUB-ZERO</span>
          <span className="admin-brand-badge font-mono">ADMIN CONTROL</span>
        </div>

        <div className="admin-nav-right font-mono">
          <div className="admin-user-info">
            <span style={{ color: "#22c55e" }}>●</span>
            <span>LOGGED IN AS:</span>
            <strong>{user?.email || "admin@prirpenergy.com"}</strong>
          </div>
          <button className="admin-btn-logout" onClick={handleLogout}>
            SIGN OUT
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <div className="admin-container">
        {/* Nav Tabs */}
        <div className="admin-tabs font-mono">
          <button
            className={`admin-tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            📊 OVERVIEW & STATS
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            📦 ORDERS ({orders.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            🏷️ PRODUCTS & PRICING ({products.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "promos" ? "active" : ""}`}
            onClick={() => setActiveTab("promos")}
          >
            ⚡ PROMO CODES ({promos.length})
          </button>
        </div>

        {error && (
          <div className="admin-error-banner font-mono" style={{ marginBottom: "1.5rem" }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="font-mono" style={{ textAlign: "center", padding: "4rem", color: "#ef4444" }}>
            CONNECTING TO PRIRP NEON DATABASE...
          </div>
        ) : (
          <>
            {/* =========================================================================
                TAB 1: OVERVIEW & METRICS
               ========================================================================= */}
            {activeTab === "overview" && (
              <div>
                <div className="admin-metrics-grid font-mono">
                  <div className="admin-metric-card">
                    <div className="admin-metric-title">TOTAL STORE REVENUE</div>
                    <div className="admin-metric-val">${totalRevenue.toFixed(2)}</div>
                    <div className="admin-metric-sub">Approx. ₹{Math.round(totalRevenue * 83.5).toLocaleString()} INR</div>
                  </div>

                  <div className="admin-metric-card">
                    <div className="admin-metric-title font-mono">TOTAL ORDERS</div>
                    <div className="admin-metric-val">{totalOrdersCount}</div>
                    <div className="admin-metric-sub">{pendingOrdersCount} PENDING DISPATCH</div>
                  </div>

                  <div className="admin-metric-card">
                    <div className="admin-metric-title font-mono">STORE PRODUCTS</div>
                    <div className="admin-metric-val">{products.length}</div>
                    <div className="admin-metric-sub">ITEMS LIVE ON STOREFRONT</div>
                  </div>

                  <div className="admin-metric-card">
                    <div className="admin-metric-title font-mono font-mono">ACTIVE PROMO CODES</div>
                    <div className="admin-metric-val">{promos.length + 5}</div>
                    <div className="admin-metric-sub">VAULT DISCOUNTS ACTIVE</div>
                  </div>
                </div>

                {/* Recent Orders Preview */}
                <div className="admin-section-header">
                  <h3 className="admin-section-title font-display">RECENT LIVE ORDERS</h3>
                  <button className="admin-btn-action font-mono" onClick={() => setActiveTab("orders")}>
                    VIEW ALL ORDERS →
                  </button>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table font-mono">
                    <thead>
                      <tr>
                        <th>ORDER #</th>
                        <th>CUSTOMER</th>
                        <th>ITEMS</th>
                        <th>TOTAL ($)</th>
                        <th>STATUS</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((o) => (
                        <tr key={o.id}>
                          <td><strong>{o.order_number}</strong></td>
                          <td>
                            <div>{o.customer_name}</div>
                            <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{o.customer_email}</div>
                          </td>
                          <td>{o.items?.length || 1} Item(s)</td>
                          <td>${o.total_amount?.toFixed(2)}</td>
                          <td>
                            <span className={`status-pill ${o.status?.toLowerCase()}`}>
                              {o.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="admin-btn-action"
                              onClick={() => setSelectedOrder(o)}
                            >
                              INSPECT
                            </button>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan="6" style={{ textAlign: "center", color: "#9ca3af" }}>
                            No orders placed yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 2: ORDERS MANAGEMENT
               ========================================================================= */}
            {activeTab === "orders" && (
              <div>
                <div className="admin-section-header">
                  <h3 className="admin-section-title font-display">LIVE CUSTOMER ORDERS</h3>
                  <input
                    type="text"
                    className="admin-search-input font-mono"
                    placeholder="Search Order #, Name, Email..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                  />
                </div>

                <div className="admin-table-container">
                  <table className="admin-table font-mono">
                    <thead>
                      <tr>
                        <th>ORDER #</th>
                        <th>CUSTOMER</th>
                        <th>PHONE</th>
                        <th>DATE</th>
                        <th>TOTAL ($)</th>
                        <th>STATUS UPDATE</th>
                        <th>DETAILS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((o) => (
                        <tr key={o.id}>
                          <td><strong>{o.order_number}</strong></td>
                          <td>
                            <div>{o.customer_name}</div>
                            <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{o.customer_email}</div>
                          </td>
                          <td>{o.customer_phone || "N/A"}</td>
                          <td style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                            {new Date(o.created_at || Date.now()).toLocaleDateString()}
                          </td>
                          <td>
                            <strong>${o.total_amount?.toFixed(2)}</strong>
                          </td>
                          <td>
                            <select
                              className="admin-select"
                              value={o.status}
                              onChange={(e) => handleStatusChange(o.id, e.target.value)}
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="PROCESSING">PROCESSING</option>
                              <option value="SHIPPED">SHIPPED</option>
                              <option value="DELIVERED">DELIVERED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                          <td>
                            <button
                              className="admin-btn-action"
                              onClick={() => setSelectedOrder(o)}
                            >
                              VIEW DETAILS
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredOrders.length === 0 && (
                        <tr>
                          <td colSpan="7" style={{ textAlign: "center", color: "#9ca3af" }}>
                            No orders match search query.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 3: PRODUCTS & PRICING
               ========================================================================= */}
            {activeTab === "products" && (
              <div>
                <div className="admin-section-header">
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <h3 className="admin-section-title font-display">STORE PRODUCTS & INVENTORY</h3>
                    <select
                      className="admin-select font-mono"
                      value={productCategoryFilter}
                      onChange={(e) => setProductCategoryFilter(e.target.value)}
                    >
                      <option value="all">ALL CATEGORIES</option>
                      <option value="drinks">DRINKS</option>
                      <option value="tees">TEES</option>
                      <option value="accessories">ACCESSORIES</option>
                    </select>
                  </div>
                  <button
                    className="admin-btn-primary font-mono"
                    onClick={() => setIsAddProductOpen(true)}
                  >
                    + ADD NEW PRODUCT
                  </button>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table font-mono">
                    <thead>
                      <tr>
                        <th>SKU</th>
                        <th>NAME</th>
                        <th>CATEGORY</th>
                        <th>PRICE (USD)</th>
                        <th>PRICE (INR)</th>
                        <th>STOCK</th>
                        <th>STATUS</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((p) => (
                        <tr key={p.id}>
                          <td><strong>{p.sku}</strong></td>
                          <td>
                            <div>{p.name}</div>
                            <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{p.tag}</div>
                          </td>
                          <td><span className="status-pill processing">{p.category?.toUpperCase()}</span></td>
                          <td><strong>${p.numeric_price?.toFixed(2)}</strong></td>
                          <td>{p.price_inr || `₹${Math.round(p.numeric_price * 83.5)}`}</td>
                          <td>{p.stock_qty || 100} Qty</td>
                          <td>
                            <span className={`status-pill ${p.is_active !== false ? "delivered" : "cancelled"}`}>
                              {p.is_active !== false ? "ACTIVE" : "HIDDEN"}
                            </span>
                          </td>
                          <td style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              className="admin-btn-action"
                              onClick={() => setEditingProduct(p)}
                            >
                              EDIT
                            </button>
                            <button
                              className="admin-btn-action"
                              style={{ borderColor: "#dc2626", color: "#dc2626" }}
                              onClick={() => handleDeleteProduct(p.id)}
                            >
                              DEL
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 4: PROMO CODES & DISCOUNTS
               ========================================================================= */}
            {activeTab === "promos" && (
              <div>
                <div className="admin-section-header">
                  <h3 className="admin-section-title font-display">PROMO CODES & DISCOUNTS</h3>
                  <button
                    className="admin-btn-primary font-mono"
                    onClick={() => setIsAddPromoOpen(true)}
                  >
                    + CREATE PROMO CODE
                  </button>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table font-mono">
                    <thead>
                      <tr>
                        <th>CODE</th>
                        <th>DISCOUNT %</th>
                        <th>DESCRIPTION</th>
                        <th>USES / MAX</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Hardcoded system promos */}
                      <tr>
                        <td><strong>PRIRP10</strong></td>
                        <td><span className="status-pill delivered">10% OFF</span></td>
                        <td>Default VIP Launch Discount</td>
                        <td>SYSTEM VAULT</td>
                        <td><span className="status-pill delivered">ACTIVE</span></td>
                      </tr>
                      <tr>
                        <td><strong>SUBZERO</strong></td>
                        <td><span className="status-pill delivered">10% OFF</span></td>
                        <td>Sub-Zero cold ship special promo</td>
                        <td>SYSTEM VAULT</td>
                        <td><span className="status-pill delivered">ACTIVE</span></td>
                      </tr>
                      <tr>
                        <td><strong>PRIRP20</strong></td>
                        <td><span className="status-pill delivered">20% OFF</span></td>
                        <td>20% Crew Special Drop</td>
                        <td>SYSTEM VAULT</td>
                        <td><span className="status-pill delivered">ACTIVE</span></td>
                      </tr>
                      {/* DB Promos */}
                      {promos.map((pr) => (
                        <tr key={pr.id}>
                          <td><strong>{pr.code}</strong></td>
                          <td><span className="status-pill delivered">{pr.discount_percent}% OFF</span></td>
                          <td>{pr.description || "Custom promo"}</td>
                          <td>{pr.current_uses} / {pr.max_uses}</td>
                          <td>
                            <span className={`status-pill ${pr.is_active ? "delivered" : "cancelled"}`}>
                              {pr.is_active ? "ACTIVE" : "EXPIRED"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* =========================================================================
          MODAL 1: INSPECT ORDER DETAILS
         ========================================================================= */}
      {selectedOrder && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal-card font-mono" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">ORDER {selectedOrder.order_number}</h3>
              <button className="admin-modal-close" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.85rem" }}>
              <div>
                <strong>CUSTOMER:</strong> {selectedOrder.customer_name} ({selectedOrder.customer_email})
                <br />
                <strong>PHONE:</strong> {selectedOrder.customer_phone || "Not provided"}
              </div>

              <div>
                <strong>SHIPPING DESTINATION:</strong>
                <div style={{ background: "rgba(255,255,255,0.05)", padding: "0.75rem", borderRadius: "8px", marginTop: "0.4rem" }}>
                  {typeof selectedOrder.shipping_address === "object" ? (
                    <>
                      <div>{selectedOrder.shipping_address.street}</div>
                      <div>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}</div>
                      <div>{selectedOrder.shipping_address.country}</div>
                    </>
                  ) : (
                    <div>{String(selectedOrder.shipping_address)}</div>
                  )}
                </div>
              </div>

              <div>
                <strong>ORDERED ITEMS:</strong>
                <ul style={{ paddingLeft: "1.25rem", marginTop: "0.4rem" }}>
                  {selectedOrder.items?.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: "0.4rem" }}>
                      {item.product_name} x {item.quantity} - ${item.unit_price} 
                      {item.size && ` (Size: ${item.size})`}
                      {item.name_on_jersey && ` [Jersey: #${item.jersey_number} ${item.name_on_jersey}]`}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "0.75rem" }}>
                <div>SUBTOTAL: ${selectedOrder.subtotal?.toFixed(2)}</div>
                {selectedOrder.discount_amount > 0 && (
                  <div style={{ color: "#ef4444" }}>DISCOUNT ({selectedOrder.promo_code}): -${selectedOrder.discount_amount?.toFixed(2)}</div>
                )}
                <div style={{ fontSize: "1.1rem", fontWeight: "bold", marginTop: "0.4rem", color: "#22c55e" }}>
                  TOTAL AMOUNT: ${selectedOrder.total_amount?.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: ADD NEW PRODUCT
         ========================================================================= */}
      {isAddProductOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsAddProductOpen(false)}>
          <div className="admin-modal-card font-mono" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">ADD NEW PRODUCT</h3>
              <button className="admin-modal-close" onClick={() => setIsAddProductOpen(false)}>✕</button>
            </div>
            
            <form onSubmit={handleCreateProduct} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <input
                type="text"
                className="admin-input-field font-mono"
                placeholder="Product Name (e.g. PRIRP Cyber Hoodie)"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                required
              />
              <div style={{ display: "flex", gap: "1rem" }}>
                <input
                  type="text"
                  className="admin-input-field font-mono"
                  placeholder="SKU (e.g. PRIRP-HOOD-01)"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  required
                />
                <select
                  className="admin-select font-mono"
                  style={{ width: "100%", padding: "0.85rem" }}
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                >
                  <option value="tees">TEES</option>
                  <option value="drinks">DRINKS</option>
                  <option value="accessories">ACCESSORIES</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <input
                  type="number"
                  step="0.01"
                  className="admin-input-field font-mono"
                  placeholder="Price USD (e.g. 48.00)"
                  value={newProduct.numeric_price}
                  onChange={(e) => setNewProduct({ ...newProduct, numeric_price: e.target.value })}
                  required
                />
                <input
                  type="number"
                  className="admin-input-field font-mono"
                  placeholder="Stock Quantity"
                  value={newProduct.stock_qty}
                  onChange={(e) => setNewProduct({ ...newProduct, stock_qty: e.target.value })}
                  required
                />
              </div>

              <textarea
                className="admin-input-field font-mono"
                placeholder="Product Description..."
                rows="3"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              />

              <button type="submit" className="admin-btn-primary font-mono">
                CREATE PRODUCT →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: EDIT PRODUCT
         ========================================================================= */}
      {editingProduct && (
        <div className="admin-modal-backdrop" onClick={() => setEditingProduct(null)}>
          <div className="admin-modal-card font-mono" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">EDIT PRODUCT: {editingProduct.name}</h3>
              <button className="admin-modal-close" onClick={() => setEditingProduct(null)}>✕</button>
            </div>
            
            <form onSubmit={handleUpdateProductSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.75rem", color: "#9ca3af" }}>PRODUCT NAME</label>
                <input
                  type="text"
                  className="admin-input-field font-mono"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "#9ca3af" }}>PRICE ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="admin-input-field font-mono"
                    value={editingProduct.numeric_price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, numeric_price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "#9ca3af" }}>STOCK QTY</label>
                  <input
                    type="number"
                    className="admin-input-field font-mono"
                    value={editingProduct.stock_qty || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock_qty: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", color: "#9ca3af" }}>STORE VISIBILITY</label>
                <select
                  className="admin-select font-mono"
                  style={{ width: "100%", padding: "0.85rem", marginTop: "0.4rem" }}
                  value={editingProduct.is_active ? "true" : "false"}
                  onChange={(e) => setEditingProduct({ ...editingProduct, is_active: e.target.value === "true" })}
                >
                  <option value="true">ACTIVE (VISIBLE ON STORE)</option>
                  <option value="false">HIDDEN / OUT OF STOCK</option>
                </select>
              </div>

              <button type="submit" className="admin-btn-primary font-mono" style={{ marginTop: "1rem" }}>
                SAVE CHANGES →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: CREATE PROMO CODE
         ========================================================================= */}
      {isAddPromoOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsAddPromoOpen(false)}>
          <div className="admin-modal-card font-mono" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">CREATE NEW PROMO CODE</h3>
              <button className="admin-modal-close" onClick={() => setIsAddPromoOpen(false)}>✕</button>
            </div>
            
            <form onSubmit={handleCreatePromo} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <input
                type="text"
                className="admin-input-field font-mono"
                placeholder="PROMO CODE (e.g. SUMMER25)"
                value={newPromo.code}
                onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value })}
                required
              />
              
              <div style={{ display: "flex", gap: "1rem" }}>
                <input
                  type="number"
                  step="1"
                  className="admin-input-field font-mono"
                  placeholder="Discount % (e.g. 25)"
                  value={newPromo.discount_percent}
                  onChange={(e) => setNewPromo({ ...newPromo, discount_percent: e.target.value })}
                  required
                />
                <input
                  type="number"
                  className="admin-input-field font-mono"
                  placeholder="Max Uses (e.g. 500)"
                  value={newPromo.max_uses}
                  onChange={(e) => setNewPromo({ ...newPromo, max_uses: e.target.value })}
                />
              </div>

              <input
                type="text"
                className="admin-input-field font-mono"
                placeholder="Description (e.g. 25% Off Summer Drop)"
                value={newPromo.description}
                onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })}
              />

              <button type="submit" className="admin-btn-primary font-mono">
                CREATE PROMO CODE →
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
