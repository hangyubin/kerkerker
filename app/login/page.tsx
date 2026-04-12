"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin/settings";

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        // 只执行路由跳转，移除 router.refresh() 避免可能的 cookie 丢失
        router.push(redirect);
      } else {
        setError(data.error || "登录失败");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("登录失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--theme-background)]">
      <div className="w-full max-w-md px-6">
        <div className="bg-[var(--theme-card)] rounded-lg shadow-2xl p-10 border border-[var(--theme-border)]">
          {/* Logo Style */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[var(--theme-primary)] mb-2">光影流年</h1>
            <p className="text-[var(--theme-textSecondary)] text-lg">后台管理系统</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[var(--theme-textSecondary)] mb-2"
              >
                密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded text-[var(--theme-text)] placeholder-[var(--theme-textSecondary)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:border-transparent transition"
                placeholder="请输入管理员密码"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-[var(--theme-error)]/10 border border-[var(--theme-error)]/50 rounded p-3 text-[var(--theme-error)] text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--theme-primary)] hover:bg-[var(--theme-secondary)] disabled:bg-[var(--theme-border)] disabled:cursor-not-allowed text-[var(--theme-text)] font-bold py-3 px-4 rounded transition duration-200"
            >
              {loading ? "登录中..." : "登录"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-[var(--theme-textSecondary)]">
            <p>默认密码：admin123</p>
            <p className="mt-1">可通过环境变量 ADMIN_PASSWORD 修改</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--theme-background)]">
          <div className="text-[var(--theme-text)]">加载中...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
