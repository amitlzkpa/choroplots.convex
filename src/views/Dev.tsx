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

  const handleCreateBtnClick = async () => {
    const mapId = await cvxUtils.performAction_mapCreate({ text });
    console.log(mapId);
  };

  const handleCreateHttpsBtnClick = () => {
    let url = window.location.origin + "/api/maps/create";
    // url = "https://choroplots-convex.vercel.app/api/maps/create";

    console.log(url);

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });
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

          <Button
            w="100%"
            onClick={handleCreateBtnClick}
            size="lg"
          >
            Create
          </Button>
          
          <Button
            w="100%"
            onClick={handleCreateHttpsBtnClick}
            size="lg"
          >
            Create HTTPS
          </Button>
        </Flex>
      </Authenticated>
    </Flex>
  );
}
