import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export default function useCvxUtils() {
  const performAction_startDocusignOAuth = useAction(
    api.vsActions.startDocusignOAuth
  );

  const performAction_retrieveDocusignAccessToken = useAction(
    api.vsActions.retrieveDocusignAccessToken
  );

  const performAction_retrieveDocusignUserToken = useAction(
    api.vsActions.retrieveDocusignUserToken
  );

  const performAction_startGWspcOAuth = useAction(
    api.vsActions.startGWspcOAuth
  );

  const performAction_retrieveGWspcToken = useAction(
    api.vsActions.retrieveGWspcToken
  );

  const performAction_generateUploadUrl = useAction(
    api.vsActions.generateUploadUrl
  );

  const performAction_sendDocusignSigningEmail = useAction(
    api.vsActions.sendDocusignSigningEmail
  );

  const performAction_createNewProject = useAction(
    api.vsActions.createNewProject
  );

  const performAction_updateProject = useAction(api.vsActions.updateProject);

  const performAction_createSenderViewFromDoc = useAction(
    api.vsActions.createSenderViewFromDoc
  );

  const performAction_sendDocusignEnvelope = useAction(
    api.vsActions.sendDocusignEnvelope
  );

  const performAction_createNewSrcDoc = useAction(
    api.vsActions.createNewSrcDoc
  );

  const performAction_updateSrcDoc = useAction(api.vsActions.updateSrcDoc);

  const performAction_analyseSrcDoc = useAction(api.vsActions.analyseSrcDoc);

  const performAction_createNewPrjFile = useAction(
    api.vsActions.createNewPrjFile
  );

  const performAction_deletePrjFile = useAction(api.vsActions.deletePrjFile);

  const performAction_analysePrjFile = useAction(api.vsActions.analysePrjFile);

  const performAction_createNewApplication = useAction(
    api.vsActions.createNewApplication
  );

  const performAction_updateApplication = useAction(
    api.vsActions.updateApplication
  );

  const performAction_analyseApplication = useAction(
    api.vsActions.analyseApplication
  );

  const performAction_setupCheckingConditions = useAction(
    api.vsActions.setupCheckingConditions
  );

  const performAction_createNewReply = useAction(api.vsActions.createNewReply);

  return {
    performAction_startDocusignOAuth,
    performAction_retrieveDocusignAccessToken,
    performAction_retrieveDocusignUserToken,
    performAction_startGWspcOAuth,
    performAction_retrieveGWspcToken,
    performAction_generateUploadUrl,
    performAction_sendDocusignSigningEmail,
    performAction_createNewProject,
    performAction_updateProject,
    performAction_createSenderViewFromDoc,
    performAction_sendDocusignEnvelope,
    performAction_createNewSrcDoc,
    performAction_updateSrcDoc,
    performAction_analyseSrcDoc,
    performAction_createNewPrjFile,
    performAction_deletePrjFile,
    performAction_analysePrjFile,
    performAction_createNewApplication,
    performAction_updateApplication,
    performAction_analyseApplication,
    performAction_setupCheckingConditions,
    performAction_createNewReply,
  };
}
