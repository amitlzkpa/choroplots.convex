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

  const handleTestButtonClick = async () => {
    const filename = "test.jpg";
    const blob = base64StringToBlob(text, filename);

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob!);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            value={text}
            onChange={(event) => setText(event.currentTarget.value)}
            placeholder="Type something..."
          />

          <Button
            w="100%"
            onClick={handleTestButtonClick}
            size="lg"
          >
            Test
          </Button>
        </Flex>
      </Authenticated>
    </Flex>
  );
}
