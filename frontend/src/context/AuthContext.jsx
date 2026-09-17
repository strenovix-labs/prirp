import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser, fetchCurrentUser, saveUserAddress, deleteUserAddress } from "../api/client";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem("prirp_token") || null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("prirp_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingCallback, setPendingCallback] = useState(null);

  // Validate token on mount
  useEffect(() => {
    if (token) {
      fetchCurrentUser(token).then((res) => {
        if (res.success) {
          setUser(res.data);
          try {
            localStorage.setItem("prirp_user", JSON.stringify(res.data));
          } catch {}
        } else {
          // Token invalid/expired
          logout();
        }
      });
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await loginUser(email, password);
    if (res.success && res.data.access_token) {
      const jwtToken = res.data.access_token;
      const userData = res.data.user;

      setToken(jwtToken);
      setUser(userData);

      try {
        localStorage.setItem("prirp_token", jwtToken);
        localStorage.setItem("prirp_user", JSON.stringify(userData));
      } catch {}

      setIsAuthModalOpen(false);

      if (pendingCallback) {
        pendingCallback(userData, jwtToken);
        setPendingCallback(null);
      }

      return { success: true, user: userData };
    }
    return { success: false, error: res.error || "Invalid email or password" };
  };

  const register = async (email, password, fullName) => {
    const regRes = await registerUser(email, password, fullName);
    if (!regRes.success) {
      return { success: false, error: regRes.error || "Registration failed" };
    }

    return await login(email, password);
  };

  const saveAddress = async (addressData) => {
    if (!token) return { success: false, error: "Not logged in" };
    const res = await saveUserAddress(token, addressData);
    if (res.success && res.data) {
      setUser(res.data);
      try {
        localStorage.setItem("prirp_user", JSON.stringify(res.data));
      } catch {}
      return { success: true, user: res.data };
    }
    return { success: false, error: res.error || "Failed to save address" };
  };

  const deleteAddress = async (addressId) => {
    if (!token) return { success: false, error: "Not logged in" };
    const res = await deleteUserAddress(token, addressId);
    if (res.success && res.data) {
      setUser(res.data);
      try {
        localStorage.setItem("prirp_user", JSON.stringify(res.data));
      } catch {}
      return { success: true, user: res.data };
    }
    return { success: false, error: res.error || "Failed to delete address" };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem("prirp_token");
      localStorage.removeItem("prirp_user");
    } catch {}
  };

  const openAuthModal = (callback = null) => {
    if (callback) {
      setPendingCallback(() => callback);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPendingCallback(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        saveAddress,
        deleteAddress,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
