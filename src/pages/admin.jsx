import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Footer from "../components/footer";
import Navbar from "../components/navbar";
import { API_URL, resolveContentAssetUrl, useContent } from "../content-store";
import "../styles/admin.css";

const sections = [
  ["overview", "dashboard", "Overview"],
  ["posts", "article", "Blog"],
  ["projects", "work", "Projects"],
  ["partners", "handshake", "Partners"],
  ["inquiries", "mail", "Inquiries"],
  ["settings", "settings", "Settings"],
];
const emptyPost = {
  slug: "",
  title: "",
  category: "",
  date: "",
  readTime: "",
  excerpt: "",
  body: "",
  status: "published",
  credits: [],
};
const emptyProject = {
  slug: "",
  title: "",
  year: "",
  category: "",
  image: "",
  summary: "",
  tags: "",
  caseStudyUrl: "",
  githubUrl: "",
  releasePeriod: "TBD",
  releaseYear: String(new Date().getFullYear()),
  body: "",
  credits: [],
};
const RELEASE_PERIOD_OPTIONS = [
  ["Q1", "Q1"],
  ["Q2", "Q2"],
  ["Q3", "Q3"],
  ["Q4", "Q4"],
  ["TBD", "TBD"],
  ["not-for-release", "Not for release"],
];
const isQuarterRelease = (period) => ["Q1", "Q2", "Q3", "Q4"].includes(period);
const releaseYearOptions = (() => {
  const current = new Date().getFullYear();
  return Array.from({ length: 8 }, (_, index) => String(current - 1 + index));
})();
const emptyPartner = { name: "", description: "", image: "", websiteUrl: "", caseStudyUrl: "" };
const IMAGE_FIELD_KEYS = new Set([
  "image",
  "heroMediaUrl",
  "heroMediaPoster",
  "shopflowImage",
  "auraImage",
  "constructImage",
  "blogOneImage",
  "blogTwoImage",
  "blogThreeImage",
]);

const uploadMedia = async (token, file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_URL}/media/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Could not upload image.");
  return payload.url;
};

const ImageUploadField = ({ label, value, onChange, token }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const preview = resolveContentAssetUrl(value);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadMedia(token, file);
      onChange(url);
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-upload-field">
      <span className="image-upload-label">{label}</span>
      {preview ? (
        <div className="image-upload-preview">
          <img src={preview} alt="" />
        </div>
      ) : (
        <div className="image-upload-empty">
          <span className="material-symbols-outlined">image</span>
          <span>No image uploaded</span>
        </div>
      )}
      <div className="image-upload-actions">
        <label className="image-upload-button">
          <input type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml" onChange={handleFile} disabled={uploading} />
          {uploading ? "Uploading…" : preview ? "Replace image" : "Upload image"}
        </label>
        {preview && (
          <button type="button" onClick={() => onChange("")} disabled={uploading}>
            Remove
          </button>
        )}
      </div>
      {error && <p className="image-upload-error">{error}</p>}
    </div>
  );
};

