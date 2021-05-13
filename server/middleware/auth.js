const asyncHandler = require("./async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
	if (req.isAuthenticated) {
		return next();
	} else {
		return next(
			new ErrorResponse(
				`You are not currently logged in. Pleas log in before attempting to access this route.`,
				403
			)
		);
	}
});

//Grant access to specific roles
exports.authorize = (...roles) => {
	return (req, res, next) => {
		if (!req.user) {
			return next(
				new ErrorResponse(
					`You are not currently logged in. Please log in before attempting to access this route.`,
					403
				)
			);
		} else if (!roles.includes(req.user.role)) {
			return next(
				new ErrorResponse(
					`User role ${req.user.role} is not authorized to access this route`,
					403
				)
			);
		}
		next();
	};
};
