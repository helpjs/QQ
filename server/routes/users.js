const express = require("express");
const {
	getUsers,
	getUser,
	createUser,
	updateUser,
	deleteUser,
} = require("../controllers/users");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

//Include models to be passed to router methods
const User = require("../models/User");

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
		advancedResults(User, ["department", "tasks", "watching"]),
		getUsers
	)
	.post(protect, authorize("admin"), createUser);
router
	.route("/:id")
	.get(protect, getUser)
	.put(protect, authorize("admin"), updateUser)
	.delete(protect, authorize("admin"), deleteUser);
module.exports = router;
