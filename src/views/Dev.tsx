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

export function downloadBase64Response(text: string, filename: string) {
  // const base64String = Buffer.from(text).toString('base64');
  const byteCharacters = atob(text);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray]);
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default function Dev() {
  const cvxUtils = useCvxUtils();

  const [text, setText] = useState("");

  const handleTestButtonClick = async () => {
    downloadBase64Response(text, "data.jpg");
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
