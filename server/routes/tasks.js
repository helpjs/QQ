const express = require("express");
const {
	getTasks,
	getTask,
	createTask,
	updateTask,
	deleteTask,
} = require("../controllers/tasks");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

//Include models to be passed to router methods
const Task = require("../models/Task");

//Include other resource routers for populating
//Example:
//const pageCommentsRouter = require("./pageComments");

//Middleware
const advancedResults = require("../middleware/advancedResults");

//Re-route into other resource routers
//Example:
//router.use("/:pageId/pagecomments", pageCommentsRouter);

router
	.route("/")
	.get(
		protect,
		advancedResults(Task, ["assignedTo", "watchers", "createdBy"]),
		getTasks
	)
	.post(protect, createTask);
router
	.route("/:id")
	.get(protect, getTask)
	.put(protect, updateTask)
	.delete(protect, deleteTask);
module.exports = router;
