import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ActionIcon,
  Accordion,
  Button,
  Divider,
  Flex,
  Text,
  Loader,
  Pill,
  rem,
} from "@mantine/core";

import {
  useAction,
  useQuery,
  Authenticated,
  Unauthenticated,
  AuthLoading,
} from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

import { FaRobot, FaAngleRight } from "react-icons/fa";

import useCvxUtils from "../hooks/cvxUtils";

export default function Preview() {
  const navigate = useNavigate();
  const cvxUtils = useCvxUtils();

  // PROJECT

  const { projectId } = useParams();

  const currProject = useQuery(
    api.dbOps.getProject_ByProjectId,
    projectId ? { projectId: projectId as Id<"vsProjects"> } : "skip"
  );

  const curProjectSrcDocs = useQuery(
    api.dbOps.getAllSrcDocs_ForProject,
    projectId ? { projectId: projectId as Id<"vsProjects"> } : "skip"
  );

  const [srcDoc, setSrcDoc] = useState<any>({});

  useEffect(() => {
    if ((curProjectSrcDocs ?? []).length < 1) return;
    const docOne: any = (curProjectSrcDocs ?? [])[0];
    setSrcDoc(docOne);
  }, [curProjectSrcDocs]);

  const [offeringsJSON, setOfferingsJSON] = useState([]);

  useEffect(() => {
    if ((curProjectSrcDocs ?? []).length < 1) return;
    const docOne: any = (curProjectSrcDocs ?? [])[0];
    if (!docOne?.offerings_Text) return;
    setOfferingsJSON(JSON.parse(docOne.offerings_Text));
  }, [curProjectSrcDocs]);

  const [criteriaJSON, setCriteriaJSON] = useState([]);

  useEffect(() => {
    if ((curProjectSrcDocs ?? []).length < 1) return;
    const docOne: any = (curProjectSrcDocs ?? [])[0];
    if (!docOne?.criteria_Text) return;
    setCriteriaJSON(JSON.parse(docOne.criteria_Text));
  }, [curProjectSrcDocs]);

  // USER APPLICATION

  const existingApplication: any = useQuery(
    api.dbOps.getApplication_ByProjectId_ForCurrUser,
    {
      projectId: currProject?._id ? currProject._id : "skip",
    }
  );

  // CLICK

  const onClick_startNewApplication = async () => {
    const newApplicationId = await cvxUtils.performAction_createNewApplication({
      projectId: projectId as Id<"vsProjects">,
    });
    navigate(`/apply/${newApplicationId}`);
  };

  return (
    <Flex w="100%" gap="sm">
      <Flex w="40%" direction="column" align="stretch" gap="sm">
        <Text fz="xl" fw="bold">
          Preview Application
        </Text>

        <Divider />

        <Text>{srcDoc.summaryText}</Text>

        <Flex
          w="100%"
          h="100%"
          direction="column"
          align="stretch"
          style={{ overflowY: "auto" }}
        >
          <Accordion w="100%">
            <Accordion.Item key="first" value="first">
              <Accordion.Control>
                <Text>Scheme</Text>
              </Accordion.Control>
              <Accordion.Panel>
                {offeringsJSON ? (
                  <Flex w="100%" direction="column" align="stretch" gap="md">
                    {offeringsJSON.map((offerItem: any, offerIdx: number) => {
                      return (
                        <Flex
                          w="100%"
                          direction="column"
                          align="center"
                          key={offerIdx}
                        >
                          <Flex w="100%" align="center" gap="sm">
                            <Text fz="md" fw="bold" style={{ flexGrow: 1 }}>
                              {offerItem.title}
                            </Text>
                            <Pill size="sm">
                              {offerItem.quantity} {offerItem.units}
                            </Pill>
                          </Flex>
                          <Text fz="sm">{offerItem.description}</Text>
                        </Flex>
                      );
                    })}
                  </Flex>
                ) : (
                  <></>
                )}
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item key="second" value="second">
              <Accordion.Control>
                <Text>Eligibility</Text>
              </Accordion.Control>
              <Accordion.Panel>
                {criteriaJSON ? (
                  <Flex w="100%" direction="column" align="stretch" gap="md">
                    {criteriaJSON.map(
                      (criteriaItem: any, criteriaIdx: number) => {
                        return (
                          <Flex
                            w="100%"
                            direction="column"
                            align="stretch"
                            gap="xs"
                            key={criteriaIdx}
                          >
                            <Flex w="100%" align="center" gap="sm">
                              <Text fz="md" fw="bold" style={{ flexGrow: 1 }}>
                                {criteriaItem.title}
                              </Text>
                            </Flex>
                            <Text fz="sm">{criteriaItem.description}</Text>
                          </Flex>
                        );
                      }
                    )}
                  </Flex>
                ) : (
                  <></>
                )}
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Flex>
      </Flex>

      <Flex
        w="40%"
        h="100%"
        direction="column"
        align="stretch"
        gap="md"
        style={{ overflowY: "auto" }}
      >
        <Text fw="bold" style={{ textAlign: "center" }}>
          {srcDoc?.titleText}
        </Text>
        <Flex
          w="100%"
          h="100%"
          direction="column"
          align="stretch"
          style={{ flexGrow: 1 }}
        >
          {srcDoc?.fileUrl ? (
            <embed
              style={{
                width: "100%",
                height: "100%",
                minHeight: "60vh",
                borderRadius: rem(20),
              }}
              src={srcDoc?.fileUrl}
            />
          ) : (
            <></>
          )}
        </Flex>
      </Flex>

      <Flex w="20%" direction="column" align="stretch" gap="md">
        <AuthLoading>
          <Flex w="100%" h="100%" justify="center" align="center" p="lg">
            <Loader size="md" type="dots" />
          </Flex>
        </AuthLoading>

        <Unauthenticated>
          <Flex w="100%" h="100%" justify="center" align="center" p="lg">
            <Text style={{ textAlign: "center" }}>
              Please log in to start your application
            </Text>
          </Flex>
        </Unauthenticated>

        <Authenticated>
          {existingApplication?._id ? (
            <Flex
              w="100%"
              h="100%"
              direction="column"
              justify="center"
              align="center"
              gap="xl"
              px="lg"
              style={{ textAlign: "center" }}
            >
              <Flex w="100%" direction="column" align="stretch" gap="sm">
                <Text fz="lg" lh="1.2">
                  Continue your application
                </Text>
              </Flex>
              <ActionIcon
                variant="filled"
                size="input-xl"
                aria-label="Start Application Button"
                component="a"
                href={`/apply/${existingApplication?._id}`}
              >
                <FaAngleRight
                  style={{
                    width: rem(38),
                    height: rem(38),
                  }}
                />
              </ActionIcon>
            </Flex>
          ) : (
            <Flex
              w="100%"
              h="100%"
              direction="column"
              justify="center"
              align="center"
              gap="xl"
              px="lg"
              style={{ textAlign: "center" }}
            >
              <FaRobot
                style={{
                  width: rem(24),
                  height: rem(24),
                  color: "var(--mantine-color-gray-5)",
                }}
              />
              <Flex w="100%" direction="column" align="stretch" gap="sm">
                <Text lh="1">
                  Our AI guide is here to make it simple and stress-free.
                </Text>
                <Text fz="lg" lh="1.2">
                  Let's begin your application
                </Text>
              </Flex>
              <ActionIcon
                variant="filled"
                size="input-xl"
                aria-label="Start Application Button"
                onClick={onClick_startNewApplication}
              >
                <FaAngleRight
                  style={{
                    width: rem(38),
                    height: rem(38),
                  }}
                />
              </ActionIcon>
            </Flex>
          )}
        </Authenticated>
      </Flex>
    </Flex>
  );
}
