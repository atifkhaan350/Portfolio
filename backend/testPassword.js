const bcrypt = require('bcryptjs');

const hashedPassword = '$2a$10$YIjlrPNo8hF9E2MGd94H6OPST9/PgBkqquzi.Ye5rL.Y6DkSqFqFm';

bcrypt.compare('admin123', hashedPassword).then(result => {
  if (result) {
    console.log('✓ Password matches!');
  } else {
    console.log('✗ Password does not match');
  }
}).catch(err => {
  console.log('Error:', err.message);
});
