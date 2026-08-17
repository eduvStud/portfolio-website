import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/navbar.css";
import { useContent } from "../content-store";

const isInternalRoute = (href = "") => href.startsWith("/");

const Navbar = ({
  brand = "V. EARL",
  brandHref = "/",
  links = [],
  activeLabel = "",
  showResume = true,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { content } = useContent();
  const resumeUrl = content.profile.resumeUrl;
  const hasLinks = Array.isArray(links) && links.length > 0;

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav id="main-nav" className="shared-navbar">
      <div className="shared-navbar__inner">
        {isInternalRoute(brandHref) ? (
          <Link className="shared-navbar__brand" to={brandHref} onClick={closeMenu}>
            {brand}
          </Link>
        ) : (
          <a className="shared-navbar__brand" href={brandHref} onClick={closeMenu}>
            {brand}
          </a>
        )}

        {/* Desktop links */}
        {hasLinks && (
          <div className="shared-navbar__links" aria-label="Primary navigation">
            {links.map((link) =>
              isInternalRoute(link.href) ? (
                <Link
                  key={`${link.label}-${link.href}`}
                  to={link.href}
                  className={activeLabel === link.label ? "is-active" : ""}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={`${link.label}-${link.href}`}
                  href={link.href}
                  className={activeLabel === link.label ? "is-active" : ""}
                >
                  {link.label}
                </a>
              )
            )}
          </div>
        )}

        {showResume && resumeUrl && (
          <a className="shared-navbar__resume" href={resumeUrl} target="_blank" rel="noreferrer">
            Resume
          </a>
        )}

        {/* Mobile toggle button */}
        {hasLinks && (
          <button
            type="button"
            className="shared-navbar__mobile"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={toggleMenu}
          >
            <span className="material-symbols-outlined">
              {menuOpen ? "close" : "menu"}
            </span>
          </button>
        )}
      </div>

      {/* Mobile menu overlay */}
      {hasLinks && menuOpen && (
        <div className="shared-navbar__mobile-menu">
          <div className="shared-navbar__mobile-links">
            {links.map((link) =>
              isInternalRoute(link.href) ? (
                <Link
                  key={`${link.label}-${link.href}`}
                  to={link.href}
                  className={activeLabel === link.label ? "is-active" : ""}
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={`${link.label}-${link.href}`}
                  href={link.href}
                  className={activeLabel === link.label ? "is-active" : ""}
                  onClick={closeMenu}
                >
                  {link.label}
                </a>
              )
            )}
            {showResume && resumeUrl && (
              <a className="shared-navbar__mobile-resume" href={resumeUrl} target="_blank" rel="noreferrer" onClick={closeMenu}>
                Resume
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;