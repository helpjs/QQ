const mongoose = require("mongoose");
const slugify = require("slugify");

const DepartmentSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Please add a name"],
			unique: true,
			trim: true,
			maxlength: [128, "Name can not be more than 128 characters"],
		},
		slug: String,
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

DepartmentSchema.pre("save", function (next) {
	this.slug = slugify(this.name, { lower: true });
	next();
});

// Reverse populate virtuals
DepartmentSchema.virtual("agents", {
	ref: "User",
	localField: "_id",
	foreignField: "department",
	justOne: false,
});

// Remove all references to department on delete
DepartmentSchema.pre("remove", function (next) {
	var department = this;
	department
		.model("User")
		.update(
			{ department: department._id },
			{ $unset: { department: 1 } },
			{ multi: true },
			next
		);
});

module.exports = mongoose.model("Department", DepartmentSchema);
