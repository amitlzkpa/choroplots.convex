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

import ProjectInit_Uninit from "../components/ProjectInit_Uninit";
import ProjectInit_AgreementsUploaded from "../components/ProjectInit_AgreementsUploaded";
import ProjectInit_AgreementsReviewed from "../components/ProjectInit_AgreementsReviewed";
import ProjectInit_SignersAssigned from "../components/ProjectInit_SignersAssigned";
import ProjectInit_TaggingCompleted from "../components/ProjectInit_TaggingCompleted";
import ProjectInit_AgreementSent from "../components/ProjectInit_AgreementSent";

import useCvxUtils from "../hooks/cvxUtils";
import GuideInfo from "../components/GuideInfo";

export default function Project() {
  const cvxUtils = useCvxUtils();

  // PROJECT

  const { projectId } = useParams();

  const currProject = useQuery(
    api.dbOps.getProject_ByProjectId,
    projectId ? { projectId: projectId as Id<"vsProjects"> } : "skip"
  );

  // Stepper

  const tabVals = useMemo(
    () => [
      "uninitialized",
      "agreements_uploaded",
      "agreements_reviewed",
      "signers_assigned",
      "tagging_completed",
      "agreement_sent",
    ],
    []
  );
  const [active, setActive] = useState(0);
  const [activeTabVal, setActiveTabVal] = useState("");

  const [highestStepVisited, setHighestStepVisited] = useState(active);

  const handleStepChange = (nextStep: any) => {
    const isOutOfBounds = nextStep > tabVals.length || nextStep < 0;
    if (isOutOfBounds) {
      return;
    }
    setActive(nextStep);
    setHighestStepVisited((hSC) => Math.max(hSC, nextStep));
  };

  useEffect(() => {
    if (!currProject?.initializationStatus) return;
    const activeIdx = tabVals.indexOf(currProject?.initializationStatus);
    setActive(activeIdx);
    setHighestStepVisited(currProject?.initializationStatus);
  }, [currProject, tabVals]);

  const shouldAllowSelectStep = (step: any) =>
    (highestStepVisited >= step && active !== step) || true;

  useEffect(() => {
    setActiveTabVal(tabVals[active]);
  }, [active, tabVals]);

  return (
    <Flex w="100%" direction="column" align="center" gap="sm" p="lg">
      <Flex w="100%" mb="xl" gap="md" pb="xl">
        {/* Step selector */}
        <Flex w="30%" direction="column" align="stretch">
          <Stepper
            active={active}
            onStepClick={handleStepChange}
            orientation="vertical"
          >
            <Stepper.Step
              label="First step"
              description="Upload your papers"
              allowStepSelect={shouldAllowSelectStep(0)}
            >
              <GuideInfo
                msgHead="Time to get the ball rolling!"
                msgDesc="Upload your agreement and let's get things moving."
              />
            </Stepper.Step>
            <Stepper.Step
              label="Second step"
              description="Review them"
              allowStepSelect={shouldAllowSelectStep(1)}
            >
              <GuideInfo
                msgHead="Review and Confirm"
                msgDesc="Confirm that the uploaded document and information are correct."
              />
            </Stepper.Step>
            <Stepper.Step
              label="Third step"
              description="Invite applicants"
              allowStepSelect={shouldAllowSelectStep(2)}
            >
              <GuideInfo
                msgHead="Time to bring others on board!"
                msgDesc="Distribute the offer and invite them to apply."
              />
            </Stepper.Step>
            <Stepper.Step
              label="Fourth step"
              description="Add tags"
              allowStepSelect={shouldAllowSelectStep(3)}
            >
              <GuideInfo
                msgHead="Guide your signers."
                msgDesc="Mark the fields where they need to provide details and sign."
              />
            </Stepper.Step>
            <Stepper.Step
              label="Fourth step"
              description="Finalize"
              allowStepSelect={shouldAllowSelectStep(4)}
            >
              <GuideInfo
                msgHead="Ready to send?"
                msgDesc="Customize the message before sending it out for signatures."
              />
            </Stepper.Step>
            <Stepper.Step
              label="Done"
              allowStepSelect={shouldAllowSelectStep(5)}
            >
              <GuideInfo
                msgHead="Success!"
                msgDesc="The signature request is sent—real-time updates will keep you in the loop."
              />
            </Stepper.Step>
          </Stepper>
        </Flex>

        {/* Step content */}
        <Flex w="80%" direction="column" align="stretch">
          <Flex direction="column" align="stretch" w="100%">
            <Tabs value={activeTabVal}>
              <Tabs.Panel value="uninitialized">
                <Flex
                  direction="column"
                  justify="center"
                  align="center"
                  w="100%"
                  h="100%"
                >
                  {activeTabVal === "uninitialized" ? (
                    <ProjectInit_Uninit projectId={currProject?._id} />
                  ) : (
                    <></>
                  )}
                </Flex>
              </Tabs.Panel>

              <Tabs.Panel value="agreements_uploaded">
                <Flex
                  direction="column"
                  justify="center"
                  align="center"
                  w="100%"
                  h="100%"
                >
                  {activeTabVal === "agreements_uploaded" ? (
                    <ProjectInit_AgreementsUploaded
                      projectId={currProject?._id}
                    />
                  ) : (
                    <></>
                  )}
                </Flex>
              </Tabs.Panel>

              <Tabs.Panel value="agreements_reviewed">
                <Flex
                  direction="column"
                  justify="center"
                  align="center"
                  w="100%"
                  h="100%"
                >
                  {activeTabVal === "agreements_reviewed" ? (
                    <ProjectInit_AgreementsReviewed
                      projectId={currProject?._id}
                    />
                  ) : (
                    <></>
                  )}
                </Flex>
              </Tabs.Panel>

              <Tabs.Panel value="signers_assigned">
                <Flex
                  direction="column"
                  justify="center"
                  align="center"
                  w="100%"
                  h="100%"
                >
                  {activeTabVal === "signers_assigned" ? (
                    <ProjectInit_SignersAssigned projectId={currProject?._id} />
                  ) : (
                    <></>
                  )}
                </Flex>
              </Tabs.Panel>

              <Tabs.Panel value="tagging_completed">
                <Flex
                  direction="column"
                  justify="center"
                  align="center"
                  w="100%"
                  h="100%"
                >
                  {activeTabVal === "tagging_completed" ? (
                    <ProjectInit_TaggingCompleted
                      projectId={currProject?._id}
                    />
                  ) : (
                    <></>
                  )}
                </Flex>
              </Tabs.Panel>

              <Tabs.Panel value="agreement_sent">
                <Flex
                  direction="column"
                  justify="center"
                  align="center"
                  w="100%"
                  h="100%"
                >
                  {activeTabVal === "agreement_sent" ? (
                    <ProjectInit_AgreementSent projectId={currProject?._id} />
                  ) : (
                    <></>
                  )}
                </Flex>
              </Tabs.Panel>
            </Tabs>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
