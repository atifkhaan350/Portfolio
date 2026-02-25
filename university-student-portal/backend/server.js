const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const connectDatabase = require("./config/database");
const User = require("./models/User");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const studentRoutes = require("./routes/studentRoutes");

dotenv.config();
connectDatabase();

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.status(200).json({ message: "University Student Portal API is running." });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

const createDefaultSuperAdmin = async () => {
  const email = "superadmin@university.edu";
  const existing = await User.findOne({ email });

  if (!existing) {
    const hashedPassword = await bcrypt.hash("SuperAdmin@123", 10);
    await User.create({
      fullName: "Default Super Admin",
      email,
      password: hashedPassword,
      role: "super_admin",
    });

    console.log("Default Super Admin created.");
    console.log("Login email: superadmin@university.edu");
    console.log("Login password: SuperAdmin@123");
  }
};

const port = process.env.PORT || 5001;
app.listen(port, async () => {
  await createDefaultSuperAdmin();
  console.log(`Server running on port ${port}`);
});
