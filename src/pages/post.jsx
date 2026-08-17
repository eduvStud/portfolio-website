import { Link, useParams } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { useContent } from "../content-store";
import "../styles/post.css";

const PostPage = () => {
  const { slug } = useParams();
  const { content } = useContent();
  const post = content.posts.find((entry) => entry.slug === slug);

  if (!post) {
    return <main className="post-main post-empty"><h1>Post not found.</h1><Link to="/blog">Return to journal</Link></main>;
  }

  return (
    <>
      <Navbar brand={content.profile.shortName} brandHref="/" activeLabel="Blog" links={[{ label: "About me", href: "/about" }, { label: "Projects", href: "/projects" }, { label: "Blog", href: "/blog" }, { label: "Partners", href: "/partners" }, { label: "Contact", href: "/contact" }]} />
      <main className="post-main">
        <article className="post-article">
          <Link className="post-back" to="/blog">Back to journal</Link>
          <p>{post.category} / {post.date} / {post.readTime}</p>
          <h1>{post.title}</h1>
          <p className="post-excerpt">{post.excerpt}</p>
          {post.credits && post.credits.length > 0 && <div className="post-credits-inline"><strong>Credits:</strong> {post.credits.map((c, i) => <span key={i} className="post-credit-name">{c?.name || ""}{i < post.credits.length - 1 ? ", " : ""}</span>)}</div>}
          {post.body.split("\n").map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          {post.credits && post.credits.length > 0 && <div className="post-credits-end"><h3>Credits</h3><ul>{post.credits.map((c, i) => <li key={i}>{c?.url ? <a href={c.url} target="_blank" rel="noreferrer">{c.name}</a> : <span>{c.name}</span>}</li>)}</ul></div>}
        </article>
      </main>
      <Footer />
    </>
  );
};

export default PostPage;