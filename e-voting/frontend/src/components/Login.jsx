import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { verifyVoter } from "../utils/firebase";
import { registerVoterOnChain, getSignerAddress, isVoterRegistered } from "../utils/contract";
import "../styles/main.scss";

export default function Login() {
  const [aadhaar, setAadhaar] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateAadhaar = (v) => /^\d{12}$/.test(v);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateAadhaar(aadhaar)) {
      setError("Aadhaar must be 12 digits");
      return;
    }

    setLoading(true);
    try {
      // verify existence in firebase
      const userData = await verifyVoter(aadhaar);
      if (!userData) throw new Error("Voter not found. Please register first.");

      // connect wallet (optional) and ensure on-chain registration exists
      await getSignerAddress();

      const registeredOnChain = await isVoterRegistered(aadhaar);
      let txHash = null;
      if (!registeredOnChain) {
        txHash = await registerVoterOnChain(aadhaar, userData.age);
      }

      const voterData = {
        aadhaarNumber: aadhaar,
        name: userData.name,
        isLoggedIn: true,
        txHash: txHash || null
      };
      localStorage.setItem("voterData", JSON.stringify(voterData));

      toast.success("Login successful");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card form">
        <header className="auth-header">
          <h2>Voter Login</h2>
          <p className="muted">Enter your 12‑digit Aadhaar number to continue</p>
        </header>

        <form onSubmit={onSubmit} className="candidate-form">
          <div className="form-group">
            <label htmlFor="aadhaar">Aadhaar Number</label>
            <input
              id="aadhaar"
              type="text"
              inputMode="numeric"
              value={aadhaar}
              onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, "").slice(0, 12))}
              placeholder="123412341234"
              required
            />
          </div>

          {error && <div className="error-text">{error}</div>}

          <div className="form-actions">
            <button className="btn primary-btn" type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Login"}
            </button>
            <Link to="/register" className="helper-link">Register new voter</Link>
          </div>
        </form>
      </div>
    </div>
  );
}