const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");

// @desc			Get all users
// @rouge			GET /api/v1/auth/users
// @access		Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedResults);
});

// @desc			Get single users
// @rouge			GET /api/v1/auth/users/:id
// @access		Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.params.id);

	res.status(200).json({
		success: true,
		data: user,
	});
});

// @desc			Create user
// @rouge			POST /api/v1/auth/users
// @access		Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
	if (
		!req.body.password.match(
			/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm
		)
	) {
		return next(
			new ErrorResponse(
				"Password must be at least 8 characters,Password must have 1 lowercase character,Password must have 1 uppercase character,Password must have 1 number"
			)
		);
	}

	const user = await User.create(req.body);

	res.status(201).json({
		success: true,
		data: user,
	});
});

// @desc			Update user
// @rouge			PUT /api/v1/auth/users/:id
// @access		Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
	const findUser = await User.findById(req.params.id);
	if (!findUser) {
		return next(
			new ErrorResponse(`No user found with _id of ${req.params.id}`, 404)
		);
	}

	const user = await User.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		success: true,
		data: user,
	});
});

// @desc			Delete user
// @rouge			DELETE /api/v1/auth/users/:id
// @access		Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
	const user = await User.findByIdAndDelete(req.params.id);

	res.status(200).json({
		success: true,
		data: {},
	});
});
