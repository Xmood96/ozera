import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../lib/auth";
import JewelLogo from "../assets/logoanim";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await loginUser(email, password);
      navigate("/admin");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "خطأ في تسجيل الدخول";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page min-h-screen bg-gradient-to-b from-accent to-base-100 flex items-center justify-center p-4" dir="rtl">
      <div className="login-container w-full max-w-md">
        {/* Logo */}
        <div className="logo-container mb-8 flex justify-center">
          <div className="w-32 h-32">
            <JewelLogo
              size="100%"
              color="#164e2a"
              loopDuration={4}
              strokeWidth={6}
            />
          </div>
        </div>

        {/* Card */}
        <div className="login-card bg-base-100 rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-primary mb-2 text-center">
            لوحة التحكم
          </h1>
          <p className="text-base-content opacity-75 text-center mb-8">
            تسجيل الدخول للمشرفين
          </p>

          {/* Error Message */}
          {error && (
            <div className="alert alert-error mb-6 rounded-lg">
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">البريد الإلكتروني</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ozera.com"
                className="input input-bordered rounded-lg"
                required
              />
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">كلمة المرور</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input input-bordered rounded-lg"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full rounded-lg mt-6"
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  جاري المعالجة...
                </>
              ) : (
                "دخول"
              )}
            </button>
          </form>

          {/* Demo Info */}
          <div className="alert alert-info mt-6 rounded-lg">
            <div>
              <p className="text-sm font-semibold mb-2">بيانات التجربة:</p>
              <p className="text-xs">البريد: admin@ozera.com</p>
              <p className="text-xs">كلمة المرور: admin123</p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="link link-primary font-semibold"
          >
            ← العودة إلى الصفحة الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
}
