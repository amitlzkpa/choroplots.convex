import { useEffect, useRef, useState } from "react";
import {
  Accordion,
  Button,
  Card,
  Center,
  Divider,
  Flex,
  Input,
  Text,
  rem,
} from "@mantine/core";

import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

import FileUploader from "../components/FileUploader";
import Summary_SrcDoc from "../components/Summary_SrcDoc";

export default function ProjectInit_AgreementSent({ projectId = null }: any) {
  const curProjectSrcDocs = useQuery(
    api.dbOps.getAllSrcDocs_ForProject,
    projectId ? { projectId: projectId as Id<"vsProjects"> } : "skip"
  );

  const curProjectPrjFiles = useQuery(
    api.dbOps.getAllPrjFiles_ForProject,
    projectId ? { projectId: projectId as Id<"vsProjects"> } : "skip"
  );

  return (
    <>
      <Flex
        w="100%"
        h="100%"
        direction="column"
        align="center"
        gap="sm"
        py="lg"
      >
        <Text fz="lg" fw="bold">
          Agreement Sent
        </Text>

        <Accordion w="100%" defaultValue="upload-srcdoc">
          <Accordion.Item key="list-srcdocs" value="list-srcdocs">
            <Accordion.Control>
              <Text size="md" fw="bold">
                Documents
              </Text>
            </Accordion.Control>
            <Accordion.Panel>
              <Flex w="100%" direction="column" align="center" gap="xs">
                {(curProjectSrcDocs ?? []).map((srcDoc: any) => {
                  return (
                    <Card key={srcDoc._id} w="100%" withBorder radius="xl">
                      <Flex direction="column" align="stretch" gap="sm">
                        <Text fz="sm">{srcDoc.titleText}</Text>
                        <Summary_SrcDoc srcDocId={srcDoc._id} />

                        <Button
                          component="a"
                          variant="outline"
                          href={srcDoc.fileUrl}
                          target="_blank"
                          w="100%"
                          size="lg"
                        >
                          Open
                        </Button>
                      </Flex>
                    </Card>
                  );
                })}
              </Flex>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item key="list-prjfiles" value="list-prjfiles">
            <Accordion.Control>
              <Text size="md" fw="bold">
                Received Files
              </Text>
            </Accordion.Control>
            <Accordion.Panel>
              <Flex w="100%" direction="column" align="center" gap="xs">
                {(curProjectPrjFiles ?? []).map((prjFile: any) => {
                  return (
                    <Card key={prjFile._id} w="100%" withBorder radius="xl">
                      <Flex direction="column" align="stretch" gap="sm">
                        <Text fw="bold">{prjFile.titleText}</Text>
                        <Text>{prjFile.summaryText}</Text>

                        <Button
                          component="a"
                          variant="outline"
                          href={prjFile.fileUrl}
                          target="_blank"
                          w="100%"
                          size="lg"
                        >
                          Open
                        </Button>
                      </Flex>
                    </Card>
                  );
                })}
              </Flex>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Flex>
    </>
  );
}
