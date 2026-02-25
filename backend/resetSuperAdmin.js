require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function resetSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing super admin
    await mongoose.connection.db.collection('users').deleteOne({ role: 'superadmin' });
    console.log('Deleted old super admin');

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create new super admin
    const result = await mongoose.connection.db.collection('users').insertOne({
      email: 'superadmin@university.edu',
      password: hashedPassword,
      role: 'superadmin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('\n✅ Super Admin Created Successfully!\n');
    console.log('📧 Email:    superadmin@university.edu');
    console.log('🔑 Password: admin123\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetSuperAdmin();
