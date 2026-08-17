import { Link } from "react-router-dom";
import "../styles/footer.css";
import { useContent } from "../content-store";

const Footer = ({
  brand = "VUSANI EARL",
  copyright = "© 2026 Vusani Earl Mulaudzi. Built with precision.",
}) => {
  const { content } = useContent();
  const socialLinks = [
    ["GitHub", content.social.github],
    ["LinkedIn", content.social.linkedin],
    ["Instagram", content.social.instagram],
    ["ReadCV", content.social.readcv],
    ["RSS", content.social.rss],
  ].filter(([, url]) => url);

  return (
    <footer className="shared-footer">
      <div className="shared-footer__inner">
        <div className="shared-footer__grid">
          <div>
            <h2>{brand}</h2>
          </div>

          <div>
            <h5>Navigation</h5>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About me</Link></li>
              <li><Link to="/projects">Projects</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h5>Social</h5>
            <ul>{socialLinks.length ? socialLinks.map(([label, url]) => <li key={label}><a href={url} target="_blank" rel="noreferrer">{label}</a></li>) : <li>Profiles coming soon.</li>}</ul>
          </div>
        </div>

        <div className="shared-footer__bottom">
          <p>{copyright}</p>
          <div className="shared-footer__status">
            <span className="status-dot" />
            <span>Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;