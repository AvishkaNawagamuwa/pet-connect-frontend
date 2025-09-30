import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import authService from "../services/authService";
import Swal from 'sweetalert2';

export default function SignUp() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Very simple validation
    if (!fullName.trim()) {
      alert("Please enter your name");
      setLoading(false);
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      alert("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (!password.trim() || password.length < 3) {
      alert("Password must be at least 3 characters");
      setLoading(false);
      return;
    }

    try {
      // Simple registration data
      const userData = {
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        role: 'owner'
      };

      const result = await authService.register(userData);

      if (result && result.success) {
        await Swal.fire({
          icon: 'success',
          title: '🎉 Welcome to PetConnect!',
          text: `Hello ${result.user?.name || fullName}! Your account has been created successfully!`,
          timer: 2000,
          showConfirmButton: false,
          background: '#f5e6d3',
          color: '#8b4513'
        });
        navigate("/home");
      } else {
        // Handle different error cases with better messages
        const errorMsg = result?.error || "Registration failed";

        if (errorMsg.includes("already exists") || errorMsg.includes("already registered") || errorMsg.includes("duplicate")) {
          const result = await Swal.fire({
            icon: 'info',
            title: 'Email Already Registered',
            text: 'This email is already registered. Would you like to login instead?',
            showCancelButton: true,
            confirmButtonText: 'Go to Login',
            cancelButtonText: 'Try Different Email',
            confirmButtonColor: '#d5a67e',
            cancelButtonColor: '#6c757d'
          });

          if (result.isConfirmed) {
            navigate("/login");
          }
        } else {
          await Swal.fire({
            icon: 'error',
            title: 'Registration Failed',
            text: errorMsg,
            footer: '<b>💡 Tip:</b> Try using a different email address',
            confirmButtonColor: '#d5a67e'
          });
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("🔧 Connection issue. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-10">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/background.png')" }}
      />
      <div className="absolute inset-0 bg-[#d5a67e] opacity-60" />

      <div className="relative w-full max-w-5xl bg-[#d5a67e]/80 backdrop-blur-lg shadow-2xl rounded-3xl border border-black overflow-hidden grid grid-cols-1 md:grid-cols-2 transition-all duration-300">
        <div className="p-10 flex flex-col justify-center">
          <div className="text-center mb-8">
            <img
              src="../src/assets/logo.png"
              alt="Pet Connect Logo"
              className="mx-auto h-20 hover:scale-105 transition-transform duration-300"
            />
            <h2 className="text-3xl font-bold text-black mt-4 tracking-wide">
              Create an Account
            </h2>
            <p className="text-sm text-black/70 mt-1">
              Join us to connect with your favorite pets!
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 bg-white/70 focus:outline-none focus:ring-2 focus:ring-[#8c6239] transition-all"
              />
            </div>

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
              <p className="text-xs text-black/60 mt-1">
                💡 If email is already registered, you'll be asked to login instead
              </p>
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
              {loading ? "Creating Account..." : "Sign Up"}
            </button>

            <div className="text-center text-sm text-black/80">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-black font-semibold hover:underline cursor-pointer"
              >
                Login
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

            <button
              type="button"
              onClick={() => alert("Google sign-in is disabled in demo")}
              className="w-full mt-4 py-3 flex items-center justify-center border border-black rounded-xl bg-white hover:bg-gray-100 transition-all font-medium"
            >
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
              Sign up with Google
            </button>
          </form>
        </div>

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
