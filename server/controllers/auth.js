const crypto = require("crypto");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/User");
const passport = require("passport");

// @desc			Register user
// @rouge			POST /api/v1/auth/register
// @access		Public
exports.register = asyncHandler(async (req, res, next) => {
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

	const user = await User.create({
		...req.body,
		role: "user",
		department: undefined,
	});

	passport.authenticate("local", (err, user, info) => {
		if (err) {
			return next(err);
		}

		if (!user) {
			return res.status(400).json({
				success: false,
				user,
				info,
			});
		}

		req.login(user, (err) => {
			return res.status(200).json({
				success: true,
			});
		});
	})(req, res, next);
});

// @desc			Login user
// @rouge			POST /api/v1/auth/login
// @access		Public
exports.login = asyncHandler(async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email }).exec();

	passport.authenticate("local", (err, user, info) => {
		if (err) {
			return next(err);
		}

		if (!user) {
			return res.status(400).json({
				success: false,
				user,
				info,
			});
		}

		date = new Date();
		console.log(`${date} | ${req.body.email} logged in.`.green);

		req.login(user, (err) => {
			return res.status(200).json({
				success: true,
			});
		});
	})(req, res, next);
});

// @desc			Log out user / clear cookie
// @route			GET /api/v1/auth/logout
// @access		Private
exports.logout = asyncHandler(async (req, res, next) => {
	req.logout();
	return res.status(200).json({
		success: true,
	});
});

// @desc			Get current logged in user
// @route			POST /api/v1/auth/me
// @access		Private
exports.getMe = asyncHandler(async (req, res, next) => {
	if (!req.user) {
		return next(
			new ErrorResponse("You are not logged in. Please log in.", 400)
		);
	}

	const user = await User.findById(req.user.id);

	res.status(200).json({
		success: true,
		data: user,
	});
});

// @desc			Update user details
// @route			PUT /api/v1/auth/updatedetails
// @access		Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
	const fieldsToUpdate = {
		name: req.body.name,
		email: req.body.email,
	};

	const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		success: true,
		data: user,
	});
});

// @desc			Update password
// @route			PUT /api/v1/auth/updatepassword
// @access		Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user.id).select("+password");

	//Check current password
	if (!(await user.matchPassword(req.body.currentPassword))) {
		return next(new ErrorResponse("Current password is incorrect", 401));
	}

	if (
		!req.body.newPassword.match(
			/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm
		)
	) {
		return next(
			new ErrorResponse(
				"Password must be at least 8 characters,Password must have 1 lowercase character,Password must have 1 uppercase character,Password must have 1 number"
			)
		);
	}

	user.password = req.body.newPassword;
	await user.save();

	res.status(200).json({
		success: true,
		data: `Password for ${user.email} successfully changed`,
	});
});

// @desc			Forgot Password
// @route			POST /api/v1/auth/forgotpassword
// @access		Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });

	if (!user) {
		return next(new ErrorResponse("There is no user with that email", 404));
	}

	//Get reset token
	const resetToken = user.getResetPasswordToken();

	await user.save({ validateBeforeSave: false });

	const resetUrl = `${req.protocol}://${req.get(
		"host"
	)}/api/v1/auth/resetpassword/${resetToken}`;

	const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n${resetUrl}`;

	try {
		await sendEmail({
			email: user.email,
			subject: "Password reset token",
			message,
		});

		res.status(200).json({ success: true, data: "Email sent" });
	} catch (err) {
		console.log(err);
		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;

		await user.save({ validateBeforeSave: false });

		return next(new ErrorResponse("Email could not be sent", 500));
	}

	res.status(200).json({
		success: true,
		data: user,
	});
});

// @desc			Reset Password
// @route			Put /api/v1/auth/resetpassword/:resettoken
// @access		Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
	//Get hashed token
	const resetPasswordToken = crypto
		.createHash("sha256")
		.update(req.params.resettoken)
		.digest("hex");

	const user = await User.findOne({
		resetPasswordToken,
		resetPasswordExpire: { $gt: Date.now() },
	});

	if (!user) {
		return next(new ErrorResponse("Invalid token", 400));
	}

	//Set new password
	user.password = req.body.password;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpire = undefined;
	await user.save();

	res.status(200).json({
		success: true,
		data: user.email,
	});
});
