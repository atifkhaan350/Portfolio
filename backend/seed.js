const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Student = require('./models/Student');

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...');
};

const seed = async () => {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});
    console.log('Cleared existing data...');

    // Create superadmin
    const superAdmin = await User.create({
        name: 'Super Admin',
        email: 'superadmin@university.com',
        password: 'admin123',
        role: 'superadmin',
        userId: 'SA-0001',
        phone: '0300-1234567'
    });
    console.log('Created Super Admin: superadmin@university.com / admin123');

    // Create admin
    const admin = await User.create({
        name: 'Dr. Sarah Ahmed',
        email: 'admin@university.com',
        password: 'admin123',
        role: 'admin',
        userId: 'ADM-0001',
        phone: '0300-9876543',
        createdBy: superAdmin._id
    });
    console.log('Created Admin: admin@university.com / admin123');

    // Create teacher
    const teacher = await User.create({
        name: 'Prof. Ali Hassan',
        email: 'teacher@university.com',
        password: 'teacher123',
        role: 'teacher',
        userId: 'TCH-0001',
        phone: '0333-1111222',
        createdBy: admin._id
    });
    console.log('Created Teacher: teacher@university.com / teacher123');

    // Create students
    const studentData = [
        { name: 'Ahmed Khan', email: 'ahmed@student.com', department: 'Computer Science', sem: 4, batch: '2022-2026', cgpa: 3.7, fee: 55000, paid: 55000 },
        { name: 'Fatima Malik', email: 'fatima@student.com', department: 'Software Engineering', sem: 3, batch: '2023-2027', cgpa: 3.5, fee: 52000, paid: 26000 },
        { name: 'Usman Ali', email: 'usman@student.com', department: 'Electrical Engineering', sem: 6, batch: '2021-2025', cgpa: 2.9, fee: 58000, paid: 58000 },
        { name: 'Zara Siddiqui', email: 'zara@student.com', department: 'Computer Science', sem: 2, batch: '2024-2028', cgpa: 3.8, fee: 55000, paid: 0 },
        { name: 'Hassan Raza', email: 'hassan@student.com', department: 'Data Science', sem: 5, batch: '2022-2026', cgpa: 3.2, fee: 60000, paid: 45000 },
    ];

    for (let i = 0; i < studentData.length; i++) {
        const sd = studentData[i];
        const user = await User.create({
            name: sd.name, email: sd.email, password: 'student123',
            role: 'student', userId: `STD-${String(i + 1).padStart(4, '0')}`,
            createdBy: admin._id
        });
        const feeStatus = sd.paid >= sd.fee ? 'paid' : sd.paid > 0 ? 'partial' : 'unpaid';
        await Student.create({
            user: user._id,
            studentId: `STD-${String(i + 1).padStart(4, '0')}`,
            department: sd.department,
            semester: sd.sem,
            batch: sd.batch,
            cgpa: sd.cgpa,
            feeAmount: sd.fee,
            feePaid: sd.paid,
            feeStatus,
            feeLastPaid: sd.paid > 0 ? new Date() : null,
            totalClasses: 60,
            classesAttended: Math.floor(Math.random() * 10) + 50,
            attendancePercentage: parseFloat(((Math.floor(Math.random() * 10) + 50) / 60 * 100).toFixed(1))
        });
        console.log(`Created Student: ${sd.email} / student123`);
    }

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('SuperAdmin: superadmin@university.com / admin123');
    console.log('Admin: admin@university.com / admin123');
    console.log('Teacher: teacher@university.com / teacher123');
    console.log('Students: ahmed@student.com, fatima@student.com, etc. / student123');
    process.exit(0);
};

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
