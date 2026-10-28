const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");

dotenv.config();

const authRoutes = require("./routes/auth.js");
const eventRoutes = require("./routes/events.js");
const bookingRoutes = require("./routes/booking.js");

const app = express();
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5002;

if (!mongoUri) {
  console.error("MongoDB connection string is missing. Set MONGODB_URI or MONGO_URI.");
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  });
