import { useNavigate } from "react-router-dom";
import { Button, Card, Flex, Text, UnstyledButton } from "@mantine/core";

import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

import useCvxUtils from "../hooks/cvxUtils";

export default function Home() {
  const navigate = useNavigate();
  const cvxUtils = useCvxUtils();

  const onClickTest_createNewProject = async () => {
    const newProject = await cvxUtils.performAction_createNewProject();
    navigate(`/p/${newProject}`);
  };

  const currUserProjects = useQuery(api.dbOps.getAllProjects_ForCurrUser);

  return (
    <Flex w="100%" direction="column" align="center" gap="sm">
      <Flex w="60%" direction="column" align="center" gap="md" p="lg">
        <Button onClick={onClickTest_createNewProject} w="100%" size="lg">
          Create Project
        </Button>
      </Flex>

      {(currUserProjects ?? []).length < 1 ? (
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
          <Text>No projects here yet. Let’s change that!</Text>
          <Text fz="lg">Hit ‘Create Project’ to begin.</Text>
        </Flex>
      ) : (
        <Flex w="50%" direction="column" align="center" gap="xs">
          <Text fz="md" fw="bold">
            My Projects
          </Text>
          {(currUserProjects ?? []).map((prj) => {
            return (
              <UnstyledButton
                component="a"
                w="100%"
                href={`/p/${prj._id}`}
                key={prj._id}
              >
                <Card w="100%" withBorder radius="xl">
                  <Text>{prj.titleText}</Text>
                </Card>
              </UnstyledButton>
            );
          })}
        </Flex>
      )}
    </Flex>
  );
}
