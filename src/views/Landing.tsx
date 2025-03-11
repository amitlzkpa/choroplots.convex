import { Button, Divider, Flex, Image, Text } from "@mantine/core";

export default function Landing() {
  return (
    <Flex w="100%" direction="column" align="center" gap="sm">

      <Flex w="80%" maw="600px" mah="600px" direction="column" align="center" gap="md" m="md">
        <Text size="xl" fw="bold">
          Choroplots
        </Text>
        <Text>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor libero eu nisl pellentesque, in laoreet tortor aliquam. Donec pulvinar diam nisl, et maximus nulla vulputate vel. Pellentesque et magna scelerisque, gravida mauris quis, viverra augue. Donec felis eros, laoreet non fringilla quis, pulvinar nec turpis. Sed non dui efficitur, tempor augue at, consectetur leo. Cras id metus dolor. Aenean eros enim, consectetur auctor pretium eget, tristique luctus lacus. Nam sagittis tincidunt tellus, et mollis purus. Etiam sit amet justo finibus velit tempus faucibus. Sed a viverra nisl. Cras eleifend sem vel rhoncus commodo. Proin mollis condimentum bibendum. Cras eget rutrum nulla.
        </Text>
      </Flex>

    </Flex>
  );
}
