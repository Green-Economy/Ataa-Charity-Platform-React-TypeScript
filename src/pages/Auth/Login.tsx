// import React, { useState } from "react";
// import { login } from "../../api/ataaApi";

// export default function LoginPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError("");
//     try {
//       const { data } = await login({ email, password });
//       localStorage.setItem("accessToken", data.accessToken);
//       // redirect or show success
//     } catch (err: any) {
//       setError(err?.response?.data?.message || "خطأ في تسجيل الدخول");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleLogin} style={{ width: "350px", margin: "96px auto" }}>
//       <input
//         type="email"
//         placeholder="البريد الإلكتروني"
//         value={email}
//         onChange={e => setEmail(e.target.value)}
//         style={{ display: "block", width: "100%", marginBottom: "8px" }}
//       />
//       <input
//         type="password"
//         placeholder="كلمة المرور"
//         value={password}
//         onChange={e => setPassword(e.target.value)}
//         style={{ display: "block", width: "100%", marginBottom: "12px" }}
//       />
//       <button type="submit" disabled={isLoading} style={{ width: "100%" }}>
//         {isLoading ? "جاري الدخول..." : "دخول"}
//       </button>
//       {error && <div style={{ color: "red", marginTop: "12px" }}>{error}</div>}
//     </form>
//   );
// }
// src/pages/Auth/Login.tsx — مُصلَح
import React, { useState } from "react";
import { authApi } from "../../services";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation } from "wouter";
import { getRedirectByRole } from "../../utils/getRedirectByRole";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      // ✅ استخدام authApi من services/ بدلاً من ataaApi
      const res = await authApi.login({ email, password });

      // ✅ الـ Backend يُرجع { tokens: { accessToken, refreshToken }, user }
      if (!res.tokens?.accessToken || !res.tokens?.refreshToken) {
        throw new Error("فشل الاستجابة من الخادم");
      }

      await login(res.tokens.accessToken, res.tokens.refreshToken, res.user);
      setLocation(getRedirectByRole(res.user?.roleType || "user"));
    } catch (err: any) {
      setError(err?.message || "خطأ في تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} style={{ width: "350px", margin: "96px auto" }}>
      <input
        type="email"
        placeholder="البريد الإلكتروني"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: "8px" }}
      />
      <input
        type="password"
        placeholder="كلمة المرور"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: "12px" }}
      />
      <button type="submit" disabled={isLoading} style={{ width: "100%" }}>
        {isLoading ? "جاري الدخول..." : "دخول"}
      </button>
      {error && <div style={{ color: "red", marginTop: "12px" }}>{error}</div>}
    </form>
  );
}