const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./app.db', (err) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  
  db.get('SELECT * FROM users', (err, user) => {
    if (err) {
      console.error('Query error:', err);
    } else if (user) {
      console.log('User found:');
      console.log('ID:', user.id);
      console.log('Email:', user.email);
      console.log('Name:', user.name);
      console.log('isAdmin:', user.isAdmin);
      console.log('approved:', user.approved);
      console.log('Password hash:', user.password);
      
      // Test password
      const testPassword = 'admin123';
      const match = bcrypt.compareSync(testPassword, user.password);
      console.log('\nPassword test with "admin123":', match);
    } else {
      console.log('No user found');
    }
    
    db.close();
  });
});
