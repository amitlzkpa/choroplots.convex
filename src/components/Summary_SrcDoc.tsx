import {
  Accordion,
  Button,
  Card,
  Center,
  Divider,
  Flex,
  Text,
  rem,
} from "@mantine/core";

import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

import useCvxUtils from "../hooks/cvxUtils";

export default function ProjectInit_Uninit({ srcDocId = null }: any) {
  const cvxUtils = useCvxUtils();

  const srcDoc = useQuery(
    api.dbOps.getSrcDoc_BySrcDocId,
    srcDocId ? { srcDocId } : "skip"
  );

  return (
    <>
      <Flex direction="column" w="100%" gap="md">
        {srcDoc?.summaryText ? (
          <Flex direction="column" w="100%">
            {/* <Text fw="bold" fz="sm">
              English
            </Text> */}
            <Text>{srcDoc?.summaryText}</Text>
          </Flex>
        ) : (
          <></>
        )}

        {srcDoc?.summary_es_Text ? (
          <Flex direction="column" w="100%">
            {/* <Text fw="bold" fz="sm">
              Spanish
            </Text> */}
            <Text>{srcDoc?.summary_es_Text}</Text>
          </Flex>
        ) : (
          <></>
        )}
      </Flex>
    </>
  );
}
