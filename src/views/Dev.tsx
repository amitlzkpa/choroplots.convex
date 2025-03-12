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

export function downloadBase64Response(response: Response, filename: string) {
  response.text().then((text) => {
    const base64String = Buffer.from(text).toString('base64');
    const byteCharacters = atob(base64String);
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
  }).catch(console.error);
};

export default function Dev() {
  const cvxUtils = useCvxUtils();

  // PROJECT

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

          <Textarea />

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
