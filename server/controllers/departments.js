const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Department = require("../models/Department");
const slugify = require("slugify");

// @desc					Get all departments
// @route					GET /api/v1/departments
// @access				Public
exports.getDepartments = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedResults);
});

// @desc					Get single departments
// @route					GET /api/v1/departments/:id
// @access				Public
exports.getDepartment = asyncHandler(async (req, res, next) => {
	const department = await Department.findById(req.params.id);

	//If a correctly formatted ID is sent, but that ID doesn't exist, return success: false
	if (!department) {
		return next(
			new ErrorResponse(`Department not found with id of ${req.params.id}`, 404)
		);
	}

	res.status(200).json({ success: true, data: department });
});

// @desc					Create department
// @route					POST /api/v1/departments
// @access				Private
exports.createDepartment = asyncHandler(async (req, res, next) => {
	const department = await Department.create(req.body);

	res.status(201).json({ success: true, data: department });
});

// @desc					Update department
// @route					PUT /api/v1/departments/:id
// @access				Private
exports.updateDepartment = asyncHandler(async (req, res, next) => {
	const department = await Department.findById(req.params.id);

	if (!department) {
		return next(
			new ErrorResponse(`Department not found with id of ${req.params.id}`, 404)
		);
	}

	if (req.body.slug) {
		req.body.slug = slugify(req.body.slug, { lower: true });
	}

	const updatedDepartment = await Department.findByIdAndUpdate(
		req.params.id,
		req.body,
		{ new: true, runValidators: true }
	);

	res.status(200).json({ success: true, data: updatedDepartment });
});

// @desc					Delete department
// @route					DELETE /api/v1/departments/:id
// @access				Private
exports.deleteDepartment = asyncHandler(async (req, res, next) => {
	const department = await Department.findById(req.params.id);

	if (!department) {
		return next(
			new ErrorResponse(`Department not found with id of ${req.params.id}`, 404)
		);
	}

	department.remove();

	res.status(200).json({ success: true, data: {} });
});
