import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const { data } = await api.post("/auth/forgot-password", { email });
    setMessage(data.message);
  };

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <form onSubmit={submit} className="glass w-full max-w-md space-y-4 rounded-2xl p-6">
        <h1 className="text-2xl font-extrabold">Forgot Password</h1>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Work email" className="w-full rounded-lg border p-2" />
        <button className="w-full rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white">Send Reset Instructions</button>
        {message && <p className="text-sm text-emerald-600">{message}</p>}
        <Link to="/login" className="text-sm text-brand-600">Back to login</Link>
      </form>
    </div>
  );
}
