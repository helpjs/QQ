const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Task = require("../models/Task");
const slugify = require("slugify");

// @desc					Get all tasks
// @route					GET /api/v1/tasks
// @access				Public
exports.getTasks = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedResults);
});

// @desc					Get single tasks
// @route					GET /api/v1/tasks/:id
// @access				Public
exports.getTask = asyncHandler(async (req, res, next) => {
	const task = await Task.findById(req.params.id);

	//If a correctly formatted ID is sent, but that ID doesn't exist, return success: false
	if (!task) {
		return next(
			new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
		);
	}

	res.status(200).json({ success: true, data: task });
});

// @desc					Create task
// @route					POST /api/v1/tasks
// @access				Private
exports.createTask = asyncHandler(async (req, res, next) => {
	if (!req.body.createdBy) {
		req.body.createdBy = req.user.id;
	}

	if (!req.body.assignedTo) {
		req.body.status = "unassigned";
	} else {
		req.body.status = "waiting";
	}

	const task = await Task.create(req.body);

	res.status(201).json({ success: true, data: task });
});

// @desc					Update task
// @route					PUT /api/v1/tasks/:id
// @access				Private
exports.updateTask = asyncHandler(async (req, res, next) => {
	const task = await Task.findById(req.params.id);

	if (!task) {
		return next(
			new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
		);
	}

	if (task.createdBy !== req.user.id || req.user.role !== "admin") {
		return next(
			new ErrorResponse(`You are not the creator of this task.`, 400)
		);
	}

	if (req.body.slug) {
		req.body.slug = slugify(req.body.slug, { lower: true });
	}

	const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({ success: true, data: updatedTask });
});

// @desc					Delete task
// @route					DELETE /api/v1/tasks/:id
// @access				Private
exports.deleteTask = asyncHandler(async (req, res, next) => {
	const task = await Task.findById(req.params.id);

	if (!task) {
		return next(
			new ErrorResponse(`Task not found with id of ${req.params.id}`, 404)
		);
	}

	if (task.createdBy !== req.user.id || req.user.role !== "admin") {
		return next(
			new ErrorResponse(`You are not the creator of this task.`, 400)
		);
	}

	task.remove();

	res.status(200).json({ success: true, data: {} });
});
