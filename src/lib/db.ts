import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Database file path
const DB_PATH = path.join(process.cwd(), "data", "kites.db");

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Get database instance (singleton)
let db: Database.Database | null = null;

export function getDB(): Database.Database {
  if (!db) {
    ensureDataDir();
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL"); // Better performance
    initSchema();
  }
  return db;
}

// Initialize database schema
function initSchema() {
  const database = db!;
  
  // Settings table for app-wide settings
  database.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
  
  // Kites table
  database.exec(`
    CREATE TABLE IF NOT EXISTS kites (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Content blocks table (for potential future optimization)
  // For now we store blocks as JSON in kites.data
}

// ============ SETTINGS ============

export function getSetting(key: string, defaultValue: string = ""): string {
  const database = getDB();
  const row = database.prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined;
  return row?.value ?? defaultValue;
}

export function setSetting(key: string, value: string): void {
  const database = getDB();
  database.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = ?
  `).run(key, value, value);
}

// ============ KITES ============

export interface KiteRecord {
  id: string;
  data: string; // JSON stringified kite data
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function getAllKites(): KiteRecord[] {
  const database = getDB();
  return database.prepare("SELECT * FROM kites ORDER BY sort_order ASC").all() as KiteRecord[];
}

export function getKite(id: string): KiteRecord | undefined {
  const database = getDB();
  return database.prepare("SELECT * FROM kites WHERE id = ?").get(id) as KiteRecord | undefined;
}

export function saveKite(id: string, data: object, sortOrder: number): void {
  const database = getDB();
  const jsonData = JSON.stringify(data);
  database.prepare(`
    INSERT INTO kites (id, data, sort_order, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET data = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
  `).run(id, jsonData, sortOrder, jsonData, sortOrder);
}

export function deleteKite(id: string): void {
  const database = getDB();
  database.prepare("DELETE FROM kites WHERE id = ?").run(id);
}

export function deleteAllKites(): void {
  const database = getDB();
  database.prepare("DELETE FROM kites").run();
}

// ============ BULK OPERATIONS ============

export interface AppState {
  kites: Array<{ id: string; [key: string]: unknown }>;
  currentKiteIndex: number;
  currentTheme: string;
  title: string;
}

export function loadAppState(): AppState {
  const database = getDB();
  
  // Load settings
  const currentKiteIndex = parseInt(getSetting("currentKiteIndex", "0"), 10);
  const currentTheme = getSetting("currentTheme", "sky");
  const title = getSetting("title", "Untitled Presentation");
  
  // Load kites
  const kiteRecords = getAllKites();
  const kites = kiteRecords.map(record => JSON.parse(record.data));
  
  return {
    kites,
    currentKiteIndex,
    currentTheme,
    title,
  };
}

export function saveAppState(state: AppState): void {
  const database = getDB();
  
  // Use transaction for atomicity
  const saveTransaction = database.transaction(() => {
    // Save settings
    setSetting("currentKiteIndex", state.currentKiteIndex.toString());
    setSetting("currentTheme", state.currentTheme);
    setSetting("title", state.title || "Untitled Presentation");
    
    // Get existing kite IDs
    const existingIds = new Set(
      (database.prepare("SELECT id FROM kites").all() as { id: string }[]).map(r => r.id)
    );
    
    // Save/update kites
    const newIds = new Set<string>();
    state.kites.forEach((kite, index) => {
      saveKite(kite.id as string, kite, index);
      newIds.add(kite.id as string);
    });
    
    // Delete removed kites
    existingIds.forEach(id => {
      if (!newIds.has(id)) {
        deleteKite(id);
      }
    });
  });
  
  saveTransaction();
}
