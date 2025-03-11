import { Flex, Paper, Text } from "@mantine/core";

export default function GuideInfo({ msgHead, msgDesc }: any) {
  return (
    <Paper w="100%" h="100%" bg="versee-purple" c="white">
      <Flex
        w="100%"
        h="100%"
        maw="400"
        direction="column"
        justify="center"
        align="center"
        gap="sm"
        p="lg"
        style={{ textAlign: "center" }}
      >
        <Text lh="1">{msgHead}</Text>
        <Text fz="lg" fw="bold" lh="1.2">
          {msgDesc}
        </Text>
      </Flex>
    </Paper>
  );
}
