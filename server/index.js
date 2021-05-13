const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const errorHandler = require("./middleware/error");
const passport = require("passport");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");

// Load env vars
dotenv.config({ path: "./config/config.env" });

// Load passport config
require("./config/passport")(passport);

// Connect to MongoDB
connectDB();

// Route files
const departments = require("./routes/departments");
const users = require("./routes/users");
const tasks = require("./routes/tasks");
const auth = require("./routes/auth");

// Create Express
const app = express();

// Cookie Session Middleware
app.use(
	cookieSession({
		name: "qq",
		keys: ["asdfjkl;qweruiop!@#$"],
		maxAge: 24 * 60 * 60 * 1000, // 24 hrs
	})
);

app.use(passport.initialize());
app.use(passport.session());

// Cookie Parser
app.use(cookieParser());

// Body parser (now included in express)
app.use(express.json());

// Dev Logging Middleware
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
	windowMs: 10 * 10 * 1000, // 10 min
	max: 500,
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS for front end
app.use(
	cors({
		origin: process.env.PUBLIC_URL,
		credentials: true,
	})
);

// Set static folder
app.use(express.static(path.join(__dirname, "./public")));

// Mount routers
app.use("/api/v1/departments", departments);
app.use("/api/v1/users", users);
app.use("/api/v1/tasks", tasks);
app.use("/api/v1/auth", auth);

// Use the error handler custom middleware
app.use(errorHandler);

// Actually start the server
const PORT = process.env.PORT;
const server = app.listen(
	PORT,
	console.log(
		`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
	)
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
	console.log(`Error: ${err.message}`.red);
	// Close server & exit process
	server.close(() => process.exit(1));
});
