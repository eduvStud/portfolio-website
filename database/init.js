import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "portfolio.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) throw err;
  console.log("Connected to database for initialization");
});

const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function(err) {
    if (err) reject(err);
    else resolve({ lastID: this.lastID, changes: this.changes });
  });
});

const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) reject(err);
    else resolve(rows || []);
  });
});

(async () => {
  try {
    // Initialize default content
    const defaultContent = {
      profile: {
        name: "Vusani Mulaudzi",
        email: "matakanyevusi@outlook.com",
        location: "South Africa",
        bio: "Full-stack developer passionate about creating beautiful and functional web experiences.",
        resumeUrl: ""
      },
      home: {
        heroTitle: "Welcome to My Portfolio",
        heroSubtitle: "Full-Stack Developer | Creative Technologist",
        heroImage: ""
      },
      social: {
        linkedin: "https://www.linkedin.com/in/vusani-mulaudzi-b5a104317/",
        instagram: "https://www.instagram.com/sir.earl__/",
        github: "",
        twitter: "",
        email: "matakanyevusi@outlook.com"
      },
      projects: [],
      partners: [],
      posts: []
    };

    // Check if content already exists
    const existing = await dbAll("SELECT id FROM site_content WHERE id = 1");
    
    if (existing.length) {
      console.log("Content already initialized. Updating social links...");
      // Update only social links if content exists
      const currentRows = await dbAll("SELECT content FROM site_content WHERE id = 1");
      const current = JSON.parse(currentRows[0].content);
      current.social = defaultContent.social;
      current.profile.email = defaultContent.profile.email;
      await dbRun("UPDATE site_content SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1", [JSON.stringify(current)]);
    } else {
      console.log("Initializing database with your profile...");
      await dbRun("INSERT INTO site_content (id, content) VALUES (1, ?)", [JSON.stringify(defaultContent)]);
    }

    console.log("✓ Database initialized with your profile");
    console.log("✓ Social links added:");
    console.log("  - LinkedIn: https://www.linkedin.com/in/vusani-mulaudzi-b5a104317/");
    console.log("  - Instagram: https://www.instagram.com/sir.earl__/");
    console.log("  - Email: matakanyevusi@outlook.com");
    
    db.close();
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
})();
