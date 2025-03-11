import { Button, Divider, Flex, Image, Text } from "@mantine/core";

export default function Landing() {
  return (
    <Flex w="100%" direction="column" align="center" gap="sm">
      Versee: Simplifying Application Processes with AI
      <br />
      <br />
      Versee is a web app designed to make reviewing and submitting complex applications, like affordable housing schemes, simple and user-friendly. Reviewing agreements and understanding eligibility criteria can be overwhelming, especially when dealing with multiple documents and hidden requirements. Versee uses advanced language models (LLMs) to analyze documents, extract relevant information, and guide you through the process step-by-step. This ensures that you no longer need to rely on third parties or share sensitive documents with strangers to determine your eligibility.
      <br /><br />
      With Versee, you can easily upload files, whether they’re PDFs or even photos converted into PDFs. The app analyzes these documents, identifies their type, and extracts key details to assess your eligibility against specific criteria, like income limits. For example, in the case of an affordable housing scheme in Navi Mumbai, Versee scans your tax records to verify your income level, saving you time and effort. The app also provides an interactive interface to track your application status, reduces ineligible applications, and ensures a smoother experience with features like QR code scanning and document signing through DocuSign. Versee transforms tedious manual processes into efficient, AI-driven workflows, empowering you to make informed decisions with ease.
      <br />


      <Flex w="80%" maw="600px" mah="600px" direction="column" align="center" gap="md" m="md">
        <Button
          component="a"
          size="lg"
          href="https://versee.vercel.app/apply/k171d8gpaa6hypn4rbw3y0qw25795600"
          target="_blank"
        >
          <Text fw="bold">
            Preview Scheme
          </Text>
        </Button>
        <Button
          component="a"
          size="lg"
          href="https://versee.vercel.app/preview/jd74e7crp9k98s1jqt7jbep47s794b90"
          target="_blank"
        >
          <Text fw="bold">
            Demo
          </Text>
        </Button>
        <Button
          component="a"
          variant="transparent"
          size="lg"
          href="https://versee.vercel.app/home"
          target="_blank"
        >
          <Text fw="bold">
            Dashboard
          </Text>
        </Button>
        <Button
          component="a"
          variant="transparent"
          size="lg"
          href="https://versee.vercel.app/screenshots"
          target="_blank"
        >
          <Text fw="bold">
            Screenshots
          </Text>
        </Button>
      </Flex>

      <Divider w="100%" />

      <Flex w="80%" maw="600px" mah="600px" direction="column" align="center" gap="md" m="md">
        <Flex w="100%" direction="column" align="center" gap="sm" p="md">
          <Image src="/images/A1-check-document-eligibility.png" fallbackSrc="A1-check-document-eligibility.png" fit="contain" />
          <Text style={{ textAlign: "center" }}>
            Check if your documents are eligible before applying.
          </Text>
        </Flex>

        <Flex w="100%" direction="column" align="center" gap="sm" p="md">
          <Image src="/images/A1-clear-explanations.png" fallbackSrc="A1-clear-explanations.png" fit="contain" />
          <Text style={{ textAlign: "center" }}>
            Get clear explanations of the application process.
          </Text>
        </Flex>

        <Flex w="100%" direction="column" align="center" gap="sm" p="md">
          <Image src="/images/A1-embedded-preparatiion.png" fallbackSrc="A1-embedded-preparatiion.png" fit="contain" />
          <Text style={{ textAlign: "center" }}>
            Complete your preparation within the application.
          </Text>
        </Flex>

        <Flex w="100%" direction="column" align="center" gap="sm" p="md">
          <Image src="/images/A1-online-signing.png" fallbackSrc="A1-online-signing.png" fit="contain" />
          <Text style={{ textAlign: "center" }}>
            Sign your documents online securely.
          </Text>
        </Flex>

        <Flex w="100%" direction="column" align="center" gap="sm" p="md">
          <Image src="/images/A1-upload-and-apply.png" fallbackSrc="A1-upload-and-apply.png" fit="contain" />
          <Text style={{ textAlign: "center" }}>
            Upload your documents and apply quickly.
          </Text>
        </Flex>

        <Flex w="100%" direction="column" align="center" gap="sm" p="md">
          <Image src="/images/A1-parses-different-types-of-documents.png" fallbackSrc="A1-parses-different-types-of-documents.png" fit="contain" />
          <Text style={{ textAlign: "center" }}>
            Our system can parse various document types.
          </Text>
        </Flex>

        <Flex w="100%" direction="column" align="center" gap="sm" p="md">
          <Image src="/images/A1-pdf-data-extraction.png" fallbackSrc="A1-pdf-data-extraction.png" fit="contain" />
          <Text style={{ textAlign: "center" }}>
            We extract data from your PDFs to save you time.
          </Text>
        </Flex>

        <Flex w="100%" direction="column" align="center" gap="sm" p="md">
          <Image src="/images/A1-qr-code-share.png" fallbackSrc="A1-qr-code-share.png" fit="contain" />
          <Text style={{ textAlign: "center" }}>
            Share your application easily with a QR code.
          </Text>
        </Flex>

        <Flex w="100%" direction="column" align="center" gap="sm" p="md">
          <Image src="/images/A1-see-eligibility-criteria.png" fallbackSrc="A1-see-eligibility-criteria.png" fit="contain" />
          <Text style={{ textAlign: "center" }}>
            View the eligibility criteria to see if you qualify.
          </Text>
        </Flex>

        <a href="https://versee.vercel.app/apply/k171d8gpaa6hypn4rbw3y0qw25795600" style={{ textDecoration: "none" }}>
          <Flex w="100%" direction="column" align="center" gap="sm" p="md">
            <Image src="/images/A1-start-application.png" fallbackSrc="A1-start-application.png" fit="contain" />
            <Text style={{ textAlign: "center" }}>
              Start your application with a single click.
            </Text>
          </Flex>
        </a>

      </Flex>


    </Flex >
  );
}
