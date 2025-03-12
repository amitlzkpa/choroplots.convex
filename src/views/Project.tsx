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
      initializationStatus: "agreements_uploaded",
    });

    await cvxUtils.performAction_updateProject({ projectId: projectId as Id<"vsProjects">, updateData });
  };

  return (
    <Flex w="100%" direction="column" align="center" gap="sm" p="lg">
      <Flex w="100%" mb="xl" gap="md" pb="xl">
        <Text size="xl">
          Project
        </Text>
      </Flex>
      <Flex w="100%" mb="xl" gap="md" pb="xl">
        <Text>
          {currProject?._id}
        </Text>
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
