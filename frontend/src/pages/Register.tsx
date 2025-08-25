/* filepath: d:\private-election-platform\frontend\src\pages\Register.tsx */
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaUniversity,
  FaUser,
  FaEnvelope,
  FaLock,
  FaBuilding,
} from "react-icons/fa";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        tenantId,
        email,
        password,
        name,
      });
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-xl bg-purple-500 flex items-center justify-center">
              <FaUniversity className="text-3xl text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-white mb-2">
            Join Your Institution
          </h2>
          <p className="text-gray-400">Create your account to start voting</p>
        </div>

        <div className="glass-card p-8 rounded-2xl">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-white mb-2"
              >
                Full Name
              </label>
              <div className="relative input-container">
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="input-field pl-10 w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white mb-2"
              >
                Email Address
              </label>
              <div className="relative input-container">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="input-field pl-10 w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white mb-2"
              >
                Password
              </label>
              <div className="relative input-container">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="input-field pl-10 w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="tenantId"
                className="block text-sm font-medium text-white mb-2"
              >
                Organization ID
              </label>
              <div className="relative input-container">
                <input
                  id="tenantId"
                  type="text"
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  placeholder="e.g., stanford-university"
                  className="input-field pl-10 w-full"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Contact your administrator if you don't know your organization
                ID
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="font-medium text-purple-400 hover:text-purple-300 transition-colors"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
