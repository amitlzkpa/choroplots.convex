import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Accordion,
  Button,
  Card,
  Paper,
  Drawer,
  Divider,
  Flex,
  Text,
  Pill,
  Modal,
  ScrollArea,
  SimpleGrid,
  Table,
  TextInput,
  HoverCard,
  Textarea,
  Loader,
  rem,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

import markdownit from "markdown-it";

import {
  FaExclamationCircle,
  FaRedo,
  FaTrashAlt,
  FaCheckCircle,
  FaRegWindowClose,
  FaClipboardCheck,
} from "react-icons/fa";

import FileUploader from "../components/FileUploader";
import MessageCard from "../components/MessageCard";

import useCvxUtils from "../hooks/cvxUtils";

const md = markdownit();

export default function Preview() {
  const storedUserData = useQuery(api.dbOps.getUserData_ForCurrUser);
  const cvxUtils = useCvxUtils();

  // APPLICATION

  const { applicationId } = useParams();

  const currApplication = useQuery(
    api.dbOps.getApplication_ByApplicationId,
    applicationId
      ? { applicationId: applicationId as Id<"vsApplications"> }
      : "skip"
  );

  const [eligibilityCheckResultJSON, setEligibilityCheckResultJSON] =
    useState<any>([]);

  useEffect(() => {
    const ecrJSON = JSON.parse(currApplication?.eligibilityCheckResult ?? "[]");
    setEligibilityCheckResultJSON(ecrJSON);
  }, [currApplication]);

  const [canApply, setCanApply] = useState(false);

  useEffect(() => {
    if (currApplication?.initializationStatus === "complete") {
      setCanApply(false);
      return;
    }
    const allChecks = eligibilityCheckResultJSON.every(
      (e: any) => e.isEligible
    );
    setCanApply(allChecks);
    // setCanApply(true);
  }, [eligibilityCheckResultJSON, currApplication]);

  // APPLY MODAL

  const confirmApplicationModalCtr = useDisclosure(false);

  const onClick_openConfirmApplicationModal = async () => {
    confirmApplicationModalCtr[1].open();
  };

  const onClick_submitApplication = async () => {
    cvxUtils.performAction_updateApplication({
      applicationId: currApplication._id,
      updateDataStr: JSON.stringify({ initializationStatus: "complete" }),
    });
    confirmApplicationModalCtr[1].close();
  };

  // PROJECT

  const currProject = useQuery(
    api.dbOps.getProject_ByProjectId,
    currApplication ? { projectId: currApplication.projectId } : "skip"
  );

  // SRCDOCS

  const curProjectSrcDocs = useQuery(
    api.dbOps.getAllSrcDocs_ForProject,
    currApplication ? { projectId: currApplication.projectId } : "skip"
  );

  const [srcDoc, setSrcDoc] = useState<any>({});

  useEffect(() => {
    if ((curProjectSrcDocs ?? []).length < 1) return;
    const docOne: any = (curProjectSrcDocs ?? [])[0];
    setSrcDoc(docOne);
  }, [curProjectSrcDocs]);

  const [offeringsJSON, setOfferingsJSON] = useState<any>([]);

  useEffect(() => {
    if ((curProjectSrcDocs ?? []).length < 1) return;
    const docOne: any = (curProjectSrcDocs ?? [])[0];
    if (!docOne?.offerings_Text) return;
    setOfferingsJSON(JSON.parse(docOne.offerings_Text));
  }, [curProjectSrcDocs]);

  const [criteriaJSON, setCriteriaJSON] = useState<any>([]);

  useEffect(() => {
    if ((curProjectSrcDocs ?? []).length < 1) return;
    const docOne: any = (curProjectSrcDocs ?? [])[0];
    if (!docOne?.criteria_Text) return;
    setCriteriaJSON(JSON.parse(docOne.criteria_Text));
  }, [curProjectSrcDocs]);

  // PRJFILES

  const currApplicationPrjFiles = useQuery(
    api.dbOps.getAllPrjFiles_ForApplication,
    currApplication ? { applicationId: currApplication._id } : "skip"
  );

  const onClick_uploadFiles_PrjFiles = async (droppedFiles: any) => {
    const ps = droppedFiles.map(
      (file: any) =>
        new Promise((resolve, reject) => {
          cvxUtils.performAction_generateUploadUrl().then(async (uploadUrl) => {
            try {
              const result = await fetch(uploadUrl, {
                method: "POST",
                body: file,
              });
              const uploadedCvxFile = await result.json();
              const cvxStoredFileId = uploadedCvxFile.storageId;
              const newPrjFileId =
                await cvxUtils.performAction_createNewPrjFile({
                  projectId: currProject?._id,
                  applicationId: currApplication?._id,
                  cvxStoredFileId,
                });
              return resolve(newPrjFileId);
            } catch (err) {
              return reject(err);
            }
          });
        })
    );

    const newPrjFileIds = (await Promise.allSettled(ps))
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value);
  };

  // PRJFILES MODAL

  const prjFilesModalCtr = useDisclosure(false);

  const [prjFileInModal, setPrjFileInModal] = useState<any>({});

  const onClick_openPrjFileModal = async (prjFile: any) => {
    setPrjFileInModal(prjFile);
    prjFilesModalCtr[1].open();
  };

  // LHS PREVIEW

  const lhsPaneDrawerCtr = useDisclosure(false);

  // ACCESS

  const [currUserHasAccess, setCurrUserHasAccess] = useState(true);

  useEffect(() => {
    const currUserEmail = storedUserData?.user?.email;
    if (!currUserEmail) return;
    if (!currApplication) return;
    setCurrUserHasAccess(currUserEmail === currApplication.applicant.email);
  }, [currApplication, storedUserData?.user?.email]);

  // CHAT

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: any) => {
    setInput(e.target.value);
  };

  const formatMessage = (content: any) => {
    return {
      author: "User",
      rawContent: content,
      timestamp: new Date().toISOString(),
    };
  };

  const handleMessageReceived = (message: any) => {
    const markdownContent = md.render(message);
    const formattedMessage = {
      author: "Bot",
      rawContent: message,
      timestamp: new Date().toISOString(),
      markdownContent,
    };
    setMessages((prevMessages) => [formattedMessage, ...prevMessages]);
  };

  const handleSendMessage = async () => {
    if (input.trim() !== "") {
      const newMessage = formatMessage(input);
      setMessages((prevMessages) => [newMessage, ...prevMessages]);
      setInput("");
      setIsLoading(true);
      try {
        const msgsToSend = [...[...messages].reverse(), newMessage];
        const msgsStr = JSON.stringify(msgsToSend);
        const response = await cvxUtils.performAction_createNewReply({
          applicationId: currApplication._id,
          msgsStr,
        });
        console.log(response);
        handleMessageReceived(response);
      } catch (error) {
        console.error("Error sending message:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClearMessages = () => {
    setMessages([]);
  };

  return (
    <Flex w="100%" h="100%" gap="sm">
      {currUserHasAccess ? (
        <>
          <Drawer
            h="100%"
            size="xl"
            opened={lhsPaneDrawerCtr[0]}
            onClose={lhsPaneDrawerCtr[1].close}
            withCloseButton={false}
            title={srcDoc?.titleText}
            scrollAreaComponent={ScrollArea.Autosize}
          >
            <Flex w="100%" h="100%" direction="column" align="stretch">
              <embed
                style={{
                  width: "100%",
                  height: "90vh",
                  minHeight: rem(400),
                  borderRadius: rem(20),
                  flexGrow: 1,
                }}
                src={srcDoc.fileUrl}
              />
            </Flex>
          </Drawer>

          <Modal
            size="70%"
            opened={prjFilesModalCtr[0]}
            onClose={prjFilesModalCtr[1].close}
            title="Uploaded File"
            centered
          >
            <Flex w="100%" h="70vh" gap="md">
              <Flex w="60%" h="100%">
                <embed
                  style={{
                    width: "100%",
                    height: "100%",
                    minHeight: rem(400),
                    borderRadius: rem(20),
                    flexGrow: 1,
                  }}
                  src={prjFileInModal?.fileUrl}
                />
              </Flex>
              <Flex
                w="40%"
                h="100%"
                direction="column"
                align="stretch"
                gap="xs"
              >
                <Flex w="100%" direction="column" gap="sm">
                  <TextInput
                    variant="unstyled"
                    w="100%"
                    size="lg"
                    fw="bold"
                    defaultValue={prjFileInModal?.titleText}
                  />
                  <Textarea
                    variant="unstyled"
                    w="100%"
                    rows={6}
                    defaultValue={prjFileInModal?.summaryText}
                  />
                </Flex>
                <Flex
                  w="100%"
                  direction="column"
                  gap="sm"
                  style={{ flexGrow: 1, overflowY: "auto" }}
                >
                  <Table highlightOnHover withColumnBorders>
                    <Table.Tbody>
                      {JSON.parse(
                        prjFileInModal?.extractedInfoText ?? "[]"
                      ).map((d: any, i: number) => (
                        <Table.Tr key={i}>
                          <Table.Td>{d.extractedInfoLabel}</Table.Td>
                          <Table.Td>{d.extractedInfoValue}</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Flex>

                <Flex w="100%" align="center" gap="sm">
                  <Flex
                    w="100%"
                    justify="center"
                    align="center"
                    style={{ flexGrow: 1 }}
                    gap="xs"
                  >
                    {prjFileInModal.verificationStatus === "verified" ? (
                      <>
                        <FaCheckCircle
                          style={{
                            width: rem(12),
                            height: rem(12),
                            color: "var(--mantine-color-gray-5)",
                          }}
                        />
                        <Text
                          fz="xs"
                          fs="italic"
                          style={{ textAlign: "center" }}
                        >
                          Verified successfully.
                        </Text>
                      </>
                    ) : (
                      <>
                        <FaExclamationCircle
                          style={{
                            width: rem(12),
                            height: rem(12),
                            color: "var(--mantine-color-gray-5)",
                          }}
                        />
                        <Text
                          fz="xs"
                          fs="italic"
                          style={{ textAlign: "center" }}
                        >
                          Verification failed!
                        </Text>
                      </>
                    )}
                  </Flex>

                  <Flex align="center" gap="sm">
                    <FaRedo
                      onClick={() => {
                        cvxUtils.performAction_analysePrjFile({
                          prjFileId: prjFileInModal._id,
                        });
                      }}
                      style={{
                        width: rem(16),
                        height: rem(16),
                        color: "var(--mantine-color-gray-5)",
                        cursor: "pointer",
                      }}
                    />
                    <FaTrashAlt
                      color="#ababab"
                      onClick={() => {
                        cvxUtils.performAction_deletePrjFile({
                          prjFileId: prjFileInModal._id,
                        });
                        prjFilesModalCtr[1].close();
                      }}
                      style={{
                        width: rem(16),
                        height: rem(16),
                        color: "var(--mantine-color-gray-5)",
                        cursor: "pointer",
                      }}
                    />
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </Modal>

          <Modal
            size="50%"
            opened={confirmApplicationModalCtr[0]}
            onClose={confirmApplicationModalCtr[1].close}
            centered
            withCloseButton={false}
          >
            <Flex w="100%" h="50vh" direction="column" align="stretch">
              <Flex w="100%" justify="center">
                <Text>Your Application</Text>
              </Flex>
              <Divider w="100%" />
              <Flex
                w="100%"
                h={rem(180)}
                direction="column"
                justify="center"
                align="stretch"
              >
                <Text fz="xl" fw="bold">
                  {storedUserData?.docusignUserInfo?.fullName ??
                    storedUserData?.user?.name ??
                    "Jane Doe"}
                </Text>
                <Text fz="md" fw="thin" lh="1.1">
                  {storedUserData?.user?.email}
                </Text>
              </Flex>
              <Divider w="100%" />
              <Flex
                w="100%"
                h="100%"
                my="sm"
                pt="md"
                direction="column"
                align="stretch"
                style={{ flexGrow: 1, overflowY: "auto" }}
              >
                <Text fz="sm">Attached Files</Text>
                <Flex w="100%" direction="column">
                  {(currApplicationPrjFiles ?? []).map((prjFile: any) => {
                    return (
                      <Flex
                        key={prjFile._id}
                        bottom="1"
                        align="center"
                        gap="sm"
                      >
                        <Text fw="bold">{prjFile.titleText}</Text>
                      </Flex>
                    );
                  })}
                </Flex>
              </Flex>
            </Flex>
            <Flex w="100%" direction="column" justify="center" align="center">
              <Button w="100%" size="lg" onClick={onClick_submitApplication}>
                <Text fz="lg" fw="bold">
                  Submit
                </Text>
              </Button>
              <Button
                variant="transparent"
                onClick={confirmApplicationModalCtr[1].close}
              >
                Cancel
              </Button>
            </Flex>
          </Modal>

          <Flex w="30%" direction="column" align="stretch" gap="sm">
            <Flex
              w="100%"
              h="100%"
              direction="column"
              align="stretch"
              style={{ overflowY: "auto" }}
            >
              <Flex w="100%" align="center" pr="xs" py="xs">
                <Text fz="lg" fw="bold" style={{ flexGrow: 1 }}>
                  Eligibility List
                </Text>
                <Button variant="outline" onClick={lhsPaneDrawerCtr[1].open}>
                  Full Details
                </Button>
              </Flex>
              <Accordion w="100%" multiple defaultValue={[]}>
                {criteriaJSON ? (
                  <Flex w="100%" direction="column" align="stretch" gap="md">
                    {criteriaJSON.map(
                      (criteriaItem: any, criteriaIdx: number) => {
                        return (
                          <Accordion.Item
                            key={criteriaIdx.toString()}
                            value={criteriaIdx.toString()}
                          >
                            <Accordion.Control mb="md">
                              <Flex w="100%" direction="column">
                                <Text fz="md" fw="bold">
                                  {criteriaItem.title}
                                </Text>
                              </Flex>
                            </Accordion.Control>
                            <Accordion.Panel>
                              <Flex
                                w="100%"
                                direction="column"
                                align="stretch"
                                gap="xs"
                              >
                                <Text fz="sm">{criteriaItem.description}</Text>
                                <Flex
                                  w="100%"
                                  align="center"
                                  gap="xs"
                                  py="xs"
                                  style={{ overflowX: "auto" }}
                                >
                                  {(criteriaItem.valid_docs ?? []).map(
                                    (ct: any, cIdx: number) => {
                                      return <Pill key={cIdx}>{ct}</Pill>;
                                    }
                                  )}
                                </Flex>
                              </Flex>
                            </Accordion.Panel>
                          </Accordion.Item>
                        );
                      }
                    )}
                  </Flex>
                ) : (
                  <></>
                )}
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
            <Flex
              w="100%"
              h="100%"
              direction="column"
              align="stretch"
              gap="md"
              style={{
                overflowY: "clip",
                textAlign: "center",
              }}
            >
              {/* Top row */}
              <Paper
                w="100%"
                h={rem(340)}
                mih={rem(340)}
                p="md"
                bg="gray.1"
                style={{ overflowX: "auto", position: "relative" }}
              >
                <Flex
                  w="100%"
                  h="100%"
                  align="center"
                  justify="space-around"
                  gap="sm"
                >
                  {currApplication?.eligibilityCheckResultStatus ===
                  "generating" ? (
                    <Loader type="oval" size="lg" />
                  ) : (
                    <>
                      {eligibilityCheckResultJSON.map(
                        (cr: any, crIdx: number) => (
                          <Flex
                            key={crIdx}
                            w={rem(240)}
                            h="100%"
                            direction="column"
                            align="center"
                            justify="center"
                            gap="md"
                          >
                            <Text fz="sm" fw="bold">
                              {criteriaJSON[cr.forEligibityObjIdx]?.title}
                            </Text>

                            {cr.isEligible ? (
                              <HoverCard width={280} shadow="md">
                                <HoverCard.Target>
                                  <Flex>
                                    <FaClipboardCheck
                                      style={{
                                        width: rem(32),
                                        height: rem(32),
                                        color: "var(--mantine-color-gray-5)",
                                      }}
                                    />
                                  </Flex>
                                </HoverCard.Target>
                                <HoverCard.Dropdown>
                                  <Text size="sm" lh="1.1" fw="thin">
                                    {cr.reason}
                                  </Text>
                                </HoverCard.Dropdown>
                              </HoverCard>
                            ) : (
                              <HoverCard width={280} shadow="md">
                                <HoverCard.Target>
                                  <Flex>
                                    <FaRegWindowClose
                                      style={{
                                        width: rem(32),
                                        height: rem(32),
                                        color: "var(--mantine-color-gray-5)",
                                      }}
                                    />
                                  </Flex>
                                </HoverCard.Target>
                                <HoverCard.Dropdown>
                                  <Text size="sm" lh="1.1" fw="thin">
                                    {cr.reason}
                                  </Text>
                                </HoverCard.Dropdown>
                              </HoverCard>
                            )}
                          </Flex>
                        )
                      )}
                    </>
                  )}
                </Flex>

                <FaRedo
                  style={{
                    top: 15,
                    right: 15,
                    position: "absolute",
                    width: rem(16),
                    height: rem(16),
                    color: "var(--mantine-color-gray-7)",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    cvxUtils.performAction_analyseApplication({
                      applicationId: currApplication._id,
                    });
                  }}
                />
              </Paper>

              {/* Chat row */}
              <Flex w="100%" h="100%" gap="sm" style={{ flexGrow: 1 }}>
                <Flex w="50%" direction="column" align="stretch" gap="xs">
                  <div style={{ position: "relative" }}>
                    <Textarea
                      variant="filled"
                      w="100%"
                      rows={8}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      placeholder="Type your message here..."
                    />

                    <Flex
                      w="100%"
                      align="center"
                      gap="sm"
                      style={{
                        position: "absolute",
                        bottom: rem(10),
                        right: rem(10),
                      }}
                    >
                      <div style={{ flexGrow: 1 }}></div>
                      <FaTrashAlt
                        color="#ababab"
                        onClick={handleClearMessages}
                        style={{
                          width: rem(16),
                          height: rem(16),
                          color: "var(--mantine-color-gray-5)",
                          cursor: isLoading ? "not-allowed" : "pointer",
                        }}
                      />
                      <Button
                        color="gray.6"
                        variant="outline"
                        size="md"
                        onClick={handleSendMessage}
                        disabled={isLoading}
                      >
                        Send
                      </Button>
                    </Flex>
                  </div>
                </Flex>
                <Flex
                  w="50%"
                  h="100%"
                  direction="column"
                  align="stretch"
                  gap="sm"
                >
                  {messages.length < 1 ? (
                    <Flex
                      w="100%"
                      h="100%"
                      justify="center"
                      align="center"
                      style={{ textAlign: "center" }}
                    >
                      <Text fs="italic" size="sm">
                        Have questions? Ask away, and we’ll help you find
                        answers!
                      </Text>
                    </Flex>
                  ) : (
                    <div
                      style={{
                        height: "100%",
                        overflowY: "auto",
                      }}
                    >
                      <Flex
                        w="100%"
                        h="2000"
                        mih="3000"
                        direction="column-reverse"
                        justify="flex-end"
                        gap="xs"
                      >
                        {messages.map((message, index) => (
                          <MessageCard key={index} message={message} />
                        ))}
                      </Flex>
                    </div>
                  )}
                </Flex>
              </Flex>
            </Flex>
          </Flex>

          <Flex w="30%" direction="column" align="center" gap="sm">
            <Flex w="100%" gap="sm">
              <Flex w="60%">
                {currApplication?.initializationStatus === "complete" ? (
                  <Flex
                    w="100%"
                    h="100%"
                    direction="column"
                    justify="center"
                    align="center"
                  >
                    <Text fz="sm" fw="light">
                      Application Submitted
                    </Text>
                  </Flex>
                ) : (
                  <FileUploader
                    projectId={currProject?._id}
                    onClick_uploadFiles={onClick_uploadFiles_PrjFiles}
                  />
                )}
              </Flex>
              <Flex w="40%">
                <Button
                  variant="filled"
                  w="100%"
                  h="100%"
                  disabled={!canApply}
                  p="lg"
                  onClick={onClick_openConfirmApplicationModal}
                >
                  {currApplication?.initializationStatus === "complete" ? (
                    <FaCheckCircle
                      style={{
                        width: rem(42),
                        height: rem(42),
                        color: "#693dd9",
                      }}
                    />
                  ) : (
                    <Text fz="lg" fw="bold">
                      APPLY
                    </Text>
                  )}
                </Button>
              </Flex>
            </Flex>

            <Divider w="100%" />

            <Flex w="100%" h="100%" direction="column" align="stretch">
              <Text fz="md" fw="bold">
                Uploaded Files
              </Text>

              <Paper
                w="100%"
                h="100%"
                p="md"
                bg="gray.1"
                style={{ flexGrow: 1, overflowY: "auto" }}
              >
                {(currApplicationPrjFiles ?? []).length > 0 ? (
                  <SimpleGrid cols={2}>
                    {(currApplicationPrjFiles ?? []).map((prjFile: any) => {
                      return (
                        <Card
                          key={prjFile._id}
                          w="100%"
                          h="100%"
                          withBorder
                          p="md"
                        >
                          <Flex
                            h="100%"
                            direction="column"
                            align="stretch"
                            gap="sm"
                          >
                            <Flex
                              w="100%"
                              h="100%"
                              direction="column"
                              align="stretch"
                              style={{ flexGrow: 1 }}
                            >
                              <Text fz="sm" fw="bold">
                                {prjFile.titleText}
                              </Text>
                            </Flex>

                            <Flex w="100%" justify="center">
                              <Button
                                variant="transparent"
                                size="xs"
                                c="gray.6"
                                onClick={() => {
                                  onClick_openPrjFileModal(prjFile);
                                }}
                              >
                                Open
                              </Button>
                            </Flex>
                          </Flex>
                        </Card>
                      );
                    })}
                  </SimpleGrid>
                ) : (
                  <Flex
                    w="100%"
                    h="100%"
                    justify="center"
                    align="center"
                    p="xl"
                    style={{ textAlign: "center" }}
                  >
                    <Text fz="sm" c="gray.6" fs="italic" w="200">
                      Add your files and let the AI work its magic!
                    </Text>
                  </Flex>
                )}
              </Paper>
            </Flex>
          </Flex>
        </>
      ) : (
        <Flex w="100%" direction="column" align="center" gap="md">
          <Flex w="20%" direction="column" align="center" gap="md">
            <FaExclamationCircle
              style={{
                width: rem(12),
                height: rem(12),
                color: "var(--mantine-color-gray-5)",
              }}
            />
            <Text style={{ textAlign: "center" }}>You do not have access.</Text>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
}
