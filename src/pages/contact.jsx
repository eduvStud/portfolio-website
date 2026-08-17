import { useState, useRef } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import "../styles/contact.css";
import { API_URL, useContent } from "../content-store";

const FAQS = [
  {
    q: "What is your typical project timeline?",
    a: "Every architecture is unique. Typical core builds range from 4 to 12 weeks depending on technical complexity and stakeholder integration requirements.",
  },
  {
    q: "Do you offer ongoing technical maintenance?",
    a: "Yes. Post-launch reliability is critical. I offer retention packages for technical oversight, performance optimization, and iterative updates.",
  },
  {
    q: "What is your primary technology stack?",
    a: "I specialize in Node.js, JavaScript, Tailwind CSS, and react.",
  },
];

const PROJECT_TYPES = [
  "Web Architecture",
  "Brand Identity",
  "Technical Consulting",
  "Full-stack Engineering",
];

const ContactPage = () => {
  const { content } = useContent();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    projectType: PROJECT_TYPES[0],
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const cardRefs = useRef({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/inquiries`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not send your message.");
      setIsSubmitted(true);
      setFormData({ name: "", email: "", projectType: PROJECT_TYPES[0], message: "" });
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSpotlightMove = (key) => (e) => {
    const card = cardRefs.current[key];
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--x", `${e.clientX - rect.left}px`);
    card.style.setProperty("--y", `${e.clientY - rect.top}px`);
  };

  const toggleFaq = (index) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  return (
    <>
      <Navbar
        brand={content?.profile?.shortName || "V. EARL"}
        brandHref="/"
        activeLabel="Contact"
        links={[
          { label: "About me", href: "/about" },
          { label: "Projects", href: "/projects" },
          { label: "Blog", href: "/blog" },
          { label: "Partners", href: "/partners" },
          { label: "Contact", href: "/contact" },
        ]}
      />

      <main className="contact-main">
        {/* Hero */}
        <section className="hero">
          <div className="hero-inner">
            <p className="eyebrow">Contact</p>
            <h1 className="hero-title">
              LET&apos;S BUILD THE NEXT <span className="accent-text">ARCHITECTURE.</span>
            </h1>
          </div>
          <div className="hero-bgtext" aria-hidden="true">
            CONTACT
          </div>
        </section>

        {/* Split Grid */}
        <section className="contact-grid-section">
          <div className="contact-grid">
            {/* Form */}
            <div
              className="panel form-panel spotlight-card"
              id="form-container"
              ref={(el) => (cardRefs.current.form = el)}
              onMouseMove={handleSpotlightMove("form")}
            >
              <div className="form-transition-wrap">
                {isSubmitted ? (
                  <div className="success-state" role="alert">
                    <span className="material-symbols-outlined success-icon">
                      task_alt
                    </span>
                    <h2>Message Sent!</h2>
                    <p>
                      Thank you for reaching out. I&apos;ll get back to you as
                      soon as possible.
                    </p>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setIsSubmitted(false)}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="panel-title">Send an Inquiry</h2>
                    <form
                      className="inquiry-form"
                      onSubmit={handleSubmit}
                      noValidate
                    >
                      <div className="form-row">
                        <div className="field-group">
                          <label htmlFor="contact-name">FULL NAME</label>
                          <input
                            type="text"
                            id="contact-name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            aria-required="true"
                            aria-invalid={!!errors.name}
                            aria-describedby={
                              errors.name ? "name-error" : undefined
                            }
                          />
                          {errors.name && (
                            <span
                              id="name-error"
                              role="alert"
                              className="field-error"
                            >
                              {errors.name}
                            </span>
                          )}
                        </div>

                        <div className="field-group">
                          <label htmlFor="contact-email">EMAIL ADDRESS</label>
                          <input
                            type="email"
                            id="contact-email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            aria-required="true"
                            aria-invalid={!!errors.email}
                            aria-describedby={
                              errors.email ? "email-error" : undefined
                            }
                          />
                          {errors.email && (
                            <span
                              id="email-error"
                              role="alert"
                              className="field-error"
                            >
                              {errors.email}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="field-group">
                        <label htmlFor="contact-project-type">
                          PROJECT TYPE
                        </label>
                        <select
                          id="contact-project-type"
                          name="projectType"
                          value={formData.projectType}
                          onChange={handleChange}
                        >
                          {PROJECT_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="field-group">
                        <label htmlFor="contact-message">MESSAGE</label>
                        <textarea
                          id="contact-message"
                          name="message"
                          rows={4}
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Tell me about your vision..."
                          aria-required="true"
                          aria-invalid={!!errors.message}
                          aria-describedby={
                            errors.message ? "message-error" : undefined
                          }
                        />
                        {errors.message && (
                          <span
                            id="message-error"
                            role="alert"
                            className="field-error"
                          >
                            {errors.message}
                          </span>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={isSubmitting}
                      >
                        <span
                          className={`btn-label ${
                            isSubmitting ? "btn-label--hidden" : ""
                          }`}
                        >
                          Initialize Project
                        </span>
                        {isSubmitting && (
                          <span className="btn-spinner" aria-hidden="true" />
                        )}
                      </button>
                      {errors.form && <p className="field-error" role="alert">{errors.form}</p>}
                    </form>
                  </>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="metadata-col">
              <div
                className="panel spotlight-card"
                ref={(el) => (cardRefs.current.location = el)}
                onMouseMove={handleSpotlightMove("location")}
              >
                <div className="meta-row">
                  <span className="material-symbols-outlined meta-icon">
                    location_on
                  </span>
                  <div>
                    <p className="meta-label">Base of Operations</p>
                    <h3 className="meta-value">{content?.profile?.location || "Location"}</h3>
                  </div>
                </div>
                <div className="map-frame" role="img" aria-label="Stylized map of Johannesburg" />
              </div>

              <div
                className="panel spotlight-card"
                ref={(el) => (cardRefs.current.email = el)}
                onMouseMove={handleSpotlightMove("email")}
              >
                <div className="meta-row">
                  <span className="material-symbols-outlined meta-icon">
                    alternate_email
                  </span>
                  <div>
                    <p className="meta-label">Direct Communication</p>
                    <a className="meta-link" href={`mailto:${content?.profile?.email || "contact@example.com"}`}>
                      {content?.profile?.email || "contact@example.com"}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Marquee */}
        <div className="marquee">
          <div className="marquee-track" aria-hidden="true">
            <span>Available for Projects 2026 &bull; Architecture &bull; Engineering &bull; Strategy &bull;</span>
            <span>Available for Projects 2026 &bull; Architecture &bull; Engineering &bull; Strategy &bull;</span>
          </div>
        </div>

        {/* FAQ */}
        <section className="faq-section">
          <div className="faq-inner">
            <p className="eyebrow eyebrow--center">Protocol &amp; Inquiries</p>
            <div className="faq-list">
              {FAQS.map((item, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={item.q} className="faq-item">
                    <button
                      type="button"
                      className="faq-question"
                      onClick={() => toggleFaq(index)}
                      aria-expanded={isOpen}
                    >
                      <span>{item.q}</span>
                      <span
                        className={`material-symbols-outlined faq-icon ${
                          isOpen ? "faq-icon--open" : ""
                        }`}
                      >
                        add
                      </span>
                    </button>
                    <div
                      className={`faq-answer-wrap ${
                        isOpen ? "faq-answer-wrap--open" : ""
                      }`}
                    >
                      <p className="faq-answer">{item.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer
        brand="VUSANI EARL"
        copyright="© 2026 Vusani Earl Mulaudzi. Built with precision."
      />
    </>
  );
};

export default ContactPage;