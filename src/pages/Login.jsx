import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import Swal from 'sweetalert2';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Very simple validation
    if (!email.trim() || !email.includes("@")) {
      alert("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      alert("Please enter your password");
      setLoading(false);
      return;
    }

    try {
      const credentials = {
        email: email.trim().toLowerCase(),
        password: password
      };

      const result = await authService.login(credentials);

      if (result && result.success) {
        await Swal.fire({
          icon: 'success',
          title: '🎉 Welcome Back!',
          text: `Hello ${result.user?.name || 'User'}! Login successful!`,
          timer: 2000,
          showConfirmButton: false,
          background: '#f5e6d3',
          color: '#8b4513'
        });
        navigate("/home");
      } else {
        const errorMsg = result?.error || "Login failed";
        await Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: errorMsg.includes("Invalid credentials") || errorMsg.includes("not found")
            ? "Email or password is incorrect. Please try again or sign up!"
            : errorMsg,
          confirmButtonColor: '#d5a67e'
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("🔧 Connection issue. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-10">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/background.png')" }}
      />
      {/* Warm color overlay */}
      <div className="absolute inset-0 bg-[#d5a67e] opacity-60" />

      {/* Content */}
      <div className="relative w-full max-w-5xl bg-[#d5a67e]/80 backdrop-blur-lg shadow-2xl rounded-3xl border border-black overflow-hidden grid grid-cols-1 md:grid-cols-2 transition-all duration-300">

        {/* Left Form Section */}
        <div className="p-10 flex flex-col justify-center">
          <div className="text-center mb-8">
            <img
              src="../src/assets/logo.png"
              alt="Pet Connect Logo"
              className="mx-auto h-20 hover:scale-105 transition-transform duration-300"
            />
            <h2 className="text-3xl font-bold text-black mt-4 tracking-wide">
              Welcome Back
            </h2>
            <p className="text-sm text-black/70 mt-1">
              Log in to access your account
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#8c6239] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#8c6239] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#4d2e1d] text-white rounded-xl font-semibold hover:bg-[#3b2417] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="text-center text-sm text-black/80">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-black font-semibold hover:underline cursor-pointer"
              >
                Sign Up
              </Link>
            </div>

            <div className="relative mt-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-[#d5a67e]/80 px-2 text-black">or</span>
              </div>
            </div>

            <button className="w-full mt-4 py-3 flex items-center justify-center border border-black rounded-xl bg-white hover:bg-gray-100 transition-all font-medium">
              <svg
                className="h-5 w-5 mr-2"
                viewBox="0 0 533.5 544.3"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#4285F4"
                  d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.4H272v95.4h147.1c-6.4 34.6-25.5 63.9-54.4 83.4v68h87.8c51.4-47.4 80.9-117.3 80.9-196.4z"
                />
                <path
                  fill="#34A853"
                  d="M272 544.3c73.6 0 135.3-24.4 180.3-66.4l-87.8-68c-24.4 16.4-55.6 26-92.5 26-71 0-131.2-47.9-152.8-112.1h-90.3v70.6C80.6 483.4 169.6 544.3 272 544.3z"
                />
                <path
                  fill="#FBBC05"
                  d="M119.2 323.8c-6.2-18.4-9.8-38.1-9.8-58.3s3.6-39.9 9.8-58.3V136.6h-90.3C8.6 181.2 0 225.6 0 270.1s8.6 88.9 28.9 133.5l90.3-70.6z"
                />
                <path
                  fill="#EA4335"
                  d="M272 107.7c39.9 0 75.7 13.8 103.8 40.7l77.8-77.8C407.3 24.6 345.6 0 272 0 169.6 0 80.6 60.9 28.9 136.6l90.3 70.6c21.5-64.2 81.7-112.1 152.8-112.1z"
                />
              </svg>
              Continue with Google
            </button>
          </form>
        </div>

        {/* Right Image Section */}
        <div className="hidden md:flex items-center justify-center bg-[#efe3d4]">
          <img
            src="../src/assets/post-lost.png"
            alt="Cute dog stack"
            className="object-contain max-h-[90%] p-6"
          />
        </div>
      </div>
    </div>
  );
}
