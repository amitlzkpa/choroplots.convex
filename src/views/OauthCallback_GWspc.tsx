import { useLocation } from "react-router-dom";
import { Button, Flex } from "@mantine/core";

import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

import useCvxUtils from "../hooks/cvxUtils";

export default function OauthCallback_GWspc() {
  const storedUserData = useQuery(api.dbOps.getUserData_ForCurrUser);
  const cvxUtils = useCvxUtils();

  const location = useLocation();

  const onClickTest_retrieveGWspcAccessToken = async () => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get("code");
    const savedRecord = await cvxUtils.performAction_retrieveGWspcToken({
      authCode: code ?? "",
    });
    console.log(savedRecord);
  };

  return (
    <Flex w="100%" direction="column" align="center" gap="sm">
      <Flex w="60%" direction="column" align="center" gap="md" p="lg">
        Google Workspace Auth
        {!storedUserData?.googleDriveTknObj ? (
          <>
            <Button
              onClick={onClickTest_retrieveGWspcAccessToken}
              w="100%"
              size="lg"
            >
              Get Access Token
            </Button>
          </>
        ) : (
          <></>
        )}
      </Flex>
    </Flex>
  );
}
