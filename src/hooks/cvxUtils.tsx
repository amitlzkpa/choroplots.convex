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

  const performAction_createNewSrcDoc = useAction(
    api.vsActions.createNewSrcDoc
  );

  const performAction_updateSrcDoc = useAction(api.vsActions.updateSrcDoc);

  const performAction_analyseSrcDoc = useAction(api.vsActions.analyseSrcDoc);

  return {
    performAction_generateUploadUrl,
    performAction_createNewProject,
    performAction_updateProject,
    performAction_createNewSrcDoc,
    performAction_updateSrcDoc,
    performAction_analyseSrcDoc,
  };
}
