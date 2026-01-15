import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:5000";

function Login() {
  const [userCode, setUserCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    if (!userCode.trim()) {
      setError("Please enter your user code.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_code: userCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }

      localStorage.setItem("user_id", String(data.user_id));
      localStorage.setItem("user_code", data.user_code);

      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Could not reach the server.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-md mx-auto">
        <Link to="/" className="text-sm text-slate-300 hover:text-white">
          ← Back
        </Link>

        <h1 className="text-3xl font-bold mt-4 mb-2">Log in</h1>
        <p className="text-slate-400 mb-6">Enter your login code.</p>

        {error && (
          <div className="mb-4 px-4 py-2 rounded-xl bg-red-600/80 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              User code
            </label>
            <input
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-800 border border-slate-700"
              placeholder="e.g. 483291"
            />
          </div>

          <button className="w-full px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 transition font-medium">
            Log in
          </button>

          <p className="text-sm text-slate-300">
            No account?{" "}
            <Link className="text-emerald-300 hover:text-emerald-200" to="/signup">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
