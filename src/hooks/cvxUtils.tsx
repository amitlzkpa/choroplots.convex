import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function useCvxUtils() {
  const performAction_generateUploadUrl = useAction(
    api.vsActions.generateUploadUrl
  );

  const performAction_createNewProject = useAction(
    api.vsActions.createNewProject
  );

  const performAction_updateProject = useAction(api.vsActions.updateProject);

  const performAction_createNewStoredFile = useAction(
    api.vsActions.createNewStoredFile
  );

  const performAction_updateStoredFile = useAction(api.vsActions.updateStoredFile);

  const performAction_analyseStoredFile = useAction(api.vsActions.analyseStoredFile);

  return {
    performAction_generateUploadUrl,
    performAction_createNewProject,
    performAction_updateProject,
    performAction_createNewStoredFile,
    performAction_updateStoredFile,
    performAction_analyseStoredFile,
  };
}
