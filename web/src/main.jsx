import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import SignInPage from "./pages/SignInPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import "./index.css";
import HomePage from "./pages/HomePage.jsx";
import RootLayout from "./components/RootLayout.jsx";
import GamePage from "./pages/GamePage.jsx";
import "./App.css";
import MultiplayerPage from "./pages/MultiplayerPage.jsx";
import RankingPage from "./pages/RankingPage.jsx";
import SingleplayerPage from "./pages/SingleplayerPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import LevelsPage from "./pages/LevelsPage.jsx";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/sign-in/*", element: <SignInPage /> },
      { path: "/sign-up/*", element: <SignUpPage /> },
      { path: "/game", element: <GamePage /> },
      { path: "/multiplayer", element: <MultiplayerPage /> },
      { path: "/ranking", element: <RankingPage /> },
      { path: "/singleplayer", element: <SingleplayerPage /> },
      { path: "/profile", element: <ProfilePage /> },
      { path: "/profile/:id", element: <ProfilePage /> },
      { path: "/levels", element: <LevelsPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />,
);
