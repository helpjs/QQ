const advancedResults = (model, populateFields) => async (req, res, next) => {
	let query;

	// Copy req.query
	const reqQuery = { ...req.query };

	// Fields to exclude
	const removeFields = [
		"select",
		"sort",
		"page",
		"limit",
		"pagination",
		"populates",
	];

	// Loop over removeFields and delete them from reqQuery
	removeFields.forEach((param) => delete reqQuery[param]);

	// Create query string
	let queryStr = JSON.stringify(reqQuery);

	// Create operators ($gt, $gte, etc)
	queryStr = queryStr.replace(
		/\b(gt|gte|lt|lte|in)\b/g,
		(match) => `$${match}`
	);

	// Finding resource
	query = model.find(JSON.parse(queryStr));

	// Select Fields
	if (req.query.select) {
		const fields = req.query.select.split(",").join(" ");
		query = query.select(fields);
	}

	// Sort
	if (req.query.sort) {
		const sortBy = req.query.sort.split(",").join(" ");
		query = query.collation({ locale: "en" }).sort(sortBy);
	} else {
		query = query.sort("-createdAt");
	}

	// Pagination
	const pagination = req.query.pagination || "false";
	const populates = req.query.populates || "true";
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 50;
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;
	const total = await model.countDocuments();

	if (pagination === "true") {
		query = query.skip(startIndex).limit(limit);
	}

	if (populates !== "false") {
		// If an array is passed in, such as ["unit", "relatedEntries", "relatedPeople"], loop over each one and populate
		if (populateFields && Array.isArray(populateFields)) {
			populateFields.forEach((field) => {
				query = query.populate(field);
			});
			// Else if it is a string, just populate that one field
		} else if (populateFields && typeof (populateFields === "string")) {
			query = query.populate(populateFields);
		}
	}

	// Executing query
	const results = await query;

	if (pagination === "true") {
		// Pagination result
		const pagination = {};

		if (endIndex < total) {
			pagination.next = {
				page: page + 1,
				limit,
			};
		}

		if (startIndex > 0) {
			pagination.prev = {
				page: page - 1,
				limit,
			};
		}

		res.advancedResults = {
			success: true,
			unt: results.length,
			pagination,
			data: results,
		};

		next();
	} else {
		//No pagination result
		res.advancedResults = {
			success: true,
			count: results.length,
			data: results,
		};
		next();
	}
};

module.exports = advancedResults;
