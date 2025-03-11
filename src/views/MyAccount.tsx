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

import useCvxUtils from "../hooks/cvxUtils";

export default function MyAccount() {
  const storedUserData = useQuery(api.dbOps.getUserData_ForCurrUser);
  const cvxUtils = useCvxUtils();

  const onClick_startDocusignOAuth = async () => {
    const redirectUri = await cvxUtils.performAction_startDocusignOAuth();
    window.location.href = redirectUri;
  };

  const onClick_startGWspcOAuth = async () => {
    const redirectUri = await cvxUtils.performAction_startGWspcOAuth();
    window.location.href = redirectUri;
  };

  // APPLICATIONS

  const currUserApplications = useQuery(
    api.dbOps.getAllApplications_ForCurrUser
  );

  return (
    <Flex w="100%" direction="column" align="center" gap="sm">
      <Flex w="60%" direction="column" align="center" gap="md" p="lg">
        {!storedUserData?.docusignAccessTknObj ? (
          <>
            <Button onClick={onClick_startDocusignOAuth} w="100%" size="lg">
              Connect Docusign
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
              <Text>Docusign Account Connected</Text>
              <FaRedo
                onClick={onClick_startDocusignOAuth}
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

      {(currUserApplications ?? []).length < 1 ? (
        <Flex
          w="100%"
          h="100%"
          maw="400"
          mah="400"
          direction="column"
          align="center"
          gap="sm"
          style={{ textAlign: "center" }}
        >
          <Text>No applications here yet. Let’s change that!</Text>
        </Flex>
      ) : (
        <Flex w="50%" direction="column" align="center" gap="xs">
          <Text fz="md" fw="bold">
            My Applications
          </Text>
          {(currUserApplications ?? []).map((apl) => {
            return (
              <UnstyledButton
                component="a"
                w="100%"
                href={`/apply/${apl._id}`}
                key={apl._id}
              >
                <Card w="100%" withBorder radius="xl">
                  <Text>{apl._id}</Text>
                </Card>
              </UnstyledButton>
            );
          })}
        </Flex>
      )}
    </Flex>
  );
}
