import { useState } from "react";
import {
  Button,
  Card,
  Divider,
  Flex,
  Loader,
  Text,
  Textarea,
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

import { base64StringToBlob } from "../utils";

import FileUploader from "../components/FileUploader";

export default function Dev() {
  const cvxUtils = useCvxUtils();

  const [text, setText] = useState("");

  const handleDownloadBtnClick = async () => {
    const filename = "test.jpg";
    const blob = base64StringToBlob(text, filename);

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob!);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [srcVal, setSrcVal] = useState("");

  const handleViewBtnClick = () => {
    setSrcVal(text.startsWith('data:') ? text : `data:image/jpeg;base64,${text}`);
  };

  const handleCreateHttpsBtnClick = () => {
    const url = window.location.origin + "/api/maps/create";
    // const url = "https://choroplots-convex.vercel.app/api/maps/create";

    console.log(url);

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });
  };

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
                projectId: "j57bja5nce81qbf9jeyv7pej097bxnfb",
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

    console.log(storedFileIds);
  };

  const handleDebugBtnClick = async () => {
    console.log("debug ------------------------ START");
    const res = await cvxUtils.performAction_debugAction();
    console.log(res);
    console.log("debug ------------------------ END");
  };

  const handleStableDiffusionBtnClick = async () => {
    const res = await cvxUtils.performAction_stableDiffusionAction();
    console.log(res);
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
            variant="light"
            w="100%"
            onClick={handleDebugBtnClick}
            size="lg"
          >
            Debug
          </Button>

          <Divider w="100%" />

          <Flex
            w="100%"
            h="20rem"
            direction="column"
            align="stretch"
            gap="sm"
          >
            <FileUploader
              projectId={"j57bja5nce81qbf9jeyv7pej097bxnfb"}
              onClick_uploadFiles={onClick_uploadFiles_StoredFile}
              allowMultiple={false}
            />
          </Flex>

          <Divider w="100%" />

          <Textarea
            rows={7}
            value={text}
            onChange={(event) => setText(event.currentTarget.value)}
            placeholder="Type something..."
          />

          {
            srcVal
              ?
              (
                <Card withBorder p="md">
                  <img
                    src={srcVal}
                    alt="Base64 Preview"
                    style={{ maxWidth: '100%', height: 'auto' }}
                    onError={(e) => {
                      // Hide the image if the base64 is invalid
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </Card>
              )
              :
              (
                <Text w="100%" ta="center">No image to display</Text>
              )
          }

          <Divider w="100%" />

          <Button
            w="100%"
            onClick={handleViewBtnClick}
            size="lg"
          >
            View
          </Button>

          <Button
            w="100%"
            onClick={handleDownloadBtnClick}
            size="lg"
          >
            Download
          </Button>

          <Button
            variant="outline"
            w="100%"
            mt="md"
            onClick={() => { setSrcVal(""); }}
            size="lg"
          >
            Clear
          </Button>

          <Divider w="100%" />

          <Button
            w="100%"
            onClick={handleCreateHttpsBtnClick}
            size="lg"
          >
            Create HTTPS
          </Button>

          <Divider w="100%" />

          <Button
            w="100%"
            onClick={handleStableDiffusionBtnClick}
            size="lg"
          >
            Stable Diffusion
          </Button>

          <Divider w="100%" />
        </Flex>
      </Authenticated>
    </Flex>
  );
}
