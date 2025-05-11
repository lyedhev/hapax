// | Project Name: Hapax
// | Author: Eric Stefan Apetrei
// | Class: HND Computing: Software Engineering with Emerging Technologies
// | Description: Lexicon-storing app with the capacity to simulate language change over time from user-determined rulesets

// Import common modules
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Import child process API from Node.js
const { spawn } = require('child_process');

// Import database functions as module
const { connectToDb, initialiseDb } = require('./db');



// | DATABASE FUNCTIONALITY | ============================================================

// Store database connection and initialise it
const db = connectToDb();
initialiseDb(db);



// | IPC HANDLERS | ======================================================================

// | I've coded all IPC handlers to use Promises, to make sure errors don't absolutely
// |    brick the app. This way if errors are encountered, it doesn't crash
// |
// | Promises are objects that store a callback (the actual function that is being
// |    run), then depending on the result it either returns a "reject" (usually an
// |    error) or a "resolve" (the actual desired output)


// | PYTHON IPC HANDLER | ================================================================

ipcMain.handle('process-lists', async (event, rulesList, inputList) => {
  return new Promise((resolve, reject) => {
    
    // Load the python application & blank variables
    const py = spawn('python', ['python/sound_change.py']);

    let result = '';
    let error = '';


    // Return output through "out" channel and store in 'result'
    py.stdout.on('data', data => {
      result += data.toString();
    });

    // Return any errors through "err" channel and store in 'error'
    py.stderr.on('data', data => {
      error += data.toString();
    });


    // When closing the sub-process, get the error code
    py.on('close', code => {
      if (code !== 0)
      { // If the code is anything but 0, print the error and reject the promise
        console.error('Python error:', error);
        reject(new Error(`Python script exited with code ${code}`));
      }
      else
      { // Else if it is 0, try parse the output and resolve the promise
        try {
          const parsed = JSON.parse(result);
          resolve(parsed);
        } catch (e) {
          console.error('Failed to parse Python output:', result);
          reject(e);
        }
      }
    });

    
    /*[LOG]*/ console.log(rulesList, inputList);

    // Send input through "in" channel from the input lists, then close stream
    py.stdin.write(JSON.stringify({ rulesList, inputList }));
    py.stdin.end();
  });
});



// | MAIN PROCESSES IPC HANDLER |=========================================================

ipcMain.handle('get-dropdown-items', async () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT id, name FROM Language', (err, rows) => {
      if (err) {
        console.error('Error querying the DB:', err.message);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
});

ipcMain.handle('add-language', async (event, name) => {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO Language (name) VALUES (?)', [name], function (err) {
      if (err) {
        console.error('Error inserting language:', err.message);
        reject(err);
      } else {
        resolve({ id: this.lastID, name });
      }
    });
  });
});

ipcMain.handle('update-language', async (event, id, newName) => {
  return new Promise((resolve, reject) => {
    db.run('UPDATE Language SET name = ? WHERE id = ?', [newName, id], function (err) {
      if (err) {
        console.error('Error updating language:', err.message);
        reject(err);
      } else {
        resolve({ success: true, changes: this.changes });
      }
    });
  });
});

ipcMain.handle('delete-language', async (event, languageId) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Ensure all queries must be successful
      db.run(`BEGIN TRANSACTION`);

      db.run( // Delete words that reference the language
        `DELETE FROM Word WHERE class_id IN (SELECT id FROM Class WHERE language_id = ?)`,
        [languageId],
        function(err) {
          if (err) return reject(err);
        }
      );

      db.run( // Delete classes that reference the language
        `DELETE FROM Class WHERE language_id = ?`,
        [languageId],
        function(err) {
          if (err) return reject(err);
        }
      );

      db.run( // Delete language itself
        `DELETE FROM Language WHERE id = ?`,
        [languageId],
        function(err) {
          if (err) {
            db.run(`ROLLBACK`);
            console.error('Error deleting language:', err.message);
            reject(err);
          } else {
            db.run(`COMMIT`);
            resolve({ success: true });
          }
        }
      );
    });
  });
});


