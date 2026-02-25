require('dotenv').config();
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
});

const User = mongoose.model('User', userSchema);

async function createSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const superAdmin = new User({
      email: 'superadmin@university.edu',
      password: '$2a$10$YIjlrPNo8hF9E2MGd94H6OPST9/PgBkqquzi.Ye5rL.Y6DkSqFqFm',
      role: 'superadmin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await superAdmin.save();
    console.log('\n✅ Super Admin Created Successfully!\n');
    console.log('📧 Email: superadmin@university.edu');
    console.log('🔑 Password: admin123\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createSuperAdmin();
