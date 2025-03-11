import "@mantine/core/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/carousel/styles.css";
import "./index.css";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useConvexAuth } from "convex/react";

import { Flex, Loader, MantineProvider, createTheme, rem } from "@mantine/core";

import Dev from "./views/Dev";
import Landing from "./views/Landing";
import MyAccount from "./views/MyAccount";
import Home from "./views/Home";
import Project from "./views/Project";

import Navbar from "./components/Navbar";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ children }: any) => {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <Flex w="100%" direction="column" justify="center" align="center" p="xl">
        <Loader size="md" type="bars" />
      </Flex>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

function App() {
  const theme = createTheme({
    fontFamily: "Nunito, sans-serif",
    fontFamilyMonospace: "Monaco, Courier, monospace",
    headings: {
      fontWeight: "800",
      fontFamily: "Bitter",
      sizes: {
        h1: { fontSize: rem(38), lineHeight: "0.9" },
        h2: { fontSize: rem(34), lineHeight: "0.9" },
        h3: { fontSize: rem(30), lineHeight: "0.9" },
        h4: { fontSize: rem(26), lineHeight: "0.9" },
        h5: { fontSize: rem(22), lineHeight: "0.9" },
        h6: { fontSize: rem(18), lineHeight: "0.9" },
      },
    },
    fontSizes: {
      xs: rem(16),
      sm: rem(17),
      md: rem(20),
      lg: rem(22),
      xl: rem(26),
    },
    lineHeights: {
      xs: "1.6",
      sm: "1.65",
      md: "1.75",
      lg: "1.8",
      xl: "1.85",
    },
    defaultRadius: "xl",
    primaryColor: "choroplot-main",
    colors: {
      "choroplot-main": [
        "#f3edff",
        "#e1d7fb",
        "#beabf0",
        "#9a7de7",
        "#7c56de",
        "#693dd9",
        "#5f30d8",
        "#4f23c0",
        "#461eac",
        "#3b1898",
      ],
    },
  });

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Outlet />,
      children: [
        { path: "", element: <Landing /> },
        { path: "dev", element: <Dev /> },
        {
          path: "home",
          element: (
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          ),
        },
        {
          path: "my-account",
          element: (
            <ProtectedRoute>
              <MyAccount />
            </ProtectedRoute>
          ),
        },
        {
          path: "p/:projectId?",
          element: (
            <ProtectedRoute>
              <Project />
            </ProtectedRoute>
          ),
        },
      ],
    },
  ]);

  const [navbarIsVisible, setNavbarIsVisible] = useState(true);

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const disableNavbar = params.has("disableNavbar");
      if (disableNavbar) setNavbarIsVisible(false);
      else setNavbarIsVisible(true);
    })();
  }, []);

  return (
    <MantineProvider theme={theme}>
      <Flex w="100%" h="100%" direction="column" align="center" gap="sm">
        {navbarIsVisible ? (
          <Flex w="100%" p="sm">
            <Navbar />
          </Flex>
        ) : (
          <></>
        )}
        <Flex w="100%" h="100%" p="sm" style={{ overflowY: "auto" }}>
          <RouterProvider router={router} />
        </Flex>
      </Flex>
    </MantineProvider>
  );
}

export default App;
