import React, { createContext, useEffect, useState } from "react";
import { useSnackbar } from "notistack";

const AuthContext = createContext({});

const AuthProvider = (props) => {
	const [user, setUser] = useState({});
	const [isAuth, setIsAuth] = useState(false);
	const { enqueueSnackbar } = useSnackbar();

	function checkAuth() {
		fetch("/api/v1/auth/me", {
			method: "GET",
			withCredentials: true,
			credentials: "include",
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.data) {
					setIsAuth(true);
					setUser(res.data);
				} else {
					setIsAuth(false);
					setUser({});
				}
			})
			.catch((e) => {
				//console.log(e);
			});
	}

	//Check auth on refresh
	useEffect(() => {
		checkAuth();
	}, []);

	const login = (user) => {
		fetch(`/api/v1/auth/login`, {
			method: "POST",
			withCredentials: true,
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(user),
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					checkAuth();
					enqueueSnackbar("Successfully logged in!", { variant: "success" });
				} else if (data.info) {
					enqueueSnackbar(data.info.message, { variant: "error" });
				} else if (data.error) {
					const errorArray = data.error.split(",");
					errorArray.forEach((error) => {
						enqueueSnackbar(`${error}`, { variant: "error" });
					});
				}
			})
			.catch((e) => {
				console.log(e);
			});
	};

	const logout = () => {
		fetch(`/api/v1/auth/logout`, {
			method: "GET",
			withCredentials: true,
			credentials: "include",
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					checkAuth();
					enqueueSnackbar("Logged out successfully!", { variant: "success" });
				}
			})
			.catch((e) => {
				console.log(e);
			});
	};

	const authContextValue = {
		isAuth,
		user,
		login,
		logout,
	};
	return <AuthContext.Provider value={authContextValue} {...props} />;
};

const useAuth = () => React.useContext(AuthContext);

export { AuthProvider, useAuth };
