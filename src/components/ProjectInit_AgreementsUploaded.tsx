import { useEffect, useState } from "react";
import {
  Accordion,
  Button,
  Card,
  Center,
  Divider,
  Flex,
  TextInput,
  Loader,
  Skeleton,
  Text,
  Textarea,
  MultiSelect,
  rem,
} from "@mantine/core";

import { FaMinusCircle, FaTrash } from "react-icons/fa";

import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

import { documentTypes } from "../../common/documentTypes";

import Summary_SrcDoc from "../components/Summary_SrcDoc";

import useCvxUtils from "../hooks/cvxUtils";

export default function ProjectInit_AgreementsUploaded({
  projectId = null,
}: any) {
  const cvxUtils = useCvxUtils();

  const onClick_analyseDoc = async (srcDocId: any) => {
    await cvxUtils.performAction_analyseSrcDoc({
      srcDocId: srcDocId,
    });
  };

  // SRCDOC

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

  const removeOfferItem = (offerIdx: number) => {
    offeringsJSON.splice(offerIdx, 1);
    setOfferingsJSON([...offeringsJSON]);
  };

  const [criteriaJSON, setCriteriaJSON] = useState([]);

  useEffect(() => {
    if ((curProjectSrcDocs ?? []).length < 1) return;
    const docOne: any = (curProjectSrcDocs ?? [])[0];
    if (!docOne?.criteria_Text) return;
    const crit = JSON.parse(docOne.criteria_Text);
    const critJ = crit.map((c: any) => ({
      ...c,
      valid_docs: [],
    }));
    setCriteriaJSON(critJ);
  }, [curProjectSrcDocs]);

  const removeCriteriaItem = (criteriaIdx: number) => {
    criteriaJSON.splice(criteriaIdx, 1);
    setCriteriaJSON([...criteriaJSON]);
  };

  const onClick_confirmAgreementReview = async () => {
    if ((curProjectSrcDocs ?? []).length < 1) return;
    const docOne: any = (curProjectSrcDocs ?? [])[0];
    const offeringsText = JSON.stringify(offeringsJSON);
    const criteriaText = JSON.stringify(criteriaJSON);
    const updateData_srcdoc = JSON.stringify({
      ...docOne,
      offerings_Text: offeringsText,
      criteria_Text: criteriaText,
    });

    await cvxUtils.performAction_updateSrcDoc({
      srcDocId: docOne._id,
      updateDataStr: updateData_srcdoc,
    });
    const updateData_project = JSON.stringify({
      initializationStatus: "agreements_reviewed",
    });
    await cvxUtils.performAction_updateProject({
      projectId,
      updateData: updateData_project,
    });
    cvxUtils.performAction_setupCheckingConditions({
      projectId,
    });
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
      >
        <Text fz="lg" fw="bold">
          Documents
        </Text>

        {(curProjectSrcDocs ?? []).length > 0 ? (
          <Flex w="100%" h="100%" gap="md">
            <Flex
              w="50%"
              h="100%"
              mih="800"
              direction="column"
              align="center"
              gap="sm"
              style={{ overflowY: "auto" }}
            >
              {srcDoc.fileUrl ? (
                <embed
                  style={{
                    width: "100%",
                    height: "100%",
                    minHeight: rem(400),
                    borderRadius: rem(20),
                  }}
                  src={srcDoc.fileUrl}
                />
              ) : (
                <></>
              )}

              <Button
                component="a"
                variant="transparent"
                href={srcDoc.fileUrl}
                target="_blank"
                w="100%"
                size="sm"
              >
                Open
              </Button>


              <Button
                variant="transparent"
                w="100%"
                size="sm"
                onClick={() => onClick_analyseDoc(srcDoc._id)}
              >
                Analyse
              </Button>

            </Flex>
            <Flex w="50%" h="100%" direction="column" align="stretch" gap="xs">

              <Button
                variant="transparent"
                size="sm"
                onClick={() => {
                  cvxUtils.performAction_setupCheckingConditions({
                    projectId,
                  });
                }}
              >
                Prepare
              </Button>


              <Button
                w="100%"
                size="lg"
                onClick={onClick_confirmAgreementReview}
              >
                Confirm
              </Button>

              <Divider my="sm" />

              {srcDoc.titleStatus === "generating" ? (
                <Skeleton height={24} width="100%" radius="xl" />
              ) : (
                <TextInput
                  variant="unstyled"
                  w="100%"
                  size="lg"
                  fw="bold"
                  defaultValue={srcDoc.titleText}
                  onChange={(e) => {
                    srcDoc.titleText = e.target.value;
                  }}
                />
              )}

              {srcDoc.summaryText === "generating" ? (
                <Skeleton height={160} width="100%" radius="xl" />
              ) : (
                <Textarea
                  variant="unstyled"
                  size="md"
                  w="100%"
                  rows={6}
                  resize="vertical"
                  defaultValue={srcDoc.summaryText}
                  onChange={(e) => {
                    srcDoc.summaryText = e.target.value;
                  }}
                />
              )}

              <Accordion w="100%">
                <Accordion.Item key="first" value="first">
                  <Accordion.Control>
                    <Text>Scheme</Text>
                  </Accordion.Control>
                  <Accordion.Panel>
                    {offeringsJSON ? (
                      <Flex
                        w="100%"
                        direction="column"
                        align="stretch"
                        gap="md"
                      >
                        {offeringsJSON.map(
                          (offerItem: any, offerIdx: number) => {
                            return (
                              <Flex
                                w="100%"
                                direction="column"
                                align="center"
                                gap="xs"
                                key={offerIdx}
                              >
                                <Flex w="100%" align="center" gap="sm">
                                  <TextInput
                                    w="100%"
                                    size="md"
                                    fw="bold"
                                    defaultValue={offerItem.title}
                                    onChange={(e) => {
                                      offerItem.title = e.target.value;
                                    }}
                                  />
                                  <FaMinusCircle
                                    style={{
                                      pointerEvents: "all",
                                      width: rem(18),
                                      height: rem(18),
                                      color: "var(--mantine-color-gray-5)",
                                      cursor: "pointer",
                                    }}
                                    onClick={() => {
                                      removeOfferItem(offerIdx);
                                    }}
                                  />
                                </Flex>
                                <Flex gap="sm">
                                  <TextInput
                                    w="60%"
                                    size="sm"
                                    fw="bold"
                                    defaultValue={offerItem.quantity}
                                    onChange={(e) => {
                                      offerItem.quantity = e.target.value;
                                    }}
                                  />
                                  <TextInput
                                    w="40%"
                                    size="sm"
                                    fw="bold"
                                    defaultValue={offerItem.units}
                                    onChange={(e) => {
                                      offerItem.units = e.target.value;
                                    }}
                                  />
                                </Flex>
                                <Textarea
                                  variant="filled"
                                  w="100%"
                                  rows={4}
                                  resize="vertical"
                                  defaultValue={offerItem.description}
                                  onChange={(e) => {
                                    offerItem.description = e.target.value;
                                  }}
                                />
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

                <Accordion.Item key="second" value="second">
                  <Accordion.Control>
                    <Text>Eligibility</Text>
                  </Accordion.Control>
                  <Accordion.Panel>
                    {criteriaJSON ? (
                      <Flex
                        w="100%"
                        direction="column"
                        align="stretch"
                        gap="md"
                      >
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
                                  <TextInput
                                    w="100%"
                                    size="md"
                                    fw="bold"
                                    defaultValue={criteriaItem.title}
                                    onChange={(e) => {
                                      criteriaItem.title = e.target.value;
                                    }}
                                  />
                                  <FaMinusCircle
                                    style={{
                                      pointerEvents: "all",
                                      width: rem(18),
                                      height: rem(18),
                                      color: "var(--mantine-color-gray-5)",
                                      cursor: "pointer",
                                    }}
                                    onClick={() => {
                                      removeCriteriaItem(criteriaIdx);
                                    }}
                                  />
                                </Flex>
                                <Flex w="100%" gap="sm" px="sm">
                                  <Text fz="md">Valid Docs:</Text>
                                  <MultiSelect
                                    style={{ flexGrow: 1 }}
                                    size="sm"
                                    searchable
                                    checkIconPosition="left"
                                    maxDropdownHeight={200}
                                    placeholder="Select documents"
                                    defaultValue={criteriaItem.valid_docs}
                                    onChange={(v) => {
                                      criteriaItem.valid_docs = v;
                                    }}
                                    data={documentTypes}
                                  />
                                </Flex>
                                <Textarea
                                  variant="filled"
                                  w="100%"
                                  rows={4}
                                  resize="vertical"
                                  defaultValue={criteriaItem.description}
                                  onChange={(e) => {
                                    criteriaItem.description = e.target.value;
                                  }}
                                />
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
        ) : (
          <Flex
            w="100%"
            h="100%"
            mih="200"
            direction="column"
            justify="center"
            align="center"
            gap="sm"
          >
            <Loader type="oval" size="xl" />
          </Flex>
        )}
      </Flex>
    </>
  );
}
