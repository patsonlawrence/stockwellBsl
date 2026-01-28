"use client";

import { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

export default function ResetPasswordButton({ email }: { email: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleReset = async () => {
    setLoading(true);
    setMessage("");
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent!");
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleReset}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {loading ? "Sending..." : "Send Password Reset Email"}
      </button>
      {message && <p className="mt-2 text-sm text-green-700">{message}</p>}
    </div>
  );
}
