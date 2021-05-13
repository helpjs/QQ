const mongoose = require("mongoose");
const slugify = require("slugify");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Please add a name"],
			unique: true,
			trim: true,
			maxlength: [128, "Name cannot exceed 128 characters"],
		},
		email: {
			type: String,
			required: [true, "Please add an email"],
			unique: true,
			match: [
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,5})+$/,
				"Please add a valid email",
			],
		},
		role: {
			type: String,
			enum: ["admin", "agent", "user"],
			default: "user",
		},
		password: {
			type: String,
			required: [true, "Please add a password"],
			minlength: 8,
			select: false,
		},
		slug: String,
		department: {
			type: mongoose.Schema.ObjectId,
			ref: "Department",
		},
		resetPasswordToken: { type: String, select: false },
		resetPasswordExpire: { type: Date, select: false },
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

//Encrypt password using bcrypt
UserSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		next();
	}

	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

//Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
	//Generate token
	const resetToken = crypto.randomBytes(20).toString("hex");

	//Hash token and set to resetPasswordToken field
	this.resetPasswordToken = crypto
		.createHash("sha256")
		.update(resetToken)
		.digest("hex");

	//Set expiration of token
	this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

	return resetToken;
};

UserSchema.virtual("tasks", {
	ref: "Task",
	localField: "_id",
	foreignField: "assignedTo",
	justOne: false,
});

UserSchema.virtual("watching", {
	ref: "Task",
	localField: "_id",
	foreignField: "watchers",
	justOne: false,
});

UserSchema.pre("save", function (next) {
	this.slug = slugify(this.name, { lower: true });
	next();
});

UserSchema.pre("remove", function (next) {
	var user = this;
	user
		.model("Task")
		.update(
			{ assignedTo: user._id },
			{ $pull: { assignedTo: user._id } },
			{ multi: true },
			next
		);
	user
		.model("Task")
		.update(
			{ watchers: user._id },
			{ $pull: { watchers: user._id } },
			{ multi: true },
			next
		);
});

module.exports = mongoose.model("User", UserSchema);
