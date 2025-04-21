import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { JSX, useEffect } from "react";

const PrivateRoute: React.FC<{ element: JSX.Element }> = ({ element }) => {
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/", { replace: true });
    }
  }, [token, navigate]);

  if (!token) {
    return null;
  }
  return element;
};

export default PrivateRoute;
