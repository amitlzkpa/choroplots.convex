import { useRef, useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Accordion,
  Button,
  Card,
  Center,
  Divider,
  Flex,
  Tabs,
  Text,
  Stepper,
  rem,
} from "@mantine/core";

import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

import useCvxUtils from "../hooks/cvxUtils";

export default function Project() {
  const cvxUtils = useCvxUtils();

  // PROJECT

  const { projectId } = useParams();

  const currProject = useQuery(
    api.dbOps.getProject_ByProjectId,
    projectId ? { projectId: projectId as Id<"vsProjects"> } : "skip"
  );

  return (
    <Flex w="100%" direction="column" align="center" gap="sm" p="lg">
      <Flex w="100%" mb="xl" gap="md" pb="xl">
        <Text size="xl">
          Projects
        </Text>
      </Flex>
    </Flex>
  );
}
