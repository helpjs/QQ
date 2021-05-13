const ErrorResponse = require("../utils/errorResponse");
const errorHandler = (err, req, res, next) => {
	let error = { ...err };

	error.message = err.message;

	// Log to console for dev
	console.log(err.stack.red);

	// Mongoose bad ObjectId
	if (err.name === "CastError") {
		const message = `Resource not found`;
		error = new ErrorResponse(message, 404);
	}

	// Mongoose duplicate key
	if (err.code === 11000) {
		const field = err.message
			.split(" ")
			.map((el, key, array) => el.includes("index:") && array[key + 1])
			.filter(Boolean)[0]
			.replace(/\_\d+/g, "");
		const message = `Duplicate field value entered in the '${field}' field`;
		error = new ErrorResponse(message, 400);
	}

	// Mongoose validation error
	if (err.name === "ValidationError") {
		const message = Object.values(err.errors).map((val) => val.message);
		error = new ErrorResponse(message, 400);
	}

	res
		.status(error.statusCode || 500)
		.json({ success: false, error: error.message || "Server Error" });
};

module.exports = errorHandler;
