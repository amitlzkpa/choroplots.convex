import {
  Button,
  Card,
  Divider,
  Flex,
  Text,
  UnstyledButton,
  rem,
} from "@mantine/core";

import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FaCheckCircle, FaRedo } from "react-icons/fa";

// import useCvxUtils from "../hooks/cvxUtils";

export default function MyAccount() {
  const storedUserData = useQuery(api.dbOps.getUserData_ForCurrUser);
  
  // const cvxUtils = useCvxUtils();
  // const onClick_startGWspcOAuth = async () => {
  //   const redirectUri = await cvxUtils.performAction_startGWspcOAuth();
  //   window.location.href = redirectUri;
  // };

  return (
    <Flex w="100%" direction="column" align="center" gap="sm">

      <Text size="xl">
        My Account
      </Text>

      {/*
      <Divider w="60%" my="lg" />

      <Flex w="60%" direction="column" align="center" gap="md" p="lg">
        {!storedUserData?.googleDriveTknObj ? (
          <>
            <Button onClick={onClick_startGWspcOAuth} w="100%" size="lg">
              Connect Google Drive
            </Button>
          </>
        ) : (
          <>
            <Flex justify="center" align="center" gap="sm">
              <FaCheckCircle
                style={{
                  width: rem(12),
                  height: rem(12),
                  color: "var(--mantine-color-gray-5)",
                }}
              />
              <Text>Google Drive Account Connected</Text>
              <FaRedo
                onClick={onClick_startGWspcOAuth}
                style={{
                  width: rem(16),
                  height: rem(16),
                  color: "var(--mantine-color-gray-5)",
                  cursor: "pointer",
                }}
              />
            </Flex>
          </>
        )}
      </Flex>
      */}

    </Flex>
  );
}
