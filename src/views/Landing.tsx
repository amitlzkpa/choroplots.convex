import { Button, Divider, Flex, Image, Text } from "@mantine/core";

export default function Landing() {
  return (
    <Flex w="100%" direction="column" align="center" gap="sm">
      Choroplots
      <br />


      <Flex w="80%" maw="600px" mah="600px" direction="column" align="center" gap="md" m="md">
        <Button
          component="a"
          size="lg"
          onClick={() => console.log("Clicked!")}
        >
          <Text fw="bold">
            Click
          </Text>
        </Button>
      </Flex>

      <Divider w="100%" />

    </Flex >
  );
}