const AdminPage = () => {
  const { content, setContent } = useContent();
  const [token, setToken] = useState(() => sessionStorage.getItem("portfolio-admin-token"));
  const isReadonly = token === "readonly";
  const [section, setSection] = useState("overview");
  const [inquiries, setInquiries] = useState([]);
  const [message, setMessage] = useState("");
  const [editor, setEditor] = useState(null);
  const loadInquiries = async () => {
    const response = await fetch(`${API_URL}/inquiries`, { headers: { Authorization: `Bearer ${token}` } });
    if (response.ok) setInquiries((await response.json()).inquiries);
  };
  useEffect(() => {
    if (token) loadInquiries();
  }, [token]);
  const persist = async (nextContent) => { if (isReadonly) { setMessage("Read-only mode — changes cannot be saved."); return; }
    const response = await fetch(`${API_URL}/content`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content: nextContent }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Could not save changes.");
    setContent(payload.content);
    setMessage("Changes saved.");
  };
  const updateCollection = async (collection, item, index) => {
    const items = [...content[collection]];
    if (index === -1) items.push(item);
    else items[index] = item;
    await persist({ ...content, [collection]: items });
    setEditor(null);
  };
  const removeItem = async (collection, index) => {
    if (!window.confirm("Delete this item? This cannot be undone after saving.")) return;
    await persist({ ...content, [collection]: content[collection].filter((_, itemIndex) => itemIndex !== index) });
  };
  const updateInquiryStatus = async (id, status) => {
    const response = await fetch(`${API_URL}/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) return setMessage("Could not update inquiry status.");
    await loadInquiries();
  };
  if (!token) return <Navigate to="/login" replace />;
  const publishedPosts = content.posts.filter((post) => post.status !== "draft").length;
  const openInquiries = inquiries.filter((inquiry) => inquiry.status === "new").length;
  return (
    <>
      <Navbar brand={content.profile.shortName} brandHref="/" showResume={false} links={[{ label: "View site", href: "/" }]} />
      <main className="control-main">
          {isReadonly && (
            <div className="readonly-banner">
              <span className="material-symbols-outlined">visibility</span>
              Read-only mode — you can explore but cannot make changes.
            </div>
          )}
        <aside className="control-sidebar">
          <div>
            <p className="control-kicker">Control center</p>
            <h1>
              Content
              <br />
              Archive
            </h1>
          </div>
          <nav>
            {sections.map(([id, icon, label]) => (
              <button key={id} type="button" className={section === id ? "is-active" : ""} onClick={() => setSection(id)}>
                <span className="material-symbols-outlined">{icon}</span>
                {label}
              </button>
            ))}
          </nav>
          <div className="control-status">
            <span />
            Database connected
          </div>
          <button
            type="button"
            className="control-signout"
            onClick={() => {
              sessionStorage.removeItem("portfolio-admin-token");
              sessionStorage.removeItem("portfolio-readonly");
              setToken("");
            }}
          >
            Sign out
          </button>
        </aside>
        <section className="control-content">
          <header className="control-header">
            <div>
              <p className="control-kicker">{section}_manager</p>
              <h2>{section === "overview" ? "Control center" : section}</h2>
            </div>
            <div>
              <Link to="/">Open public site</Link>
              <output>{message}</output>
            </div>
          </header>
          {section === "overview" && (
            <Overview projects={content.projects.length} posts={publishedPosts} inquiries={openInquiries} partners={content.partners.length} onNavigate={setSection} />
          )}
          {section === "posts" && (
            <Posts
              items={content.posts}
              onEdit={(item, index) => setEditor({ type: "posts", item, index })}
              onAdd={() => setEditor({ type: "posts", item: emptyPost, index: -1 })}
              onDelete={(index) => removeItem("posts", index)}
            />
          )}
          {section === "projects" && (
            <Projects
              items={content.projects}
              onEdit={(item, index) => setEditor({ type: "projects", item, index })}
              onAdd={() => setEditor({ type: "projects", item: emptyProject, index: -1 })}
              onDelete={(index) => removeItem("projects", index)}
            />
          )}
          {section === "partners" && (
            <Partners
              items={content.partners}
              onEdit={(item, index) => setEditor({ type: "partners", item, index })}
              onAdd={() => setEditor({ type: "partners", item: emptyPartner, index: -1 })}
              onDelete={(index) => removeItem("partners", index)}
            />
          )}
          {section === "inquiries" && <Inquiries items={inquiries} onStatus={updateInquiryStatus} />}
          {section === "settings" && <Settings content={content} onSave={persist} token={token} />}
        </section>
      </main>
      {editor && <ContentEditor editor={editor} token={token} isReadonly={isReadonly} onClose={() => setEditor(null)} onSave={updateCollection} />}
      <Footer brand={content.profile.name} />
    </>
  );
};

const Overview = ({ projects, posts, inquiries, partners, onNavigate }) => (
  <div className="control-overview">
    <div className="metric-grid">
      {[
        ["work", "Active projects", projects],
        ["article", "Published posts", posts],
        ["mail", "New inquiries", inquiries],
        ["handshake", "Partners", partners],
      ].map(([icon, label, value]) => (
        <button
          key={label}
          type="button"
          className="metric-card"
          onClick={() =>
            onNavigate(label.includes("project") ? "projects" : label.includes("post") ? "posts" : label.includes("inquir") ? "inquiries" : "partners")
          }
        >
          <span className="material-symbols-outlined">{icon}</span>
          <p>{label}</p>
          <strong>{value}</strong>
        </button>
      ))}
    </div>
    <section className="overview-callout">
      <p>Portfolio operations</p>
      <h3>Everything in the public site is managed from these collections.</h3>
      <span>Choose a section in the archive to create, edit, publish, or remove records.</span>
    </section>
  </div>
);

const CollectionHeader = ({ title, count, action }) => (
  <div className="collection-header">
    <div>
      <h3>{title}</h3>
      <p>{count} records</p>
    </div>
    {action && (
      <button type="button" onClick={action}>
        <span className="material-symbols-outlined">add</span>
        New record
      </button>
    )}
  </div>
);

const Posts = ({ items, onEdit, onAdd, onDelete }) => (
  <section>
    <CollectionHeader title="Blog archive" count={items.length} action={onAdd} />
    <div className="record-table">
      <div className="record-head">
        <span>Title</span>
        <span>Category</span>
        <span>Status</span>
        <span>Actions</span>
      </div>
      {items.map((item, index) => (
        <article key={`${item.slug}-${index}`}>
          <div>
            <strong>{item.title}</strong>
            <small>{item.date}</small>
          </div>
          <span>{item.category}</span>
          <span className={`status-tag ${item.status === "draft" ? "draft" : ""}`}>{item.status || "published"}</span>
          <div className="record-actions">
            <button type="button" aria-label={`Edit ${item.title}`} onClick={() => onEdit(item, index)}>
              <span className="material-symbols-outlined">edit</span>
            </button>
            <button type="button" aria-label={`Delete ${item.title}`} onClick={() => onDelete(index)}>
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>
        </article>
      ))}
    </div>
  </section>
);

const Projects = ({ items, onEdit, onAdd, onDelete }) => (
  <section>
    <CollectionHeader title="Projects index" count={items.length} action={onAdd} />
    <div className="project-manager-grid">
      {items.map((item, index) => (
        <article key={`${item.slug}-${index}`}>
          <div className="manager-image">
            {item.image ? <img src={resolveContentAssetUrl(item.image)} alt="" /> : <span className="material-symbols-outlined">image</span>}
          </div>
          <div>
            <p>
              {item.category} / {item.year}
            </p>
            <h3>{item.title}</h3>
            <span>{item.summary}</span>
          </div>
          <div className="card-actions">
            <button type="button" onClick={() => onEdit(item, index)}>
              <span className="material-symbols-outlined">edit</span>
              Edit
            </button>
            <button type="button" aria-label={`Delete ${item.title}`} onClick={() => onDelete(index)}>
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>
        </article>
      ))}
    </div>
  </section>
);

const Partners = ({ items, onEdit, onAdd, onDelete }) => (
  <section>
    <CollectionHeader title="Partners registry" count={items.length} action={onAdd} />
    <div className="record-table">
      <div className="record-head">
        <span>Entity</span>
        <span>Description</span>
        <span>Website</span>
        <span>Actions</span>
      </div>
      {items.map((item, index) => (
        <article key={`${item.name}-${index}`}>
          <strong>{item.name}</strong>
          <span>{item.description}</span>
          <a href={item.websiteUrl || undefined} target="_blank" rel="noreferrer">
            {item.websiteUrl || "Not configured"}
          </a>
          <div className="record-actions">
            <button type="button" aria-label={`Edit ${item.name}`} onClick={() => onEdit(item, index)}>
              <span className="material-symbols-outlined">edit</span>
            </button>
            <button type="button" aria-label={`Delete ${item.name}`} onClick={() => onDelete(index)}>
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>
        </article>
      ))}
    </div>
  </section>
);

const Inquiries = ({ items, onStatus }) => (
  <section>
    <CollectionHeader title="Inquiry inbox" count={items.length} />
    <div className="inquiry-list">
      {items.length ? (
        items.map((item) => (
          <article key={item.id}>
            <div>
              <strong>{item.name}</strong>
              <a href={`mailto:${item.email}`}>{item.email}</a>
            </div>
            <span>{item.projectType}</span>
            <p>{item.message}</p>
            <select value={item.status} onChange={(event) => onStatus(item.id, event.target.value)} disabled={isReadonly} aria-label={`Status for ${item.name}`}>
              <option value="new">New</option>
              <option value="reviewed">Reviewed</option>
              <option value="responded">Responded</option>
              <option value="archived">Archived</option>
            </select>
          </article>
        ))
      ) : (
        <p className="empty-state">No messages have been received.</p>
      )}
    </div>
  </section>
);

const Settings = ({ content, onSave, token }) => {
  const [draft, setDraft] = useState(content);
  const change = (group, key, value) => setDraft({ ...draft, [group]: { ...draft[group], [key]: value } });
  const fields = [
    ["profile", "name", "Full name"],
    ["profile", "shortName", "Short name"],
    ["profile", "email", "Contact email"],
    ["profile", "location", "Location"],
    ["profile", "resumeUrl", "Resume URL"],
    ["home", "heroMediaUrl", "Hero media"],
    ["home", "heroMediaPoster", "Hero media poster"],
    ["social", "github", "GitHub URL"],
    ["social", "linkedin", "LinkedIn URL"],
    ["social", "readcv", "ReadCV URL"],
    ["social", "rss", "RSS URL"],
  ];

  return (
    <section className="settings-form">
      <h3>Site settings</h3>
      <p>Identity, contact, resume, homepage media, and social links are used across the public site.</p>
      <div className="settings-grid">
        {fields.map(([group, key, label]) =>
          IMAGE_FIELD_KEYS.has(key) ? (
            <ImageUploadField key={key} label={label} value={draft[group][key] || ""} onChange={(url) => change(group, key, url)} token={token} />
          ) : (
            <label key={key}>
              {label}
              <input value={draft[group][key] || ""} onChange={(event) => change(group, key, event.target.value)} />
            </label>
          )
        )}
      </div>
      <button type="button" onClick={() => onSave(draft)}>
        Save settings
      </button>
    </section>
  );
};

const ContentEditor = ({ editor, token, isReadonly, onClose, onSave }) => {
  const [draft, setDraft] = useState(editor.item);
  const fields =
    editor.type === "posts"
      ? [
          ["title", "Title"],
          ["slug", "Slug"],
          ["category", "Category"],
          ["date", "Date"],
          ["readTime", "Read time"],
          ["image", "Image URL"],
          ["excerpt", "Excerpt", true],
          ["body", "Post body", true],
          ["status", "Status"],
        ]
      : editor.type === "projects"
        ? [
            ["title", "Title"],
            ["slug", "Slug"],
            ["year", "Year"],
            ["category", "Category"],
            ["image", "Thumbnail"],
            ["tags", "Tags"],
            ["caseStudyUrl", "Case study URL"],
            ["githubUrl", "GitHub URL"],
            ["summary", "Summary", true],
            ["body", "Description", true],
          ]
        : [
            ["name", "Name"],
            ["image", "Image"],
            ["websiteUrl", "Website URL"],
            ["caseStudyUrl", "Case study URL"],
            ["description", "Description", true],
          ];
  const updateCredit = (index, key, value) => {
    const credits = Array.isArray(draft.credits) ? [...draft.credits] : [];
    credits[index] = { ...(credits[index] || {}), [key]: value };
    setDraft({ ...draft, credits });
  };
  const addCredit = () => setDraft({ ...draft, credits: [...(draft.credits || []), { name: "", url: "" }] });
  const removeCredit = (index) => setDraft({ ...draft, credits: (draft.credits || []).filter((_, i) => i !== index) });

  return (
    <div className="editor-backdrop" role="presentation">
      <form
        className="content-editor"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(editor.type, draft, editor.index);
        }}
      >
        <header>
          <h2>
            {editor.index === -1 ? "New" : "Edit"} {editor.type.slice(0, -1)}
          </h2>
          <button type="button" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>
        {fields.map(([key, label, multiline]) =>
          IMAGE_FIELD_KEYS.has(key) ? (
            <ImageUploadField key={key} label={label} value={draft[key] || ""} onChange={(url) => setDraft({ ...draft, [key]: url })} token={token} />
          ) : (
            <label key={key}>
              {label}
              {multiline ? (
                <textarea value={draft[key] || ""} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} />
              ) : key === "status" ? (
                <select value={draft[key] || "published"} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              ) : (
                <input
                  value={draft[key] || ""}
                  onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
                  required={key === "title" || key === "name" || key === "slug"}
                />
              )}
            </label>
          )
        )}

        {editor.type === "projects" && (
          <section className="release-editor">
            <h3>Release period</h3>
            <p>
              Shown on the project page when no GitHub URL is set. Quarter options include a year (for example Q2 2026).
            </p>
            <label>
              Period
              <select
                value={draft.releasePeriod || "TBD"}
                onChange={(event) => setDraft({ ...draft, releasePeriod: event.target.value })}
              >
                {RELEASE_PERIOD_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            {isQuarterRelease(draft.releasePeriod || "TBD") && (
              <label>
                Release year
                <select
                  value={draft.releaseYear || String(new Date().getFullYear())}
                  onChange={(event) => setDraft({ ...draft, releaseYear: event.target.value })}
                >
                  {releaseYearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </section>
        )}

        {(editor.type === "posts" || editor.type === "projects") && (
          <section className="credits-editor">
            <h3>{editor.type === "projects" ? "Project credits" : "Post credits"}</h3>
            <p>
              {editor.type === "projects"
                ? "List people to credit for this project. Add a name and (optional) profile URL; links appear on the project page."
                : "List people to credit for this post. Add a name and (optional) profile URL; links appear at the end of the post."}
            </p>
            {(draft.credits || []).map((c, index) => (
              <div className="credit-row" key={index}>
                <input placeholder="Full name" value={c.name || ""} onChange={(e) => updateCredit(index, "name", e.target.value)} required />
                <input placeholder="Profile URL (LinkedIn, Twitter)" value={c.url || ""} onChange={(e) => updateCredit(index, "url", e.target.value)} />
                <button type="button" onClick={() => removeCredit(index)} aria-label="Remove credit">
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={addCredit}>
              Add credit
            </button>
          </section>
        )}

        <footer>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" disabled={isReadonly}>{isReadonly ? "Read-only" : "Save record"}</button>
        </footer>
      </form>
    </div>
  );
};

export default AdminPage;
