import { useAuthenticationStatus } from "hooks";
import { Navigate } from "react-router-dom";

type PrivateRouteProps = { children: JSX.Element };
type SecureRouteProps = { private?: boolean; component: JSX.Element };

export function PrivateRoute(props: PrivateRouteProps) {
  const Auth = useAuthenticationStatus();
  if (Auth.isLoadingAuthentication) return null;
  if (Auth.isAuthenticated) return props.children;
  return <Navigate to="/" />;
}

export function SecureRoute(props: SecureRouteProps) {
  if (props.private) return <PrivateRoute>{props.component}</PrivateRoute>;
  return props.component;
}
