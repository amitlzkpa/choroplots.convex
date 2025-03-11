import { Button, Flex, Loader } from "@mantine/core";
import { FaBars, FaInfoCircle } from "react-icons/fa";

import {
  Authenticated,
  Unauthenticated,
  AuthLoading,
  useConvexAuth,
} from "convex/react";
import { SignInButton, UserButton } from "@clerk/clerk-react";

export default function Navbar() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <Flex w="100%" h="100%" justify="space-between" align="center" gap="md">
      <Flex align="center">
        <Button
          component="a"
          href={isAuthenticated ? "/home" : "/"}
          variant="subtle"
          size="md"
          h={48}
        >
          <img
            src="/logo-512x512.png"
            alt="Choroplots"
            style={{ height: "2rem", margin: 8 }}
          />
          Choroplots
        </Button>
      </Flex>

      <Flex align="center" gap="md">
        <AuthLoading>
          <Loader size="sm" />
        </AuthLoading>
        <Unauthenticated>
          <SignInButton fallbackRedirectUrl="/">
            <Button variant="outline" radius="xl" size="md" h={48}>
              Login
            </Button>
          </SignInButton>
        </Unauthenticated>
        <Authenticated>
          <Flex align="center" mr="md">
            <Button
              component="a"
              variant="transparent"
              href="/my-account"
              size="sm"
              h={32}
            >
              <FaBars />
            </Button>
            <UserButton />
          </Flex>
        </Authenticated>
      </Flex>
    </Flex>
  );
}
