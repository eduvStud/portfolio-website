import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { resolveContentAssetUrl, useContent } from "../content-store";
import "../styles/projects.css";

const slugify = (value) =>
  value
    ?.toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "";

const tagList = (tags) =>
  (tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

const ProjectsPage = () => {
  const location = useLocation();
  const { content } = useContent();
  const [featured, ...rest] = content.projects;
  const [projectB, projectC, projectD, ...extraProjects] = rest;

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [location.hash]);

  useEffect(() => {
    const cards = document.querySelectorAll(".spotlight-card");

    const handleMouseMove = (event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      event.currentTarget.style.setProperty("--x", `${x}px`);
      event.currentTarget.style.setProperty("--y", `${y}px`);
    };

    cards.forEach((card) => {
      card.addEventListener("mousemove", handleMouseMove);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".projects-grid article").forEach((element) => {
      observer.observe(element);
    });

    return () => {
      cards.forEach((card) => {
        card.removeEventListener("mousemove", handleMouseMove);
      });
      observer.disconnect();
    };
  }, [content.projects]);

  return (
    <>
      <Navbar
        brand={content.profile.shortName}
        brandHref="/"
        activeLabel="Projects"
        links={[
          { label: "About me", href: "/about" },
          { label: "Projects", href: "/projects" },
          { label: "Blog", href: "/blog" },
          { label: "Partners", href: "/partners" },
          { label: "Contact", href: "/contact" },
        ]}
      />

      <main className="projects-main">
        <section className="projects-hero">
          <div className="projects-container">
            <div className="hero-copy">
              <span>Selected Works / 2022-2024</span>
              <h1>
                ENGINEERING <br /> VISUAL <br /> <span>PRECISION.</span>
              </h1>
            </div>
            <div className="hero-divider" />
          </div>
        </section>

        <section className="projects-grid-section">
          <div className="projects-container projects-grid">
            {featured && (
              <article id={slugify(featured.slug)} className="project-a">
                <Link
                  to={`/projects/${featured.slug}`}
                  className="spotlight-card inner-bezel project-shell split-layout project-card-link"
                >
                  <div className="project-image-wrap tall">
                    {featured.image ? (
                      <img src={resolveContentAssetUrl(featured.image)} alt={`${featured.title} visual`} />
                    ) : (
                      <div className="editable-project-image-placeholder">
                        <span>No image configured</span>
                      </div>
                    )}
                    <div className="image-id-tag">ID: SF-001</div>
                  </div>
                  <div className="project-content">
                    <div>
                      <div className="project-meta-row">
                        <span>
                          {featured.year} / {featured.category}
                        </span>
                        <span className="material-symbols-outlined" aria-hidden="true">
                          north_east
                        </span>
                      </div>
                      <h2>{featured.title}</h2>
                      <p>{featured.summary}</p>
                      <div className="tag-list">
                        {tagList(featured.tags).map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            )}

            {projectB && (
              <article id={slugify(projectB.slug)} className="project-b">
                <Link
                  to={`/projects/${projectB.slug}`}
                  className="spotlight-card inner-bezel project-shell project-card-link"
                >
                  <div className="project-image-wrap large">
                    {projectB.image ? (
                      <img src={resolveContentAssetUrl(projectB.image)} alt={`${projectB.title} visual`} />
                    ) : (
                      <div className="editable-project-image-placeholder">
                        <span>No image configured</span>
                      </div>
                    )}
                  </div>
                  <div className="project-card-body">
                    <div className="project-title-row">
                      <h2>{projectB.title}</h2>
                      <span>{projectB.year}</span>
                    </div>
                    <p>{projectB.summary}</p>
                    <div className="tag-list">
                      {tagList(projectB.tags).map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              </article>
            )}

            {projectC && (
              <article id={slugify(projectC.slug)} className="project-c">
                <Link
                  to={`/projects/${projectC.slug}`}
                  className="spotlight-card inner-bezel project-shell project-card-link"
                >
                  <div className="project-image-wrap medium">
                    {projectC.image ? (
                      <img src={resolveContentAssetUrl(projectC.image)} alt={`${projectC.title} visual`} />
                    ) : (
                      <div className="editable-project-image-placeholder">
                        <span>No image configured</span>
                      </div>
                    )}
                  </div>
                  <div className="project-card-body">
                    <div className="project-title-row">
                      <h2>{projectC.title}</h2>
                      <span>{projectC.year}</span>
                    </div>
                    <p>{projectC.summary}</p>
                    <div className="tag-list">
                      {tagList(projectC.tags).map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              </article>
            )}

            {projectD && (
              <article id={slugify(projectD.slug)} className="project-d">
                <Link to={`/projects/${projectD.slug}`} className="project-feature-contrast project-card-link">
                  <div className="project-feature-index">04</div>
                  <div className="project-feature-copy">
                    <span>{projectD.category}</span>
                    <h2>{projectD.title}</h2>
                    <p>{projectD.summary}</p>
                    <span className="project-feature-cta">
                      View project{" "}
                      <span className="material-symbols-outlined" aria-hidden="true">
                        arrow_forward
                      </span>
                    </span>
                  </div>
                  <div className="project-feature-image">
                    {projectD.image ? (
                      <img src={resolveContentAssetUrl(projectD.image)} alt={`${projectD.title} visual`} />
                    ) : (
                      <div className="editable-project-image-placeholder feature-placeholder">
                        <span>No image configured</span>
                      </div>
                    )}
                    <div className="project-feature-hover" />
                  </div>
                </Link>
              </article>
            )}

            {extraProjects.map((project, index) => (
              <article
                key={`${project.slug}-${index}`}
                id={slugify(project.slug)}
                className="project-extra"
              >
                <Link
                  to={`/projects/${project.slug}`}
                  className="spotlight-card inner-bezel project-shell project-card-link"
                >
                  <div className="project-image-wrap medium">
                    {project.image ? (
                      <img src={resolveContentAssetUrl(project.image)} alt={`${project.title} visual`} />
                    ) : (
                      <div className="editable-project-image-placeholder">
                        <span>No image configured</span>
                      </div>
                    )}
                  </div>
                  <div className="project-card-body">
                    <div className="project-title-row">
                      <h2>{project.title}</h2>
                      <span>{project.year}</span>
                    </div>
                    <p>{project.summary}</p>
                    <div className="tag-list">
                      {tagList(project.tags).map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="projects-stats">
          <div className="projects-container stats-grid">
            <div>
              <span>Deployment Count</span>
              <strong>3+</strong>
            </div>
            <div>
              <span>Frameworks Used</span>
              <strong>5</strong>
            </div>
            <div>
              <span>Total Commits</span>
              <strong>250+</strong>
            </div>
            <div>
              <span>Project Velocity</span>
              <strong>Average: 2 months</strong>
            </div>
          </div>
        </section>

        <section className="projects-cta">
          <div className="projects-cta-inner">
            <h3>
              Ready to build the <span>next</span> architecture?
            </h3>
            <p>Currently accepting complex technical design challenges for Q3 2024.</p>
            <Link to="/contact">Start a Project</Link>
          </div>
        </section>
      </main>

      <Footer brand="VUSANI EARL" copyright="© 2026 Vusani Earl Mulaudzi. Built with precision." />
    </>
  );
};

export default ProjectsPage;
