import { useEffect, useRef, useState } from "react";
import {
  Accordion,
  Button,
  Card,
  Center,
  Divider,
  Flex,
  Input,
  Text,
  Textarea,
  rem,
} from "@mantine/core";

import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

import useCvxUtils from "../hooks/cvxUtils";

export default function ProjectInit_TaggingCompleted({
  projectId = null,
}: any) {
  const cvxUtils = useCvxUtils();

  const [emailSubject, setEmailSubject] = useState(
    "Quick! Review & Sign the Attached Agreement."
  );
  const [emailBlurb, setEmailBlurb] = useState(
    "The document is all set and waiting for your signature. Take a moment to review and sign—it’s quick and will help us keep things moving smoothly!"
  );

  const onClick_sendDocument = async () => {
    const envelopeSummary = await cvxUtils.performAction_sendDocusignEnvelope({
      projectId,
      emailSubject,
      emailBlurb,
    });

    const updateData = JSON.stringify({
      initializationStatus: "agreement_sent",
    });
    await cvxUtils.performAction_updateProject({ projectId, updateData });
  };

  return (
    <>
      <Flex
        w="100%"
        h="100%"
        direction="column"
        align="center"
        gap="sm"
        py="lg"
        style={{ textAlign: "center" }}
      >
        <Text fz="lg" fw="bold">
          Send Agreement for Signing
        </Text>

        <Input
          w="100%"
          onChange={(e) => setEmailSubject(e.target.value)}
          value={emailSubject}
          placeholder="Add Email Subject"
        />

        <Textarea
          w="100%"
          rows={8}
          resize="vertical"
          onChange={(e) => setEmailBlurb(e.target.value)}
          value={emailBlurb}
        />

        <Button
          w="100%"
          size="lg"
          onClick={onClick_sendDocument}
          disabled={!emailSubject}
        >
          Send
        </Button>
      </Flex>
    </>
  );
}
