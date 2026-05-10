import React, { useState } from "react";
import { login } from "../../api/ataaApi";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const { data } = await login({ email, password });
      localStorage.setItem("accessToken", data.accessToken);
      // redirect or show success
    } catch (err: any) {
      setError(err?.response?.data?.message || "خطأ في تسجيل الدخول");
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