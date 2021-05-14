import { useState } from "react";
import { Redirect, Link as RouterLink } from "react-router-dom";
import {
	Avatar,
	Button,
	TextField,
	FormControlLabel,
	Checkbox,
	Link,
	Grid,
	Box,
	Typography,
	makeStyles,
	Container,
} from "@material-ui/core";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";

import { useAuth } from "../contexts/AuthContext";

function Copyright() {
	return (
		<Typography variant="body2" color="textSecondary" align="center">
			{"Copyright © "}
			<Link component={RouterLink} color="inherit" to="/">
				{process.env.REACT_APP_COMPANY_NAME}
			</Link>{" "}
			{new Date().getFullYear()}
			{"."}
		</Typography>
	);
}

const useStyles = makeStyles((theme) => ({
	paper: {
		marginTop: theme.spacing(8),
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
	},
	avatar: {
		margin: theme.spacing(1),
		backgroundColor: theme.palette.secondary.main,
	},
	form: {
		width: "100%", // Fix IE 11 issue.
		marginTop: theme.spacing(1),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
}));

export default function SignIn(props) {
	const classes = useStyles();
	const [user, setUser] = useState({ email: "", password: "" });
	const { login, isAuth, errorMessage } = useAuth();

	const onChange = (e) => {
		e.preventDefault();
		setUser({ ...user, [e.target.name]: e.target.value });
	};

	const onSubmit = (e) => {
		e.preventDefault();
		login(user);
	};

	if (!isAuth) {
		return (
			<Container component="main" maxWidth="xs">
				<div className={classes.paper}>
					<Avatar className={classes.avatar}>
						<LockOutlinedIcon />
					</Avatar>
					<Typography component="h1" variant="h5">
						Sign in
					</Typography>
					<form className={classes.form} onSubmit={onSubmit}>
						<TextField
							variant="outlined"
							margin="normal"
							required
							fullWidth
							id="email"
							label="Email Address"
							name="email"
							autoComplete="email"
							autoFocus
							onChange={onChange}
						/>
						<TextField
							variant="outlined"
							margin="normal"
							required
							fullWidth
							name="password"
							label="Password"
							type="password"
							id="password"
							autoComplete="current-password"
							onChange={onChange}
						/>
						<Button
							type="submit"
							fullWidth
							variant="contained"
							color="primary"
							className={classes.submit}
						>
							Sign In
						</Button>
						<Grid container>
							<Grid item xs>
								<Link component={RouterLink} to="/forgot" variant="body2">
									Forgot password?
								</Link>
							</Grid>
							<Grid item>
								<Link component={RouterLink} to="/signup" variant="body2">
									{"Don't have an account? Sign Up"}
								</Link>
							</Grid>
						</Grid>
					</form>
				</div>
				<Box mt={8}>
					<Copyright />
				</Box>
			</Container>
		);
	} else {
		return (
			<Redirect
				to={{
					pathname: props.history.location.state
						? props.history.location.state.from.pathname
						: "/",
				}}
			/>
		);
	}
}
