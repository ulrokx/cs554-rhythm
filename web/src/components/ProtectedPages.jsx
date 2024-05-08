import { RedirectToSignIn, useAuth } from "@clerk/clerk-react";
import { Outlet, useNavigate } from "react-router-dom";

const ProtectedPages = () => {
  const { isSignedIn } = useAuth();
  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }
  return <Outlet />;
};
export default ProtectedPages;
