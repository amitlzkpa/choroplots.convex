import { Button, Divider, Flex, Image, Text } from "@mantine/core";

export default function Landing() {
  return (
    <Flex w="100%" direction="column" align="center" gap="sm">

      <Flex w="80%" maw="600px" mah="600px" direction="column" align="center" gap="md" m="md">
        <Text size="xl" fw="bold">
          Choroplots
        </Text>
        <Text>
          Choroplots are a way to visualize data on a map. The idea is to help communities visualize incidents, events, or other data in a simple and accessible way.
        </Text>
      </Flex>

    </Flex>
  );
}
