import { Route, Redirect } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

function ProtectedRoute({ component: Component, children, ...rest }) {
	const { isAuth } = useAuth();
	return (
		<Route
			{...rest}
			render={(props) => {
				if (isAuth) {
					return <Component>{children}</Component>;
				} else {
					return (
						<Redirect
							to={{ pathname: "/login", state: { from: props.location } }}
						/>
					);
				}
			}}
		/>
	);
}

export default ProtectedRoute;
