import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/clerk-react";
import { Link, Outlet, useNavigate } from "react-router-dom";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const RootLayout = () => {
  const navigate = useNavigate();
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} navigate={navigate}>
      <nav>
        <SignedIn>
          <UserButton afterSignOutUrl="/sign-in" />
          <Link className="home-game-button" to="/profile">
            Profile
          </Link>
          <Link className="home-game-button" to="/levels">
            Levels
          </Link>
          <Link className="home-game-button" to="/Multiplayer">
            Multiplayer
          </Link>
          <Link className="home-game-button" to="/creator">
            Creator
          </Link>
        </SignedIn>
        <SignedOut>
          <Link className="home-game-button" to="/sign-in">
            Sign In
          </Link>
        </SignedOut>

        <Link className="home-game-button" to="/">
          Home
        </Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </ClerkProvider>
  );
};
export default RootLayout;
