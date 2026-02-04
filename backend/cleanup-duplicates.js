const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'app.db');
console.log('Database path:', dbPath);

// Open database and wait for it to be ready
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    return;
  }
  
  console.log('Database opened successfully');
  console.log('Removing duplicate categories...');

  // Keep only the first occurrence of each category name
  db.run(`
    DELETE FROM categories 
    WHERE id NOT IN (
      SELECT MIN(id) 
      FROM categories 
      GROUP BY name
    )
  `, (err) => {
    if (err) {
      console.error('Error removing duplicates:', err);
      db.close();
    } else {
      console.log('Duplicates removed successfully!');
      
      // Show remaining categories
      db.all('SELECT * FROM categories ORDER BY id', (err, rows) => {
        if (!err) {
          console.log('\nRemaining categories:');
          rows.forEach(row => {
            console.log(`- ID: ${row.id}, Name: ${row.name}`);
          });
        }
        db.close();
        console.log('\nDone! Refresh your browser.');
      });
    }
  });
});
