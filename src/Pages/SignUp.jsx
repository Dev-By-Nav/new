import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:5000";

function Signup() {
  const [error, setError] = useState("");
  const [createdCode, setCreatedCode] = useState("");
  const navigate = useNavigate();

  async function handleSignup() {
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create account.");
        return;
      }

      setCreatedCode(data.user_code);

      // auto log in
      localStorage.setItem("user_id", String(data.user_id));
      localStorage.setItem("user_code", data.user_code);
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

        <h1 className="text-3xl font-bold mt-4 mb-2">Create account</h1>
        <p className="text-slate-400 mb-6">
          You’ll get a unique login code. Save it somewhere safe.
        </p>

        {error && (
          <div className="mb-4 px-4 py-2 rounded-xl bg-red-600/80 text-sm">
            {error}
          </div>
        )}

        {!createdCode ? (
          <button
            onClick={handleSignup}
            className="w-full px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 transition font-medium"
          >
            Generate my login code
          </button>
        ) : (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <p className="text-slate-300 mb-2">Your login code is:</p>
            <p className="text-4xl font-bold tracking-widest mb-4">
              {createdCode}
            </p>
            <p className="text-slate-400 text-sm mb-4">
              You can log in later using this code.
            </p>

            <button
              onClick={() => navigate("/")}
              className="w-full px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 transition font-medium"
            >
              Continue to Home
            </button>

            <p className="text-sm text-slate-300 mt-4">
              Want to test login?{" "}
              <Link className="text-emerald-300 hover:text-emerald-200" to="/login">
                Go to Login
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Signup;
