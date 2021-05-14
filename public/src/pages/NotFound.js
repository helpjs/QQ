import React from "react";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";

const NotFound = () => (
	<div>
		<h1>404 - Not Found!</h1>
		<Button component={Link} to="/" variant="contained" color="primary">
			Go Home
		</Button>
	</div>
);

export default NotFound;
