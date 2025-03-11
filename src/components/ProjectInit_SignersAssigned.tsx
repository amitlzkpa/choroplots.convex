import { useEffect, useRef, useState } from "react";
import {
  Accordion,
  Button,
  Card,
  Center,
  Divider,
  Flex,
  Input,
  Loader,
  Text,
  rem,
} from "@mantine/core";

import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

import useCvxUtils from "../hooks/cvxUtils";

export default function ProjectInit_SignersAssigned({ projectId = null }: any) {
  const cvxUtils = useCvxUtils();

  const [docusignSenderConfigUrl, setDocusignSenderConfigUrl] = useState("");

  useEffect(() => {
    (async () => {
      if (docusignSenderConfigUrl) return;

      const envelopeData = await cvxUtils.performAction_createSenderViewFromDoc(
        {
          projectId,
          returnUrl: `${window.location.origin}/completed-signing-annotation?disableNavbar=true`,
        }
      );

      setDocusignSenderConfigUrl(envelopeData.taggingUrl ?? "");

      const updateData = JSON.stringify({
        envelopeId: envelopeData.envelopeId,
      });

      await cvxUtils.performAction_updateProject({ projectId, updateData });
    })();
  }, [projectId, docusignSenderConfigUrl, cvxUtils]);

  useEffect(() => {
    if (!docusignSenderConfigUrl) return;

    const taggingIframe = document.getElementById("tagging-iframe-target");
    taggingIframe!.setAttribute("src", docusignSenderConfigUrl!);
    taggingIframe!.style.visibility = "visible";
  }, [docusignSenderConfigUrl]);

  useEffect(() => {
    const msgListener = async (e: MessageEvent) => {
      const taggingIframe = document.getElementById("tagging-iframe-target");
      taggingIframe!.setAttribute("src", "");
      taggingIframe!.style.visibility = "hidden";

      const updateData = JSON.stringify({
        initializationStatus: "tagging_completed",
      });
      await cvxUtils.performAction_updateProject({ projectId, updateData });
    };

    window.addEventListener("message", msgListener);

    return () => {
      window.removeEventListener("message", msgListener);
    };
  }, [projectId, cvxUtils]);

  return (
    <>
      <Flex
        w="100%"
        h="100%"
        direction="column"
        align="center"
        gap="sm"
        py="lg"
      >
        <Text fz="lg" fw="bold">
          Add Signing Tags
        </Text>

        {!docusignSenderConfigUrl ? (
          <Flex
            w="100%"
            h="100%"
            mih="240"
            direction="column"
            align="center"
            justify="center"
            gap="sm"
            py="lg"
          >
            <Loader size="lg" type="oval" />
          </Flex>
        ) : (
          <iframe
            style={{
              width: "100%",
              minHeight: rem(800),
              height: "100%",
              visibility: "hidden",
              border: 0,
              borderRadius: rem(20),
              resize: "vertical",
            }}
            src=""
            id="tagging-iframe-target"
          />
        )}
      </Flex>
    </>
  );
}
