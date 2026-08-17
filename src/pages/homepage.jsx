import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import "../styles/homepage.css";
import { resolveContentAssetUrl, useContent } from "../content-store";

const homepageTheme = {
  backgroundColor: "#131313",
};

const HomePage = () => {
  const navigate = useNavigate();
  const { content } = useContent();
  const homepageAssets = {
    heroMediaUrl: content.home.heroMediaUrl,
    heroMediaPoster: content.home.heroMediaPoster || "",
  };

  const getMediaType = (url) => {
    if (!url) return null;
    const resolved = resolveContentAssetUrl(url);
    const extension = resolved.split("?")[0].split("#")[0].split(".").pop()?.toLowerCase();
    if (!extension) return null;
    const videoExtensions = ["mp4", "webm", "ogg"];
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "avif", "svg"];
    if (videoExtensions.includes(extension)) return "video";
    if (imageExtensions.includes(extension)) return "image";
    return null;
  };

  const renderMedia = (url, alt, className) => {
    const resolvedUrl = resolveContentAssetUrl(url);
    const type = getMediaType(url);
    if (!resolvedUrl || !type) return null;
    if (type === "video") {
      return (
        <video className={className} src={resolvedUrl} autoPlay loop muted playsInline />
      );
    }
    return <img className={className} src={resolvedUrl} alt={alt} />;
  };

  const renderBackgroundMedia = (url, label) => {
    const resolvedUrl = resolveContentAssetUrl(url);
    const type = getMediaType(url);
    if (!resolvedUrl || !type) return null;
    if (type === "video") {
      return (
        <video
          className="project-media-fill project-media-video"
          src={resolvedUrl}
          autoPlay
          loop
          muted
          playsInline
          aria-label={label}
        />
      );
    }
    return (
      <div
        className="project-media-fill"
        style={{ backgroundImage: `url(${resolvedUrl})` }}
        aria-label={label}
      />
    );
  };

  const slugify = (value) =>
    value
      ?.toString()
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "";

  const homeProjects = content.projects.slice(0, 6);
  const homePartners = content.partners.slice(0, 4);
  const homePosts = content.posts.filter((post) => post.status !== "draft").slice(0, 3);
  useEffect(() => {
    const handleMouseMove = (event) => {
      document.querySelectorAll(".spotlight-card").forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
      });

      const xOffset = (event.clientX - window.innerWidth / 2) * 0.01;
      const yOffset = (event.clientY - window.innerHeight / 2) * 0.01;
      document.querySelectorAll(".parallax-bg").forEach((element) => {
        element.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
      });
    };

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = Number(entry.target.dataset.delay || 0);
            window.setTimeout(() => {
              entry.target.classList.add("visible");
            }, delay);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".reveal-section").forEach((element) => {
      revealObserver.observe(element);
    });

    const nav = document.getElementById("main-nav");
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && nav) {
            if (entry.target.classList.contains("bg-on-surface")) {
              nav.classList.add("nav-light");
            } else {
              nav.classList.remove("nav-light");
            }
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "-64px 0px 0px 0px",
      }
    );

    document.querySelectorAll("main section").forEach((section) => {
      sectionObserver.observe(section);
    });

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      revealObserver.disconnect();
      sectionObserver.disconnect();
    };
  }, []);

  return (
    <>
      {/* background overlays removed to keep backgrounds solid */}

      <Navbar
        brand={content.profile.shortName}
        brandHref="#home"
        activeLabel="Home"
        links={[]}
      />

      <main className="homepage" style={{ backgroundColor: homepageTheme.backgroundColor }}>
        <section id="home" className="portfolio-section section-home bg-surface">
          <div className="hero-media-layer parallax-bg animate-ken-burns" aria-hidden="true">
            {homepageAssets.heroMediaUrl ? (
              getMediaType(homepageAssets.heroMediaUrl) === "video" ? (
                <video
                  className="hero-media-video"
                  src={resolveContentAssetUrl(homepageAssets.heroMediaUrl)}
                  poster={homepageAssets.heroMediaPoster ? resolveContentAssetUrl(homepageAssets.heroMediaPoster) : undefined}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <img
                  className="hero-media-image"
                  src={resolveContentAssetUrl(homepageAssets.heroMediaUrl)}
                  alt="Hero media"
                />
              )
            ) : (
              <div className="hero-media-placeholder">
                <span>Set heroMediaUrl in your home content record</span>
              </div>
            )}
            <div className="hero-media-scrim" />
          </div>

          <div className="section-inner editorial-grid home-grid">
            <div className="home-copy reveal-section animate-float" data-delay="100">
              <span className="label-mono text-primary">Front-End Developer &amp; UI Designer</span>
            </div>
            <div className="home-link reveal-section" data-delay="300">
              <a className="inline-link animate-underline" href="#projects">
                <span className="label-mono">EXPLORE WORK</span>
                <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
              </a>
              <Link className="inline-link home-login-link" to="/login">
                <span className="label-mono">LOGIN</span>
                <span className="material-symbols-outlined" aria-hidden="true">lock</span>
              </Link>
            </div>
          </div>

          <div className="name-banner reveal-section" data-delay="500">
            <span>VUSANI EARL</span>
            <span>MULAUDZI</span>
          </div>

          <div className="section-inner section-page-nav">
            <Link className="section-page-btn animate-pulse-glow" to="/about">
              <span>About Me</span>
              <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
            </Link>
          </div>
        </section>

        <section id="about" className="portfolio-section bg-on-surface text-surface reveal-section">
          <div className="section-inner editorial-grid about-grid">
            <div>
              <span className="label-mono section-index">01 / PHILOSOPHY</span>
              <h2 className="headline-md">Precision meets technical integrity.</h2>
            </div>

            <div>
              <p className="lead-copy drop-cap">
                I specialize in building technical interfaces that prioritize <span className="text-surface italic">precision</span>, performance, and aesthetic integrity. My approach blends engineering rigor with editorial design.
              </p>

              <div className="two-col-pillar-grid">
                <div>
                  <span className="label-mono pillar-index">02 / PILLAR</span>
                  <h4>Structural Integrity</h4>
                  <p>Code is the foundation, but the interface is where the value is felt. I focus on creating systems that are as scalable as they are beautiful.</p>
                </div>
                <div>
                  <span className="label-mono pillar-index">03 / PILLAR</span>
                  <h4>Absolute Efficiency</h4>
                  <p>Performance is a design feature. Every millisecond saved is a moment of trust earned with the user.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="section-inner section-page-nav">
            <Link className="section-page-btn animate-pulse-glow" to="/about">
              <span>About Me</span>
              <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
            </Link>
          </div>
        </section>

        <section id="projects" className="portfolio-section bg-surface text-on-surface reveal-section">
          <div className="section-inner">
            <div className="section-head-block">
              <span className="label-mono text-primary">Selected Artefacts</span>
              <h2 className="display-lg">Digital<br />Experiences</h2>
            </div>

            <div className="editorial-grid projects-grid stagger-children">
              {homeProjects.map((project, index) => {
                const projectCategoryPresets = {
                  'e-commerce': '/media/projects/ecommerce.svg',
                  'product': '/media/projects/product.svg',
                  'architecture': '/media/projects/architecture.svg',
                  'system integration': '/media/projects/system-integration.svg',
                  'web-app': '/media/projects/product.svg',
                  'design agency': '/media/projects/architecture.svg',
                  'student accommodation': '/media/projects/architecture.svg',
                  'clothing store': '/media/projects/ecommerce.svg',
                };
                const projectPreset = project?.category
                  ? projectCategoryPresets[project.category.toLowerCase()] || '/media/projects/default.svg'
                  : '/media/projects/default.svg';
                return (
              <Link
                key={`home-project-${index}`}
                className="project-card spotlight-card project-preview-link animate-shimmer animate-scale-in"
                to={`/projects/${project.slug}`}
              >
                <div className="project-media square">
                  {project?.image ? (
                    renderBackgroundMedia(project.image, project?.title || "Project media")
                  ) : (
                    <img src={projectPreset} alt={project?.category || 'Project'} className="project-preset-image" />
                  )}
                </div>
                <div className="project-body">
                  <h4>{project?.title || "No project configured"}</h4>
                  <p>{project?.summary || project?.category || project?.tags || ""}</p>
                </div>
              </Link>
            );
            })}
            </div>
          </div>

          <div className="section-inner section-page-nav">
            <Link className="section-page-btn animate-pulse-glow" to="/projects">
              <span>Open Projects Page</span>
              <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
            </Link>
          </div>
        </section>

        <section id="partners" className="portfolio-section bg-on-surface text-surface reveal-section">
          <div className="section-inner">
            <span className="label-mono centered section-eyebrow">Global Collaborations</span>
            <div className="partner-preview-grid">
              {homePartners.map((partner, index) => (
                <Link
                  key={`${partner.name}-${index}`}
                  to={`/partners#${slugify(partner.name)}`}
                  className="partner-preview-card animate-icon-wiggle animate-scale-in"
                >
                  <div>
                    <span className="label-mono">Partner</span>
                    <h4>{partner.name}</h4>
                    <p>{partner.description || "No partner description available."}</p>
                  </div>
                  <span className="material-symbols-outlined" aria-hidden="true">north_east</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="section-inner section-page-nav">
            <Link className="section-page-btn animate-pulse-glow" to="/partners">
              <span>Open Partners Page</span>
              <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
            </Link>
          </div>
        </section>

        <section id="blog" className="portfolio-section bg-surface text-on-surface reveal-section">
          <div className="section-inner">
            <div className="editorial-grid section-head-grid">
              <div>
                <span className="label-mono text-primary">Journal</span>
                <h2 className="display-lg">Thoughts on<br />Performance</h2>
              </div>
            </div>

            <div className="blog-grid stagger-children">
              {[0, 1, 2].map((index) => {
                const post = homePosts[index];
                const categoryPresets = {
                  'performance': '/media/blog/performance.svg',
                  'architecture': '/media/blog/architecture.svg',
                  'design systems': '/media/blog/design-systems.svg',
                };
                const presetImage = post?.category ? categoryPresets[post.category.toLowerCase()] || '/media/blog/default.svg' : '/media/blog/default.svg';
                return (
                  <Link
                    key={post?.slug || index}
                    className="blog-card spotlight-card blog-preview-link"
                    to={post?.slug ? `/blog/${post.slug}` : "/blog"}
                  >
                    <div className="blog-image-wrap">
                      {post?.image ? (
                        <img src={resolveContentAssetUrl(post.image)} alt={post?.title || `Blog ${index + 1}`} />
                      ) : (
                        <img src={presetImage} alt={post?.category || 'Blog'} className="blog-preset-image" />
                      )}
                    </div>
                    <span className="blog-meta">{post?.category} · {post?.date}</span>
                    <h4>{post?.title || "No post configured"}</h4>
                    <p>{post?.excerpt}</p>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="section-inner section-page-nav">
            <Link className="section-page-btn animate-pulse-glow" to="/blog">
              <span>Open Blog Page</span>
              <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
            </Link>
          </div>
        </section>

        <section id="contact" className="portfolio-section bg-on-surface text-surface reveal-section">
          <div className="section-inner editorial-grid contact-grid">
            <div>
              <h2 className="display-lg">Have a project<br />in mind?</h2>
              <div className="contact-copy">
                <p>I'm currently accepting new projects for Q4 2026. Reach out to start a conversation.</p>
                <a href={`mailto:${content.profile.email}`}>{content.profile.email}</a>
              </div>
            </div>

            <div>
              <form className="contact-form-modern" onSubmit={(event) => { event.preventDefault(); navigate("/contact"); }}>
                <div className="field-wrap">
                  <label htmlFor="name">NAME</label>
                  <input id="name" type="text" placeholder="John Doe" />
                </div>

                <div className="field-wrap">
                  <label htmlFor="email">EMAIL</label>
                  <input id="email" type="email" placeholder="john@example.com" />
                </div>

                <div className="field-wrap">
                  <label htmlFor="message">MESSAGE</label>
                  <textarea id="message" rows={4} placeholder="Tell me about your project..." />
                </div>

                <button type="submit">Send Inquiry</button>
              </form>
            </div>
          </div>

          <div className="section-inner section-page-nav">
            <Link className="section-page-btn animate-pulse-glow" to="/contact">
              <span>Open Contact Page</span>
              <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
            </Link>
          </div>
        </section>

        <section id="faq" className="portfolio-section bg-surface text-on-surface reveal-section">
          <div className="section-inner editorial-grid faq-grid">
            <div>
              <h2 className="faq-title">Frequently<br />Asked</h2>
            </div>

            <div>
              <div className="faq-list">
                <details>
                  <summary>
                    <span>What is your typical turnaround?</span>
                    <span className="material-symbols-outlined" aria-hidden="true">add</span>
                  </summary>
                  <div>
                    Typical projects range from 4 to 12 weeks depending on complexity. We focus on depth and quality over speed.
                  </div>
                </details>

                <details>
                  <summary>
                    <span>What is your stack of choice?</span>
                    <span className="material-symbols-outlined" aria-hidden="true">add</span>
                  </summary>
                  <div>
                    My current technology stack is Node.js, javaScript, Tailwind CSS, SQL and Supabase/pocketbase for speed and scalability.
                  </div>
                </details>
              </div>
            </div>
          </div>

          <div className="section-inner section-page-nav">
            <Link className="section-page-btn animate-pulse-glow" to="/contact">
              <span>Open Contact Page</span>
              <span className="material-symbols-outlined" aria-hidden="true">arrow_upward</span>
            </Link>
          </div>

          
        </section>
      </main>

      <Footer brand="VUSANI EARL" copyright="© 2026 Vusani Earl Mulaudzi. Built with impact in mind." />
    </>
  );
};

export default HomePage; 