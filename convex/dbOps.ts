import {
  query,
  mutation,
  internalQuery,
  internalMutation,
} from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";

// DOCUSIGN

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

// SRCDOC

export const getAllSrcDocs_ForProject = query({
  args: {
    projectId: v.optional(v.id("vsProjects")),
  },
  handler: async (ctx, { projectId }) => {
    if (!projectId) return [];
    const dbRecs = await ctx.db
      .query("vsSrcDoc")
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
    const projectSrcDocs = (await Promise.allSettled(ps))
      .filter((p) => p.status === "fulfilled")
      .map((p) => p.value);
    return projectSrcDocs;
  },
});

export const getSrcDoc_BySrcDocId = query({
  args: {
    srcDocId: v.optional(v.id("vsSrcDoc")),
  },
  handler: async (ctx, { srcDocId }) => {
    if (!srcDocId) return null;
    const srcDoc = await ctx.db.get(srcDocId);
    return srcDoc;
  },
});

export const createNewSrcDoc = internalMutation({
  args: {
    cvxStoredFileId: v.id("_storage"),
    projectId: v.id("vsProjects"),
  },
  handler: async (ctx, { cvxStoredFileId, projectId }) => {
    const srcDocData = {
      cvxStoredFileId,
      projectId,
      titleStatus: "not_generated",
      titleText: "",
      summaryStatus: "not_generated",
      summaryText: "",
    };
    const newSrcDocId = await ctx.db.insert("vsSrcDoc", srcDocData);
    return newSrcDocId;
  },
});

export const updateSrcDoc = internalMutation({
  args: {
    srcDocId: v.id("vsSrcDoc"),
    updateDataStr: v.string(),
  },
  handler: async (ctx, { srcDocId, updateDataStr }) => {
    const writeData = JSON.parse(updateDataStr);
    const updatedSrcDocId = await ctx.db.patch(srcDocId, writeData);
    return updatedSrcDocId;
  },
});

// PRJFILE

export const getAllPrjFiles_ForProject = query({
  args: {
    projectId: v.optional(v.id("vsProjects")),
  },
  handler: async (ctx, { projectId }) => {
    if (!projectId) return [];
    const dbRecs = await ctx.db
      .query("vsPrjFile")
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
    const projectPrjFiles = (await Promise.allSettled(ps))
      .filter((p) => p.status === "fulfilled")
      .map((p) => p.value);
    return projectPrjFiles;
  },
});

export const getAllPrjFiles_ForApplication = query({
  args: {
    applicationId: v.optional(v.id("vsApplications")),
  },
  handler: async (ctx, { applicationId }) => {
    if (!applicationId) return [];
    const dbRecs = await ctx.db
      .query("vsPrjFile")
      .filter((q) => q.eq(q.field("applicationId"), applicationId))
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
    const projectPrjFiles = (await Promise.allSettled(ps))
      .filter((p) => p.status === "fulfilled")
      .map((p) => p.value);
    return projectPrjFiles;
  },
});

export const getPrjFile_ByPrjFileId = query({
  args: {
    prjFileId: v.optional(v.id("vsPrjFile")),
  },
  handler: async (ctx, { prjFileId }) => {
    if (!prjFileId) return null;
    const prjFile = await ctx.db.get(prjFileId);
    return prjFile;
  },
});

export const createNewPrjFile = internalMutation({
  args: {
    cvxStoredFileId: v.id("_storage"),
    projectId: v.id("vsProjects"),
    applicationId: v.id("vsApplications"),
  },
  handler: async (ctx, { cvxStoredFileId, projectId, applicationId }) => {
    const currUser = await ctx.auth.getUserIdentity();
    if (!currUser) return null;
    const prjFileData = {
      cvxStoredFileId,
      projectId,
      applicationId,
      uploader: currUser,
      titleStatus: "not_generated",
      titleText: "",
      summaryStatus: "not_generated",
      summaryText: "",
    };
    const newPrjFileId = await ctx.db.insert("vsPrjFile", prjFileData);
    return newPrjFileId;
  },
});

export const deletePrjFile = internalMutation({
  args: {
    prjFileId: v.id("vsPrjFile"),
  },
  handler: async (ctx, { prjFileId }) => {
    const deletedPrjFileId = await ctx.db.delete(prjFileId);
    return deletedPrjFileId;
  },
});

export const updatePrjFile = internalMutation({
  args: {
    prjFileId: v.id("vsPrjFile"),
    updateDataStr: v.string(),
  },
  handler: async (ctx, { prjFileId, updateDataStr }) => {
    const writeData = JSON.parse(updateDataStr);
    const updatedPrjFileId = await ctx.db.patch(prjFileId, writeData);
    return updatedPrjFileId;
  },
});

// APPLICATIONS

export const getAllApplications_ForCurrUser = query({
  handler: async (ctx) => {
    const currUser = await ctx.auth.getUserIdentity();
    if (!currUser) return [];
    const applications = await ctx.db
      .query("vsApplications")
      .filter((q) => q.eq(q.field("applicant.subject"), currUser.subject))
      .order("desc")
      .collect();
    return applications;
  },
});

export const getApplication_ByApplicationId = query({
  args: {
    applicationId: v.optional(v.id("vsApplications")),
  },
  handler: async (ctx, { applicationId }) => {
    if (!applicationId) return null;
    const application = await ctx.db.get(applicationId);
    return application;
  },
});

export const getApplications_ByProjectId = query({
  args: {
    projectId: v.id("vsProjects"),
  },
  handler: async (ctx, { projectId }) => {
    const applications = await ctx.db
      .query("vsApplications")
      .filter((q) => q.eq(q.field("projectId"), projectId))
      .collect();
    return applications;
  },
});

export const getApplications_ByProjectId_FilterForCompleted = query({
  args: {
    projectId: v.id("vsProjects"),
  },
  handler: async (ctx, { projectId }) => {
    const applications = await ctx.db
      .query("vsApplications")
      .filter((q) =>
        q.and(
          q.eq(q.field("initializationStatus"), "complete"),
          q.eq(q.field("projectId"), projectId)
        )
      )
      .collect();
    return applications;
  },
});

export const getApplication_ByProjectId_ForCurrUser = query({
  args: {
    projectId: v.optional(v.id("vsProjects")),
  },
  handler: async (ctx, { projectId }) => {
    const currUser = await ctx.auth.getUserIdentity();
    if (!currUser) return null;
    if (!projectId) return null;
    const application = await ctx.db
      .query("vsApplications")
      .filter((q) =>
        q.and(
          q.eq(q.field("projectId"), projectId),
          q.eq(q.field("applicant.subject"), currUser.subject)
        )
      )
      .first();
    return application;
  },
});

export const createNewApplication = internalMutation({
  args: {
    projectId: v.id("vsProjects"),
  },
  handler: async (ctx, { projectId }) => {
    const currUser = await ctx.auth.getUserIdentity();
    if (!currUser) return null;
    const newApplicationData = {
      projectId,
      applicant: currUser,
      initializationStatus: "uninitialized",
    };
    const newApplication = await ctx.db.insert(
      "vsApplications",
      newApplicationData
    );
    return newApplication;
  },
});

export const updateApplication = internalMutation({
  args: {
    applicationId: v.id("vsApplications"),
    updateDataStr: v.string(),
  },
  handler: async (ctx, { applicationId, updateDataStr }) => {
    const _updateData = JSON.parse(updateDataStr);
    const updatedApplication = await ctx.db.patch(applicationId, _updateData);
    return updatedApplication;
  },
});
