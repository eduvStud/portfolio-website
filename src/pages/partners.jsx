import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { resolveContentAssetUrl, useContent } from "../content-store";
import "../styles/partners.css";

const slugify = (value) =>
  value
    ?.toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "";

const PartnersPage = () => {
  const location = useLocation();
  const { content } = useContent();
  const [vortex, neon, stratus, orbit] = content.partners;
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    const cards = document.querySelectorAll(".partner-spotlight-card");

    const handleSpotlight = (event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const spotlight = event.currentTarget.querySelector(".spotlight-gradient");
      if (spotlight) {
        spotlight.style.left = `${x}px`;
        spotlight.style.top = `${y}px`;
      }
    };

    cards.forEach((card) => {
      card.addEventListener("mousemove", handleSpotlight);
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";
      card.style.transition = "all 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
          }
        });
      },
      { threshold: 0.1 }
    );

    cards.forEach((card) => {
      observer.observe(card);
    });

    return () => {
      cards.forEach((card) => {
        card.removeEventListener("mousemove", handleSpotlight);
      });
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <Navbar
        brand={content.profile.shortName}
        brandHref="/"
        activeLabel="Partners"
        links={[
          { label: "About me", href: "/about" },
          { label: "Projects", href: "/projects" },
          { label: "Blog", href: "/blog" },
          { label: "Partners", href: "/partners" },
          { label: "Contact", href: "/contact" },
        ]}
      />

      <main className="partners-main">
        <header className="partners-header">
          <p>Strategic Ecosystem</p>
          <h1>COLLABORATING AT THE EDGE OF PRECISION.</h1>
          <p>
            Architecture, infrastructure, and design engineering. We partner with firms that share
            our obsession with technical excellence and aesthetic rigor.
          </p>
        </header>

        <div className="bento-grid">
          {vortex && <div id={slugify(vortex.name)} className="col-span-12 col-md-8 partner-spotlight-card group">
            <div className="spotlight-gradient" />
            <div className="partner-card-content">
              <div className="partner-card-head">
                <div>
                  <span>PARTNER_01</span>
                  <h2>{vortex.name}</h2>
                </div>
                <div className="partner-icon-box">
                  <span className="material-symbols-outlined">filter_vintage</span>
                </div>
              </div>

              <div className="partner-two-col">
                <div className="partner-copy-block">
                  <p>
                    {vortex.description}
                  </p>
                  <div className="partner-tag-list">
                    <span>CFD Analysis</span>
                    <span>Parametric Design</span>
                  </div>
                </div>
                <div className="partner-link-right">
                  <Link to="/contact">
                    VIEW CASE STUDY <span className="material-symbols-outlined">north_east</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>}

          {neon && <div id={slugify(neon.name)} className="col-span-12 col-md-4 partner-spotlight-card group">
            <div className="spotlight-gradient" />
            <div className="partner-card-content">
              <div className="partner-card-head compact">
                <div>
                  <span>PARTNER_02</span>
                  <h2>{neon.name}</h2>
                </div>
                <span className="material-symbols-outlined icon-lg">lightbulb</span>
              </div>
              <p className="grow-copy">
                {neon.description}
              </p>
              <div className="partner-bottom-link">
                <Link to="/contact">Contact {neon.name}</Link>
              </div>
            </div>
          </div>}

          {stratus && <div id={slugify(stratus.name)} className="col-span-12 col-md-5 partner-spotlight-card group">
            <div className="spotlight-gradient" />
            <div className="partner-card-content">
              <div className="partner-card-head compact">
                <div>
                  <span>PARTNER_03</span>
                  <h2>{stratus.name}</h2>
                </div>
                <span className="material-symbols-outlined icon-lg">cloud_done</span>
              </div>

              <div className="partner-copy-block">
                <div className="infra-score">
                  <div>
                    <span>INFRASTRUCTURE SCORE</span>
                    <span className="primary">99.8%</span>
                  </div>
                  <div className="score-bar">
                    <div className="score-fill" />
                  </div>
                </div>
                <p>
                  {stratus.description}
                </p>
              </div>
              <Link className="lower-link" to="/contact">Contact {stratus.name}</Link>
            </div>
          </div>}

          {orbit && <div id={slugify(orbit.name)} className="col-span-12 col-md-7 partner-spotlight-card group">
            <div className="spotlight-gradient" />
            <div className="partner-card-content">
              <div className="partner-card-head compact">
                <div>
                  <span>PARTNER_04</span>
                  <h2>{orbit.name}</h2>
                </div>
                <div className="live-collab">
                  <div className="live-dot" />
                  <span>LIVE COLLAB</span>
                </div>
              </div>

              <div className="orbit-grid">
                <div className="orbit-image-wrap">
                  {orbit.image ? (
                    <img src={resolveContentAssetUrl(orbit.image)} alt={`${orbit.name} visual`} />
                  ) : (
                    <div className="editable-partner-image-placeholder">
                      <span>No image configured</span>
                    </div>
                  )}
                  <div className="orbit-overlay">
                    <span>Station Delta-9 Visualizer</span>
                  </div>
                </div>
                <div className="orbit-copy">
                  <p>
                    {orbit.description}
                  </p>
                  <div className="orbit-btn-stack">
                    <Link to="/contact">JOIN THE NETWORK</Link>
                    <Link to="/contact">TECHNICAL SPECS</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>}
        </div>

        <section className="partners-table-section">
          <h3>ECOSYSTEM_DATA</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>PARTNER_ID</th>
                  <th>CORE_STACK</th>
                  <th>INTEGRATION_LVL</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {content.partners.map((partner, index) => <tr key={`${partner.name}-${index}`}>
                  <td>{String(index + 1).padStart(2, "0")} ({partner.name})</td>
                  <td>{partner.description}</td>
                  <td>{partner.websiteUrl || "Not configured"}</td>
                  <td><span className="status-dot" /> ACTIVE</td>
                </tr>)}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Footer brand="VUSANI EARL" copyright="© 2026 Vusani Earl Mulaudzi. Built with precision." />
    </>
  );
};

export default PartnersPage;
