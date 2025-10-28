import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { registerFirebase } from "../utils/firebase";
import { sanitizeName, sanitizeAadhaar, sanitizeAge, validateAadhaar, validateAge } from "../utils/sanitize";
import "../styles/main.scss";

export default function Register() {
  const [name, setName] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const es = {};
    if (name && sanitizeName(name).length < 2) es.name = "Please enter your full name";
    if (aadhaar && !validateAadhaar(aadhaar)) es.aadhaar = "Aadhaar must be 12 digits";
    if (age && !validateAge(age, 18)) es.age = "You must be 18 or older";
    setErrors(es);
  }, [name, aadhaar, age]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const cleanName = sanitizeName(name);
    const cleanAadhaar = sanitizeAadhaar(aadhaar);
    const cleanAge = sanitizeAge(age);

    if (!cleanName) {
      setErrors({ name: "Name is required" }); return;
    }
    if (!validateAadhaar(cleanAadhaar)) {
      setErrors({ aadhaar: "Enter a valid 12-digit Aadhaar number" }); return;
    }
    if (!validateAge(cleanAge, 18)) {
      setErrors({ age: "You must be 18 or older" }); return;
    }

    setLoading(true);
    try {
      // registerFirebase expects Aadhaar path; server-side rules should enforce security
      await registerFirebase(cleanName, cleanAadhaar, Number(cleanAge));
      toast.success("Registration successful — please login");
      navigate("/login", { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card form" role="main" aria-labelledby="register-title">
        <header className="auth-header">
          <h2 id="register-title">Voter Registration</h2>
          <p className="muted">Register with your Aadhaar to participate</p>
        </header>

        <form onSubmit={onSubmit} className="candidate-form" noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(sanitizeName(e.target.value))}
                placeholder="John Doe"
                required
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && <div id="name-error" className="error-text">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="age">Age</label>
              <input
                id="age"
                name="age"
                type="number"
                min="18"
                value={age}
                onChange={(e) => setAge(sanitizeAge(e.target.value))}
                placeholder="18"
                required
                aria-invalid={!!errors.age}
                aria-describedby={errors.age ? "age-error" : undefined}
              />
              {errors.age && <div id="age-error" className="error-text">{errors.age}</div>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="aadhaar">Aadhaar Number</label>
            <input
              id="aadhaar"
              name="aadhaar"
              inputMode="numeric"
              value={aadhaar}
              onChange={(e) => setAadhaar(sanitizeAadhaar(e.target.value))}
              placeholder="123412341234"
              maxLength={12}
              required
              aria-invalid={!!errors.aadhaar}
              aria-describedby={errors.aadhaar ? "aadhaar-error" : undefined}
            />
            {errors.aadhaar && <div id="aadhaar-error" className="error-text">{errors.aadhaar}</div>}
          </div>

          <div className="form-actions">
            <button className="btn primary-btn" type="submit" disabled={loading || Object.keys(errors).length > 0}>
              {loading ? "Registering..." : "Register"}
            </button>
            <Link to="/login" className="helper-link">Already registered? Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}