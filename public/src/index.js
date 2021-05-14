import React from "react";
import ReactDOM from "react-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import CustomThemeProvider from "./contexts/CustomThemeProvider";
import App from "./App";
import theme from "./themes/base";
import { SnackbarProvider } from "notistack";
import { AuthProvider } from "./contexts/AuthContext";
import "./index.css";

ReactDOM.render(
	<SnackbarProvider maxSnack={5}>
		<CustomThemeProvider>
			{/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
			<CssBaseline />
			<AuthProvider>
				<App />
			</AuthProvider>
		</CustomThemeProvider>
	</SnackbarProvider>,
	document.querySelector("#root")
);
