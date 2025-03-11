import { Card, Text, Flex } from "@mantine/core";

export const MessageCard = ({ message }: any) => {
  const isUserMessage = message.author === "User";

  return (
    <Card
      shadow="sm"
      padding="md"
      withBorder
      style={{
        backgroundColor: isUserMessage ? "#f3edff" : "#ffffff",
        alignSelf: isUserMessage ? "flex-end" : "flex-start",
        maxWidth: "70%",
        textAlign: "left",
      }}
    >
      <Flex direction="column">
        <Text fw="bold" size="sm" lh="1">
          {message.author}
        </Text>
        <Text size="sm" lh="1">
          {message.author === "Bot" ? (
            <span
              dangerouslySetInnerHTML={{ __html: message.markdownContent }}
            ></span>
          ) : (
            message.rawContent
          )}
        </Text>
      </Flex>
    </Card>
  );
};

export default MessageCard;
