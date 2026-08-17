import { Link, useParams } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { resolveContentAssetUrl, useContent } from "../content-store";
import "../styles/project-detail.css";

const formatReleasePeriod = (project) => {
  const period = project.releasePeriod || "TBD";
  if (period === "not-for-release") return "Not for release";
  if (period === "TBD") return "TBD";
  if (["Q1", "Q2", "Q3", "Q4"].includes(period)) {
    const year = project.releaseYear || new Date().getFullYear();
    return `${period} ${year}`;
  }
  return period;
};

const ProjectPage = () => {
  const { slug } = useParams();
  const { content } = useContent();
  const project = content.projects.find((entry) => entry.slug === slug);

  if (!project) {
    return (
      <main className="project-detail project-empty">
        <h1>Project not found.</h1>
        <Link to="/projects">Return to projects</Link>
      </main>
    );
  }

  const imageUrl = project.image ? resolveContentAssetUrl(project.image) : null;

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

      <main className="project-detail">
        <article className="project-article">
          <Link className="project-back" to="/projects">
            <span className="material-symbols-outlined">arrow_back</span>
            Back to projects
          </Link>

          <header className="project-header">
            <span className="project-meta-label">
              {project.category} &middot; {project.year}
            </span>
            <h1>{project.title}</h1>
            {project.credits && project.credits.length > 0 && (
              <div className="project-credits-inline">
                <strong>Credits:</strong>{" "}
                {project.credits.map((c, i) => (
                  <span key={i} className="project-credit-name">
                    {c?.name || ""}
                    {i < project.credits.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
            )}
            {project.tags && (
              <div className="project-tags">
                {project.tags.split(",").map((tag, i) => (
                  <span key={i} className="project-tag">{tag.trim()}</span>
                ))}
              </div>
            )}
          </header>

          {imageUrl && (
            <div className="project-hero-image">
              <img src={imageUrl} alt={project.title} />
            </div>
          )}

          <section className="project-body">
            <div className="project-summary">
              <h2>Overview</h2>
              <p>{project.summary}</p>
            </div>

            {project.body && (
              <div className="project-description">
                {project.body.split("\n").map((paragraph, index) =>
                  paragraph.trim() ? <p key={index}>{paragraph}</p> : null
                )}
              </div>
            )}
          </section>

          <div className="project-links">
            {project.githubUrl ? (
              <a
                className="project-github-link"
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="material-symbols-outlined">code</span>
                View on GitHub
                <span className="material-symbols-outlined">north_east</span>
              </a>
            ) : (
              <div className="project-release-badge">
                <span className="material-symbols-outlined">calendar_month</span>
                <div>
                  <span className="project-release-label">Release period</span>
                  <strong>{formatReleasePeriod(project)}</strong>
                </div>
              </div>
            )}
            {project.caseStudyUrl && (
              <a
                className="project-casestudy-link"
                href={project.caseStudyUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="material-symbols-outlined">description</span>
                Case Study
                <span className="material-symbols-outlined">north_east</span>
              </a>
            )}
          </div>

          {project.credits && project.credits.length > 0 && (
            <section className="project-credits">
              <h3>Credits</h3>
              <ul>
                {project.credits.map((c, i) => (
                  <li key={i}>
                    {c?.url ? (
                      <a href={c.url} target="_blank" rel="noopener noreferrer">
                        {c.name}
                      </a>
                    ) : (
                      <span>{c.name}</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <Link className="project-back-bottom" to="/projects">
            <span className="material-symbols-outlined">arrow_back</span>
            Back to all projects
          </Link>
        </article>
      </main>

      <Footer brand="VUSANI EARL" copyright="\u00a9 2026 Vusani Earl Mulaudzi. Built with precision." />
    </>
  );
};

export default ProjectPage;