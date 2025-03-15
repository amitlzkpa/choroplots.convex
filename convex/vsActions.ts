// @ts-nocheck
"use node";
import * as https from "https";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";

import { google } from "googleapis";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
// import jwt from "jsonwebtoken";
import * as docusign from "docusign-esign";

import { documentTypes } from "../common/documentTypes";

let DEV = true;
DEV = false;

const wait = async function (ms) {
  return new Promise((resolve) => setTimeout(() => resolve(), ms));
};

// SCHEMAS

const key_map_data = {
  description: "List of key regions and actors in the map.",
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      title: {
        type: SchemaType.STRING,
        description: "A suitable title to be shown for the region or actor.",
        nullable: false,
      },
      description: {
        type: SchemaType.STRING,
        description: "2 sentence description of the region or actor.",
        nullable: false,
      },
      type: {
        type: SchemaType.STRING,
        description: "Type of the region or actor.",
        nullable: false,
        enum: ["region", "actor"],
      }
    },
    required: ["title", "description", "type"],
  },
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const txtModel_texts = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const mapProcessingModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: key_map_data,
  },
});

// UTILS

async function downloadFileAsBytes(url: string): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    https
      .get(url, (response) => {
        const chunks: Buffer[] = [];
        response.on("data", (chunk) => {
          chunks.push(chunk);
        });
        response.on("end", () => {
          const buffer = Buffer.concat(chunks);
          resolve(buffer);
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

export const generateUploadUrl = action(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// PROJECT

export const createNewProject = action({
  handler: async (ctx) => {
    const newProject: any = await ctx.runMutation(
      internal.dbOps.createNewProject
    );
    return newProject;
  },
});

export const updateProject = action({
  args: {
    projectId: v.id("vsProjects"),
    updateData: v.string(),
  },
  handler: async (ctx, { projectId, updateData }) => {
    const updatedProject: any = await ctx.runMutation(
      internal.dbOps.updateProject,
      { projectId, updateData }
    );
    return updatedProject;
  },
});

// STOREDFILES

const extractData_keyMapData = async (arrayBuffer) => {
  const result = await mapProcessingModel.generateContent([
    {
      inlineData: {
        data: Buffer.from(arrayBuffer).toString("base64"),
        mimeType: "image/png",
      },
    },
    "Extract the key regions and actors in the map.",
  ]);
  return result.response.text();
};

export const createNewStoredFile = action({
  args: {
    cvxStoredFileId: v.string(),
    projectId: v.string(),
  },
  handler: async (ctx, { cvxStoredFileId, projectId }) => {
    const _cvxStoredFileId = cvxStoredFileId as Id<"_storage">;
    const _projectId = projectId as Id<"vsProjects">;
    const writeData = {
      cvxStoredFileId: _cvxStoredFileId,
      projectId: _projectId,
    };
    const newStoredFileId: any = await ctx.runMutation(
      internal.dbOps.createNewStoredFile,
      writeData
    );
    // ctx.runAction(api.vsActions.analyseStoredFile, { storedFileId: newStoredFileId });
    return newStoredFileId;
  },
});

export const updateStoredFile = action({
  args: {
    storedFileId: v.id("vsStoredFile"),
    updateDataStr: v.string(),
  },
  handler: async (ctx, { storedFileId, updateDataStr }) => {
    const updatedStoredFile: any = await ctx.runMutation(
      internal.dbOps.updateStoredFile,
      { storedFileId, updateDataStr }
    );
    return updatedStoredFile;
  },
});

export const analyseStoredFile = action({
  args: {
    storedFileId: v.id("vsStoredFile"),
  },
  handler: async (ctx, { storedFileId }) => {
    const storedFile = await ctx.runQuery(internal.dbOps.getStoredFile_ByStoredFileId, {
      storedFileId,
    });
    const fileUrl = await ctx.storage.getUrl(storedFile.cvxStoredFileId);

    const arrayBuffer = await fetch(fileUrl).then((response) =>
      response.arrayBuffer()
    );

    let uploadedFileData;

    const writeData = {};

    writeData.keyMapData_Status = "generating";
    uploadedFileData = await ctx.runMutation(internal.dbOps.updateStoredFile, {
      storedFileId,
      updateDataStr: JSON.stringify(writeData),
    });
    const keyMapData_Text = await extractData_keyMapData(arrayBuffer);
    writeData.keyMapData_Status = "generated";
    writeData.keyMapData_Text = keyMapData_Text;
    uploadedFileData = await ctx.runMutation(internal.dbOps.updateStoredFile, {
      storedFileId,
      updateDataStr: JSON.stringify(writeData),
    });
  },
});

// MAPS

export const mapCreate = action({
  args: {
    text: v.string(),
  },
  handler: async (ctx, { text }) => {
    const map = await ctx.runMutation(internal.dbOps.createNewMap, {
      text,
    });
    return map;
  },
});

export const debugAction = action({
  args: {
  },
  handler: async (ctx, { text }) => {

    await ctx.runAction(api.vsActions.analyseStoredFile,
      { storedFileId: "j97d40kpcjxh77bkqrce58jdw97c41a0" }
    );

    console.log("analysis done");
  },
});