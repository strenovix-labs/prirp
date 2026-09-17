// PRIRP Energy Frontend API Client

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.detail || `API Error: ${response.statusText}`;
      return { success: false, error: errorMsg, status: response.status };
    }

    return { success: true, data };
  } catch (error) {
    console.warn("Backend API unreachable, using fallback local handling:", error);
    return { success: false, error: error.message || "Network error" };
  }
}

// =========================================================================
// AUTHENTICATION & USER PROFILE METHODS
// =========================================================================

/**
 * Register User Account
 */
export async function registerUser(email, password, fullName = "") {
  return await request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, full_name: fullName }),
  });
}

/**
 * Login User Account
 */
export async function loginUser(email, password) {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data?.detail || "Login failed" };
    }
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message || "Network connection error" };
  }
}

/**
 * Fetch Current Authenticated User Profile
 */
export async function fetchCurrentUser(token) {
  return await request("/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Save New Delivery Address to User Profile
 */
export async function saveUserAddress(token, addressData) {
  return await request("/auth/addresses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(addressData),
  });
}

/**
 * Delete Delivery Address from User Profile
 */
export async function deleteUserAddress(token, addressId) {
  return await request(`/auth/addresses/${addressId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// =========================================================================
// PUBLIC & CHECKOUT API METHODS
// =========================================================================

/**
 * Validate promo code with FastAPI backend
 */
export async function validatePromoCode(code) {
  const result = await request("/promos/validate", {
    method: "POST",
    body: JSON.stringify({ code }),
  });

  if (result.success) {
    return result.data;
  }

  const clean = code.trim().toUpperCase();
  if (["PRIRP10", "SUBZERO", "ENERGY10"].includes(clean)) {
    return { success: true, code: clean, discount_percent: 10, message: "10% VIP DISCOUNT APPLIED" };
  } else if (["PRIRP20", "CREW20"].includes(clean)) {
    return { success: true, code: clean, discount_percent: 20, message: "20% VIP DROP DISCOUNT APPLIED" };
  }
  return { success: false, code: clean, discount_percent: 0, message: "INVALID OR EXPIRED VAULT CODE" };
}

/**
 * Submit VIP Collective Email Subscription
 */
export async function subscribeVIPNewsletter(email) {
  return await request("/subscribers", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/**
 * Fetch products from backend DB
 */
export async function fetchProducts(category = "all") {
  const query = category && category !== "all" ? `?category=${category}` : "";
  return await request(`/products${query}`, { method: "GET" });
}

/**
 * Create Order in Backend
 */
export async function createOrder(orderPayload) {
  const token = localStorage.getItem("prirp_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  return await request("/orders", {
    method: "POST",
    headers,
    body: JSON.stringify(orderPayload),
  });
}

/**
 * Fetch Order Details by Order Number
 */
export async function getOrderDetails(orderNumber) {
  return await request(`/orders/${orderNumber}`, { method: "GET" });
}

/**
 * Create Razorpay Order Payment Session
 */
export async function createRazorpayPayment(orderId) {
  return await request("/checkout/create-razorpay-order", {
    method: "POST",
    body: JSON.stringify({ order_id: orderId }),
  });
}


// =========================================================================
// ADMIN PORTAL API METHODS
// =========================================================================

/**
 * Fetch all customer orders (Admin privilege required)
 */
export async function fetchAdminOrders(token) {
  return await request("/orders", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Update order status or payment status (Admin privilege required)
 */
export async function updateOrderStatus(token, orderId, orderStatus, paymentStatus = null) {
  return await request(`/orders/${orderId}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status: orderStatus, payment_status: paymentStatus }),
  });
}

/**
 * Fetch all products including inactive (Admin privilege required)
 */
export async function fetchAdminProducts(token) {
  return await request("/products?active_only=false", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Create new merchandise or drink product (Admin privilege required)
 */
export async function createAdminProduct(token, productData) {
  return await request("/products", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });
}

/**
 * Update product pricing, stock, or details (Admin privilege required)
 */
export async function updateAdminProduct(token, productId, productData) {
  return await request(`/products/${productId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });
}

/**
 * Delete product (Admin privilege required)
 */
export async function deleteAdminProduct(token, productId) {
  return await request(`/products/${productId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Fetch all promo codes (Admin privilege required)
 */
export async function fetchAdminPromos(token) {
  return await request("/promos", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Create new promo code (Admin privilege required)
 */
export async function createAdminPromo(token, promoData) {
  return await request("/promos", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(promoData),
  });
}
