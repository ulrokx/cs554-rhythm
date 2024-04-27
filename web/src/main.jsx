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
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />,
);
