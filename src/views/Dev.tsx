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

import FileUploader from "../components/FileUploader";

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

  const [projectId, setProjectId] = useState(
    "jd7b1wfa7ys2vvws4qa7v48n0s78p3f4"
  );

  const currProject = useQuery(
    api.dbOps.getProject_ByProjectId,
    projectId ? { projectId: projectId as Id<"vsProjects"> } : "skip"
  );

  // SRCDOC

  const curProjectSrcDocs = useQuery(
    api.dbOps.getAllSrcDocs_ForProject,
    projectId ? { projectId: projectId as Id<"vsProjects"> } : "skip"
  );

  const onClick_uploadFiles_SrcDoc = async (droppedFiles: any) => {
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
              const newSrcDocId = await cvxUtils.performAction_createNewSrcDoc({
                projectId: currProject?._id,
                cvxStoredFileId,
              });
              return resolve(newSrcDocId);
            } catch (err) {
              return reject(err);
            }
          });
        })
    );

    const srcDocIds = (await Promise.allSettled(ps))
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value);
  };

  // PRJFILE

  const curProjectPrjFiles = useQuery(
    api.dbOps.getAllPrjFiles_ForProject,
    projectId ? { projectId: projectId as Id<"vsProjects"> } : "skip"
  );

  const onClick_uploadFiles_PrjFiles = async (droppedFiles: any) => {
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
              const newPrjFileId = await cvxUtils.performAction_createNewPrjFile(
                {
                  projectId: currProject?._id,
                  applicationId: "" as Id<"vsApplications">,
                  cvxStoredFileId,
                }
              );
              return resolve(newPrjFileId);
            } catch (err) {
              return reject(err);
            }
          });
        })
    );

    const newPrjFileIds = (await Promise.allSettled(ps))
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value);
  };

  // GSHEETS

  const performAction_test_readSheet = useAction(api.vsActions.test_readSheet);

  const onClick_performAction_test_readSheet = async () => {
    console.log("foo");
    const d = await performAction_test_readSheet({
      // grv_data: "BeSure data for Novartis Events"
      sheetId: "1jQyuFl1DVx6W0Gqnpc7Ux5rXONoW-FtV1QhtOYUpT7A",
      sheetRange: "Sheet1!A1:D10",
    });
    console.log(d);
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
            onClick={onClick_performAction_test_readSheet}
            size="lg"
          >
            G Sheets Test
          </Button>
        </Flex>
      </Authenticated>
    </Flex>
  );
}