ipcMain.handle('get-classes', async (event, languageId) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT Class.id, Class.name, Class.abbreviation, COUNT(Word.id) AS wordCount
       FROM Class
       LEFT JOIN Word ON Word.class_id = Class.id
       WHERE Class.language_id = ?
       GROUP BY Class.id`,
      [languageId],
      (err, rows) => {
        if (err) {
          console.error('Error querying classes:', err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
});

ipcMain.handle('add-class', async (event, { languageId, name, abbreviation }) => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO Class (language_id, name, abbreviation) VALUES (?, ?, ?)',
      [languageId, name, abbreviation],
      function (err) {
        if (err) {
          console.error('Error inserting class:', err.message);
          reject(err);
        } else {
          resolve({ id: this.lastID, languageId, name, abbreviation });
        }
      }
    );
  });
});

ipcMain.handle('update-class', async (event, cls) => {
  return new Promise((resolve, reject) => {
    db.run('UPDATE Class SET name = ?, abbreviation = ? WHERE id = ?', [cls.name, cls.abbr, cls.id], function (err) {
      if (err) {
        console.error('Error updating class:', err.message);
        reject(err);
      } else {
        resolve({ success: true, changes: this.changes });
      }
    });
  });
});

ipcMain.handle('delete-class', async (event, classId) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Ensure all queries must be successful
      db.run(`BEGIN TRANSACTION`);

      db.run( // Delete words that reference the class
        `DELETE FROM Word WHERE class_id = ?`, [classId], function(err) {
        if (err) {
          console.error('Error deleting words:', err.message);
          db.run(`ROLLBACK`);
          return reject(err);
        }

        db.run( // Delete class
          `DELETE FROM Class WHERE id = ?`, [classId], function(err) {
          if (err) {
            console.error('Error deleting class:', err.message);
            db.run(`ROLLBACK`);
            return reject(err);
          }

          db.run(`COMMIT`);
          resolve();
        });
      });
    });
  });
});

ipcMain.handle('get-words', async (event, languageId) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT w.id, w.name, w.transcription, w.etymology, w.definition, c.name AS className, c.id AS classId
       FROM Word w
       JOIN Class c ON w.class_id = c.id
       WHERE c.language_id = ?
       ORDER BY w.name`,
      [languageId],
      (err, rows) => {
        if (err) {
          console.error('Error retrieving words:', err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
});

ipcMain.handle('add-word', async (event, { name, transcription, etymology, definition, classId }) => {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO Word (name, transcription, etymology, definition, class_id)
       VALUES (?, ?, ?, ?, ?)`,
      [name, transcription, etymology, definition, classId],
      function (err) {
        if (err) {
          console.error('Error adding word:', err.message);
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      }
    );
  });
});

ipcMain.handle('update-word', async (event, word) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE Word
       SET name = ?, transcription = ?, etymology = ?, definition = ?, class_id = ?
       WHERE id = ?`,
      [word.name, word.transcription, word.etymology, word.definition, word.classId, word.id],
      function (err) {
        if (err) {
          console.error('Error updating word:', err.message);
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
});

ipcMain.handle('delete-word', async (event, wordId) => {
  return new Promise((resolve, reject) => {
      db.run(`DELETE FROM Word WHERE id = ?`, [wordId], function (err) {
          if (err) {
              console.error('Error deleting word:', err.message);
              reject(err);
          } else {
              resolve({ success: true });
          }
      });
  });
});



// | MAIN FUNCTIONALITY |=================================================================

function createWindow() {
  console.log('Creating window...');
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.maximize();
  win.loadFile('index.html');
}

// Open app window when all compilation prep is complete
app.whenReady().then(() => {
  createWindow();
});

// Special app quitting for macOS
// [apparently macOS likes to keep the app running in the background when closing its window]
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});