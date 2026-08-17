import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { useContent } from "../content-store";
import "../styles/blog.css";

const BlogPage = () => {
  const location = useLocation();
  const { content } = useContent();
  const [activeFilter, setActiveFilter] = useState("All Entries");

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [location.hash]);
  const publishedPosts = content.posts.filter((post) => post.status !== "draft");
  const filters = ["All Entries", ...new Set(publishedPosts.map((post) => post.category))];
  const visiblePosts = activeFilter === "All Entries" ? publishedPosts : publishedPosts.filter((post) => post.category === activeFilter);
  useEffect(() => {
    const body = document.body;
    const blogRows = document.querySelectorAll(".blog-row");

    const handleMove = (event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      event.currentTarget.style.setProperty("--x", `${x}px`);
      event.currentTarget.style.setProperty("--y", `${y}px`);
    };

    const handleEnter = (event) => {
      const theme = event.currentTarget.getAttribute("data-theme-trigger");
      if (theme === "light") {
        body.classList.add("light-mode-active");
      } else {
        body.classList.remove("light-mode-active");
      }
    };

    blogRows.forEach((row) => {
      row.addEventListener("mousemove", handleMove);
      row.addEventListener("mouseenter", handleEnter);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const theme = entry.target.getAttribute("data-theme-trigger");
            if (theme === "light") {
              body.classList.add("light-mode-active");
            } else {
              body.classList.remove("light-mode-active");
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    blogRows.forEach((row) => {
      observer.observe(row);
    });

    return () => {
      blogRows.forEach((row) => {
        row.removeEventListener("mousemove", handleMove);
        row.removeEventListener("mouseenter", handleEnter);
      });
      observer.disconnect();
      body.classList.remove("light-mode-active");
    };
  }, []);

  return (
    <>
      <Navbar
        brand="V. EARL"
        brandHref="/"
        activeLabel="Blog"
        links={[
          { label: "About me", href: "/about" },
          { label: "Projects", href: "/projects" },
          { label: "Blog", href: "/blog" },
          { label: "Partners", href: "/partners" },
          { label: "Contact", href: "/contact" },
        ]}
      />

      <main className="blog-main">
        <header className="blog-hero">
          <div className="blog-hero-grid">
            <div>
              <p>Writing and Observations</p>
              <h1>THOUGHTS ON PRECISION.</h1>
            </div>
            <div>
              <p>
                A repository of technical deep-dives, architectural pattern analysis, and the
                occasional rant on interface honesty.
              </p>
            </div>
          </div>
        </header>

        <div className="blog-filter-wrap">
          <div className="blog-filter-row">
            {filters.map((filter) => <button key={filter} type="button" className={activeFilter === filter ? "active" : ""} onClick={() => setActiveFilter(filter)}>{filter}</button>)}
          </div>
        </div>

        <section className="blog-list-section">
          <div className="blog-list">
            {visiblePosts.map((post, index) => <Link key={post.slug} className="blog-row" to={`/blog/${post.slug}`} data-theme-trigger={index % 2 ? "dark" : "light"}>
              <div className="spotlight" />
              <div className="blog-row-grid"><div>{String(index + 1).padStart(2, "0")}</div><div><h2>{post.title}</h2></div><div><div><span>{post.category}</span><span>{post.readTime}</span></div><div>{post.date}</div></div></div>
            </Link>)}
          </div>
        </section>

      </main>

      <Footer brand="VUSANI EARL" copyright="© 2026 Vusani Earl Mulaudzi. Built with precision." />
    </>
  );
};

export default BlogPage;
