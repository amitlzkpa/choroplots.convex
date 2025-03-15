import {
  query,
  mutation,
  internalQuery,
  internalMutation,
} from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";

// USERDATA

export const getUserData_ForCurrUser = query({
  handler: async (ctx) => {
    const currUser = await ctx.auth.getUserIdentity();
    if (!currUser) return null;
    const userData = await ctx.db
      .query("vsUser")
      .filter((q) => q.eq(q.field("user.subject"), currUser.subject))
      .first();
    return userData;
  },
});

export const upsertUserData_ForUser = internalMutation({
  args: {
    userDataStr: v.string(),
  },
  handler: async (ctx, { userDataStr }) => {
    const userData = JSON.parse(userDataStr);
    const currUser = await ctx.auth.getUserIdentity();
    if (!currUser) return null;
    const upsertData = { ...userData, user: currUser };
    const exData = await ctx.db
      .query("vsUser")
      .filter((q) => q.eq(q.field("user.subject"), currUser.subject))
      .first();
    let retVal;
    if (exData) {
      await ctx.db.patch(exData._id, upsertData);
      retVal = exData._id;
    } else {
      const newRecord = await ctx.db.insert("vsUser", upsertData);
      retVal = newRecord;
    }
    return retVal;
  },
});

// PROJECT

export const getAllProjects_ForCurrUser = query({
  handler: async (ctx) => {
    const currUser = await ctx.auth.getUserIdentity();
    if (!currUser) return [];
    const projects = await ctx.db
      .query("vsProjects")
      .filter((q) => q.eq(q.field("creator.subject"), currUser.subject))
      .order("desc")
      .collect();
    return projects;
  },
});

export const getProject_ByProjectId = query({
  args: {
    projectId: v.optional(v.id("vsProjects")),
  },
  handler: async (ctx, { projectId }) => {
    if (!projectId) return null;
    const project = await ctx.db.get(projectId);
    return project;
  },
});

export const createNewProject = internalMutation({
  handler: async (ctx) => {
    const currUser = await ctx.auth.getUserIdentity();
    if (!currUser) return null;
    const newProjectData = {
      creator: currUser,
      initializationStatus: "uninitialized",
    };
    const newProject = await ctx.db.insert("vsProjects", newProjectData);
    return newProject;
  },
});

export const updateProject = internalMutation({
  args: {
    projectId: v.id("vsProjects"),
    updateData: v.string(),
  },
  handler: async (ctx, { projectId, updateData }) => {
    const _updateData = JSON.parse(updateData);
    const updatedProject = await ctx.db.patch(projectId, _updateData);
    return updatedProject;
  },
});

// STOREDFILE

export const getAllStoredFiles_ForProject = query({
  args: {
    projectId: v.optional(v.id("vsProjects")),
  },
  handler: async (ctx, { projectId }) => {
    if (!projectId) return [];
    const dbRecs = await ctx.db
      .query("vsStoredFile")
      .filter((q) => q.eq(q.field("projectId"), projectId))
      .order("desc")
      .collect();
    const ps = dbRecs.map(
      (dbRec) =>
        new Promise((resolve, reject) => {
          const storageId = dbRec.cvxStoredFileId as Id<"_storage">;
          ctx.storage
            .getUrl(storageId)
            .then((fileUrl) => {
              resolve({
                ...dbRec,
                fileUrl,
              });
            })
            .catch((err) => {
              reject(err);
            });
        })
    );
    const projectStoredFiles = (await Promise.allSettled(ps))
      .filter((p) => p.status === "fulfilled")
      .map((p) => p.value);
    return projectStoredFiles;
  },
});

export const getStoredFile_ByStoredFileId = query({
  args: {
    storedFileId: v.optional(v.id("vsStoredFile")),
  },
  handler: async (ctx, { storedFileId }) => {
    if (!storedFileId) return null;
    const storedFile = await ctx.db.get(storedFileId);
    return storedFile;
  },
});

export const createNewStoredFile = internalMutation({
  args: {
    cvxStoredFileId: v.id("_storage"),
    projectId: v.id("vsProjects"),
  },
  handler: async (ctx, { cvxStoredFileId, projectId }) => {
    const storedFileData = {
      cvxStoredFileId,
      projectId,
      titleStatus: "not_generated",
      titleText: "",
      summaryStatus: "not_generated",
      summaryText: "",
    };
    const newStoredFileId = await ctx.db.insert("vsStoredFile", storedFileData);
    return newStoredFileId;
  },
});

export const updateStoredFile = internalMutation({
  args: {
    storedFileId: v.id("vsStoredFile"),
    updateDataStr: v.string(),
  },
  handler: async (ctx, { storedFileId, updateDataStr }) => {
    const writeData = JSON.parse(updateDataStr);
    const updatedStoredFileId = await ctx.db.patch(storedFileId, writeData);
    return updatedStoredFileId;
  },
});

// MAPS

export const getMap_ByMapId = query({
  args: {
    mapId: v.optional(v.id("vsMaps")),
  },
  handler: async (ctx, { mapId }) => {
    if (!mapId) return null;
    const map = await ctx.db.get(mapId);
    return map;
  },
});

export const createNewMap = internalMutation({
  args: {
    text: v.string(),
  },
  handler: async (ctx, { text }) => {
    const mapData = {
      text,
      status: "not_generated",
    };
    const newMapId = await ctx.db.insert("vsMaps", mapData);
    return newMapId;
  },
});
