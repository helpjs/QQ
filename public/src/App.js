import { React, useContext } from "react";
import { Switch, BrowserRouter as Router, Route } from "react-router-dom";
import "./App.css";
import { CustomThemeContext } from "./contexts/CustomThemeProvider";
import ProtectedRoute from "./ProtectedRoute";

import {
	FormControlLabel,
	Switch as SwitchUI,
	makeStyles,
} from "@material-ui/core";

import Brightness2Icon from "@material-ui/icons/Brightness2";
import Brightness5Icon from "@material-ui/icons/Brightness5";

import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import NotFound from "./pages/NotFound";

const useStyles = makeStyles({
	themeSwitch: {
		display: "flex",
		alignItems: "center",
		top: 0,
		right: 0,
		position: "fixed",
		padding: ".5rem",
	},
});

function App() {
	//Apply Styles
	const classes = useStyles();

	//Dark or Light Mode Switcher
	const { currentTheme, setTheme } = useContext(CustomThemeContext);
	const isDark = Boolean(currentTheme === "dark");
	const handleThemeChange = (e) => {
		const { checked } = e.target;
		checked ? setTheme("dark") : setTheme("light");
	};

	return (
		<>
			{/*Fixed dark mode switch*/}
			<div className={classes.themeSwitch}>
				{isDark ? <Brightness2Icon /> : <Brightness5Icon />}
				<SwitchUI checked={isDark} onChange={handleThemeChange} />
			</div>

			<Router>
				<Switch>
					<ProtectedRoute exact path="/" component={Home} />
					<Route exact path="/login" component={SignIn} />
					<Route component={NotFound} />
				</Switch>
			</Router>
		</>
	);
}

export default App;
