import { useLocation } from "react-router-dom";
import { Button, Flex } from "@mantine/core";

import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

import useCvxUtils from "../hooks/cvxUtils";

export default function OauthCallback_Docusign() {
  const storedUserData = useQuery(api.dbOps.getUserData_ForCurrUser);
  const cvxUtils = useCvxUtils();

  const location = useLocation();

  const onClickTest_retrieveDocusignAccessToken = async () => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get("code");
    const savedRecord =
      await cvxUtils.performAction_retrieveDocusignAccessToken({
        authCode: code ?? "",
      });
    console.log(savedRecord);
  };

  const onClickTest_retrieveDocusignUserToken = async () => {
    const savedRecord =
      await cvxUtils.performAction_retrieveDocusignUserToken();
    console.log(savedRecord);
  };

  return (
    <Flex w="100%" direction="column" align="center" gap="sm">
      <Flex w="60%" direction="column" align="center" gap="md" p="lg">
        Docusign Auth
        {!storedUserData?.docusignAccessTknObj ? (
          <>
            <Button
              onClick={onClickTest_retrieveDocusignAccessToken}
              w="100%"
              size="lg"
            >
              Get Access Token
            </Button>
          </>
        ) : (
          <></>
        )}
        {storedUserData?.docusignAccessTknObj &&
        !storedUserData?.docusignUserTknObj ? (
          <>
            <Button
              onClick={onClickTest_retrieveDocusignUserToken}
              variant="outline"
              w="100%"
              size="lg"
            >
              Get User Token
            </Button>
          </>
        ) : (
          <></>
        )}
      </Flex>
    </Flex>
  );
}
