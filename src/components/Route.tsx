import { useAuth } from "providers/auth";
import { Navigate } from "react-router-dom";

type PrivateRouteProps = { children: JSX.Element };
type SecureRouteProps = { private?: boolean; component: JSX.Element };

export function PrivateRoute(props: PrivateRouteProps) {
  const { isAuthorized, isLoaded } = useAuth();
  return (
    <>
      {isAuthorized && props.children}
      {isLoaded && !isAuthorized && <Navigate to="/" />}
    </>
  );
}

export function SecureRoute(props: SecureRouteProps) {
  if (props.private) return <PrivateRoute>{props.component}</PrivateRoute>;
  return props.component;
}
