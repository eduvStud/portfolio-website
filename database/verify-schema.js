import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "portfolio.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) throw err;
});

const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) reject(err);
    else resolve(rows || []);
  });
});

(async () => {
  try {
    console.log("=== DATABASE SCHEMA VERIFICATION ===\n");

    // Check tables
    const tables = await dbAll(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );
    console.log("✓ TABLES:");
    tables.forEach(t => console.log(`  - ${t.name}`));

    // Check indexes
    const indexes = await dbAll(
      "SELECT name FROM sqlite_master WHERE type='index' ORDER BY name"
    );
    console.log("\n✓ INDEXES:");
    indexes.forEach(i => console.log(`  - ${i.name}`));

    // Check admin users
    const admins = await dbAll("SELECT email, created_at FROM admin_users");
    console.log("\n✓ ADMIN ACCOUNTS:");
    admins.forEach(a => console.log(`  - Email: ${a.email} (Created: ${a.created_at})`));

    // Check content
    const content = await dbAll("SELECT id, updated_at FROM site_content");
    console.log("\n✓ SITE CONTENT:");
    content.forEach(c => console.log(`  - ID: ${c.id} (Updated: ${c.updated_at})`));

    // Check inquiries
    const inquiries = await dbAll("SELECT COUNT(*) as count FROM inquiries");
    console.log(`\n✓ INQUIRIES: ${inquiries[0].count} record(s)`);

    // Check media assets
    const media = await dbAll("SELECT COUNT(*) as count FROM media_assets");
    console.log(`\n✓ MEDIA ASSETS: ${media[0].count} record(s)`);

    console.log("\n=== SCHEMA COMPLETE ===");
    console.log("All necessary tables and indexes are in place.");
    
    db.close();
  } catch (error) {
    console.error("Error verifying schema:", error);
    process.exit(1);
  }
})();
