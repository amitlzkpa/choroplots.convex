import { useState } from "react";
import {
  Accordion,
  Button,
  Card,
  Divider,
  Flex,
  Loader,
  Text,
} from "@mantine/core";

import useCvxUtils from "../hooks/cvxUtils";

import {
  Authenticated,
  Unauthenticated,
  AuthLoading,
  useAction,
  useQuery,
} from "convex/react";
import { Id } from "../../convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";

export default function Dev() {
  const cvxUtils = useCvxUtils();

  // PROJECT

  const [projectId, setProjectId] = useState("");

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
                projectId: currProject?._id,
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
  };

  return (
    <Flex w="100%" direction="column" align="center" gap="sm">
      <AuthLoading>
        <Loader size="md" />
      </AuthLoading>
      <Unauthenticated>
        <Flex justify="center" p="lg">
          Please login
        </Flex>
      </Unauthenticated>
      <Authenticated>
        <Flex w="60%" direction="column" align="stretch" gap="md" p="lg">
          <Button
            w="100%"
            onClick={() => console.log("Test button clicked")}
            size="lg"
          >
            Test
          </Button>
        </Flex>
      </Authenticated>
    </Flex>
  );
}
