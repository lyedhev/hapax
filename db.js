// Import required modules
const { app } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { Database } = require('sqlite3');

// Default database path to store the local database
const defaultDbPath = path.join(app.getPath('userData'), 'sqlite.db');

/**
 * Attempts to connect to the database if existing, and creates it if not.
 * @param {string} dbPath Path to database location
 * @returns Database
 */
function connectToDb(dbPath = defaultDbPath)
{   
    // Either creates the database file or connects to it if already existing
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) return console.error(err.message);
        console.log('Connected to the SQLite database at:', dbPath);
    });

    // Makes sure foreign key checks are enabled (since SQLite doesn't by default apparently)
    db.run("PRAGMA foreign_keys = ON;",
        (err) => {
        if (err) console.error("Failed to enable foreign key support:", err.message);
        else console.log("Foreign key support enabled.");
    });

    return db;
}

/**
 * Creates the necessary tables if they do not exist already.
 * @param {Database} db Database
 */
function initialiseDb(db)
{
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS Language (
                id INTEGER PRIMARY KEY,
                name VARCHAR(64)
            );`,
            (err) => {
            if (err) console.error("Error creating table:", err.message);
            else console.log("Language table engaged.");
            });

        db.run(`CREATE TABLE IF NOT EXISTS Class (
            id INTEGER PRIMARY KEY,
            language_id INTEGER,
            name VARCHAR(32),
            abbreviation VARCHAR(8),

            CONSTRAINT fk_language
                FOREIGN KEY (language_id)
                REFERENCES Language(id)
            );`,
            (err) => {
            if (err) console.error("Error creating table:", err.message);
            else console.log("Class table engaged.");
            });
        
        db.run(`CREATE TABLE IF NOT EXISTS Word (
            id INTEGER PRIMARY KEY,
            class_id INTEGER,
            name VARCHAR(64),
            transcription VARCHAR(64),
            etymology VARCHAR(64),
            definition TEXT,

            CONSTRAINT fk_class
                FOREIGN KEY (class_id)
                REFERENCES Class(id)
            );`,
            (err) => {
            if (err) console.error("Error creating table:", err.message);
            else console.log("Word table engaged.");
            });
    })
}

// Export as module
module.exports = {
    connectToDb,
    initialiseDb
  };