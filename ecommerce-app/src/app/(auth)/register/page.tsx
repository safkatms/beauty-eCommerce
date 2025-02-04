"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Facebook,
  LogIn,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    // Check if password and confirm password match
    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match");
      setMessageType("error");
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("Registration successful!");
      setMessageType("success");
    } else {
      setMessage(data.error || "Something went wrong");
      setMessageType("error");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 relative">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-pink-600">
          Register
        </h2>
        {/* Message Alert at the top */}
        {message && (
          <div
            className={`absolute top-0 left-1/2 transform -translate-x-1/2 p-4 w-full max-w-md rounded-md text-white flex items-center justify-between transition-all duration-500 ${
              messageType === "success"
                ? "bg-green-600 shadow-lg scale-105"
                : "bg-red-600 shadow-lg scale-105"
            }`}
          >
            <div className="flex items-center space-x-3">
              {messageType === "success" ? (
                <CheckCircle className="text-white" size={20} />
              ) : (
                <XCircle className="text-white" size={20} />
              )}
              <p className="font-semibold">{message}</p>
            </div>
            <button
              className="text-white hover:bg-opacity-80 transition"
              onClick={() => setMessage("")}
            >
              &times;
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Name Input */}
          <div>
            <label className="text-sm font-medium text-gray-600">Name</label>
            <div className="relative mt-1">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Enter your name"
                className="pl-10 w-full border rounded-md p-2"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label className="text-sm font-medium text-gray-600">Email</label>
            <div className="relative mt-1">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="email"
                placeholder="Enter your email"
                className="pl-10 w-full border rounded-md p-2"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Password
            </label>
            <div className="relative mt-1">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="pl-10 pr-10 w-full border rounded-md p-2"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Confirm Password
            </label>
            <div className="relative mt-1">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className="pl-10 pr-10 w-full border rounded-md p-2"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="w-full bg-pink-600 text-white py-2 rounded-md hover:bg-pink-700"
          >
            Register
          </button>

          {/* OR Divider */}
          <div className="flex items-center justify-center gap-2">
            <span className="w-full h-[1px] bg-gray-300"></span>
            <span className="text-sm text-gray-500">OR</span>
            <span className="w-full h-[1px] bg-gray-300"></span>
          </div>

          {/* Social Register Buttons */}
          <div className="flex space-x-4">
            <button className="w-full flex items-center justify-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
              <Facebook size={18} className="mr-2" /> Facebook
            </button>
            <button className="w-full flex items-center justify-center bg-red-600 text-white py-2 rounded-md hover:bg-red-700">
              <LogIn size={18} className="mr-2" /> Google
            </button>
          </div>
        </form>

        {/* Login Link */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-pink-600 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
