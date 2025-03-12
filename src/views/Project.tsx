import { useParams } from "react-router-dom";
import {
  Button,
  Card,
  Divider,
  Flex,
  Text,
} from "@mantine/core";

import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

import FileUploader from "../components/FileUploader";

import useCvxUtils from "../hooks/cvxUtils";

export default function Project() {
  const cvxUtils = useCvxUtils();

  // PROJECT

  const { projectId = "" } = useParams();

  const currProject = useQuery(
    api.dbOps.getProject_ByProjectId,
    projectId ? { projectId: projectId as Id<"vsProjects"> } : "skip"
  );

  // STOREDFILE

  const curProjectStoredFiles = useQuery(
    api.dbOps.getAllStoredFiles_ForProject,
    projectId ? { projectId: projectId as Id<"vsProjects"> } : "skip"
  );

  const onClick_uploadFiles_StoredFile = async (droppedFiles: any) => {
    const ps = droppedFiles.map(
      (file: any) =>
        new Promise((resolve, reject) => {
          cvxUtils.performAction_generateUploadUrl().then(async (uploadUrl) => {
            try {
              const result = await fetch(uploadUrl, {
                method: "POST",
                body: file,
              });
              const uploadedCvxFile = await result.json();
              const cvxStoredFileId = uploadedCvxFile.storageId;
              const newStoredFileId = await cvxUtils.performAction_createNewStoredFile({
                projectId,
                cvxStoredFileId,
              });
              return resolve(newStoredFileId);
            } catch (err) {
              return reject(err);
            }
          });
        })
    );

    const storedFileIds = (await Promise.allSettled(ps))
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value);

    const updateData = JSON.stringify({
      initializationStatus: "files_uploaded",
    });

    await cvxUtils.performAction_updateProject({ projectId: projectId as Id<"vsProjects">, updateData });
  };

  return (
    <Flex w="100%" direction="column" gap="sm" p="lg">
      <Flex w="100%" align="center" gap="md">
        <Text size="xl" fw="bold">
          Project
        </Text>
        <Text>
          {currProject?._id}
        </Text>
      </Flex>

      <Divider />

      <Flex w="100%" direction="column" gap="sm">
        <Flex w="100%" gap="md">
          <Text>
            Uploaded Files {curProjectStoredFiles ? `(${curProjectStoredFiles.length})` : ""}
          </Text>
        </Flex>
        <Flex w="100%" direction="column" align="center" gap="xs">
          {(curProjectStoredFiles ?? []).map((storedFile: any) => {
            return (
              <Card key={storedFile._id} w="100%" withBorder radius="xl">
                <Flex direction="column" align="stretch" gap="sm">
                  <Text fz="sm">{storedFile._id}</Text>
                  <Button
                    component="a"
                    variant="outline"
                    href={storedFile.fileUrl}
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
      </Flex>

      <Flex
        w="100%"
        h="100%"
        direction="column"
        justify="center"
        align="center"
        gap="sm"
        style={{ textAlign: "center" }}
      >
        <FileUploader
          projectId={projectId}
          onClick_uploadFiles={onClick_uploadFiles_StoredFile}
          allowMultiple={false}
        />
      </Flex>
    </Flex>
  );
}
