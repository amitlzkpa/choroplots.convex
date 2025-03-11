import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button, Flex, Text } from "@mantine/core";

export default function CompletedSigningAnnotation_Docusign() {
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const envelopeId = queryParams.get("envelopeId");

    window.parent.postMessage(envelopeId, window.location.origin);
  }, [location]);

  return (
    <Flex w="100%" direction="column" align="center" gap="sm">
      <Flex w="60%" direction="column" align="center" gap="md" p="lg">
        <Text>Nice work! The file is ready.</Text>
      </Flex>
    </Flex>
  );
}
