const mongoose = require("mongoose");
const slugify = require("slugify");

const TaskSchema = new mongoose.Schema({
	title: {
		type: String,
		required: [true, "Please add a title"],
		unique: true,
		trim: true,
		maxlength: [128, "Name cannot exceed 128 characters"],
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	slug: { type: String, unique: true },
	priority: {
		type: String,
		enum: ["high", "medium", "low"],
		default: "medium",
	},
	assignedTo: [
		{
			type: mongoose.Schema.ObjectId,
			ref: "User",
		},
	],
	watchers: [
		{
			type: mongoose.Schema.ObjectId,
			ref: "User",
		},
	],
	createdBy: {
		type: mongoose.Schema.ObjectId,
		ref: "User",
	},
	status: {
		type: String,
		enum: ["unassigned", "waiting", "inProgress", "completed"],
		default: "unassigned",
	},
});

TaskSchema.pre("save", function (next) {
	this.slug = slugify(this.title, { lower: true });
	next();
});

module.exports = mongoose.model("Task", TaskSchema);
