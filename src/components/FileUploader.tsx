import { useRef, useState } from "react";
import { Button, Flex, Text, rem } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";

import {
  FaFileDownload,
  FaFileImport,
  FaMinusCircle,
  FaTrash,
} from "react-icons/fa";

export default function FileUploader({
  projectId = null,
  onClick_uploadFiles = (droppedFiles: any[]) => { },
  allowMultiple = true,
}: any) {
  const openRef = useRef<() => void>(null);

  const [droppedFiles, setDroppedFiles] = useState<any[]>([]);

  const [isUploading, setIsUploading] = useState(false);

  const addToDroppedFiles = (files: any) => {
    if (allowMultiple) {
      setDroppedFiles((prev) => [...prev, ...files]);
    } else {
      setDroppedFiles(files);
    }
  };

  const removeFromDroppedFiles = (file: any) => {
    setDroppedFiles(droppedFiles.filter((f) => f !== file));
  };

  const onClick_uploadBtn = async () => {
    setIsUploading(true);

    try {
      await onClick_uploadFiles(droppedFiles);
    } catch (err) {
      console.log(err);
    }

    setDroppedFiles([]);
    setIsUploading(false);
  };

  return (
    <Flex
      w="100%"
      h="100%"
      direction="column"
      justify="center"
      align="center"
      gap="xs"
    >
      <Dropzone
        w="100%"
        h="100%"
        multiple={allowMultiple}
        openRef={openRef}
        activateOnClick={false}
        loading={isUploading}
        onDrop={addToDroppedFiles}
        accept={[
          "image/png",
          "image/jpeg",
          "image/webp",
          "image/heic",
          // "text/csv",
          "application/pdf",
          // "application/msword",
          // "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ]}
        maxSize={15 * 1024 * 1024}
        disabled={!projectId}
      >
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            pointerEvents: "all",
            cursor: "pointer",
          }}
          onClick={() => {
            openRef.current?.();
          }}
        />
        <Flex
          h="180"
          direction="column"
          justify="center"
          align="center"
          gap="md"
          p="sm"
          style={{ pointerEvents: "none", position: "relative" }}
        >
          <Dropzone.Accept>
            <FaFileDownload
              style={{
                width: rem(52),
                height: rem(52),
                color: "var(--mantine-color-blue-6)",
              }}
            />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <FaMinusCircle
              style={{
                width: rem(52),
                height: rem(52),
                color: "var(--mantine-color-red-6)",
              }}
            />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <Flex w="100%" h="100%">
              {droppedFiles.length > 0 ? (
                <Flex w="100%" direction="column" align="center" gap="sm">
                  <Text fz="md" fw="bold">
                    {droppedFiles.length > 1
                      ? "Selected Files"
                      : "Selected File"}
                  </Text>
                  <Flex
                    w="100%"
                    direction="column"
                    gap="xs"
                    style={{ overflowY: "auto", pointerEvents: "auto" }}
                  >
                    {droppedFiles.map((f, i) => (
                      <Flex key={`${f.name}_${i}`} gap="xs" align="center">
                        <FaTrash
                          style={{
                            pointerEvents: "all",
                            width: rem(12),
                            height: rem(12),
                            color: "var(--mantine-color-gray-5)",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            removeFromDroppedFiles(f);
                          }}
                        />
                        <Text fz="sm" c="dimmed">
                          {i + 1}.
                        </Text>
                        <Text>{f.name}</Text>
                      </Flex>
                    ))}
                  </Flex>
                </Flex>
              ) : (
                <Flex
                  w="100%"
                  h="100%"
                  direction="column"
                  justify="center"
                  align="center"
                  gap="sm"
                  style={{ textAlign: "center" }}
                >
                  <FaFileImport
                    style={{
                      width: rem(52),
                      height: rem(52),
                      color: "var(--mantine-color-dimmed)",
                    }}
                  />
                  <Text size="xl" inline>
                    {allowMultiple
                      ? "Drag files here or click to select files"
                      : "Drag your file here or click to select"}
                  </Text>
                  <Text size="sm" c="dimmed" inline>
                    {allowMultiple
                      ? "Attach as many files as you like"
                      : "Select 1 file"}
                  </Text>
                </Flex>
              )}
            </Flex>
          </Dropzone.Idle>
        </Flex>
      </Dropzone>

      <Button
        variant="outline"
        onClick={onClick_uploadBtn}
        w="100%"
        size="lg"
        disabled={!projectId || droppedFiles.length < 1 || isUploading}
      >
        Upload
      </Button>
    </Flex>
  );
}
