const express = require("express");
const {
	getDepartments,
	getDepartment,
	createDepartment,
	updateDepartment,
	deleteDepartment,
} = require("../controllers/departments");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

//Include models to be passed to router methods
const Department = require("../models/Department");

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
		advancedResults(Department, [{ path: "agents" }]),
		getDepartments
	)
	.post(protect, authorize("admin"), createDepartment);
router
	.route("/:id")
	.get(protect, getDepartment)
	.put(protect, authorize("admin"), updateDepartment)
	.delete(protect, authorize("admin"), deleteDepartment);
module.exports = router;
