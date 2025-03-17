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

let DEV = true;
DEV = false;

const wait = async function (ms) {
  return new Promise((resolve) => setTimeout(() => resolve(), ms));
};

// SCHEMAS

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// GENERIC TEXTS

const txtModel_texts = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// KEY MAP DATA

const prompt_keyMapData = "Extract the key regions from the map. Only use the map to determine the regions. Do not make up any regions or any information source other than the map.";

const schema_keyMapData = {
  description: "List of key regions in the map.",
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      title: {
        type: SchemaType.STRING,
        description: "A suitable title to be shown for the region.",
        nullable: false,
      },
      description: {
        type: SchemaType.STRING,
        description: "2 sentence description of the region.",
        nullable: false,
      }
    },
    required: ["title", "description"],
  },
};

const geminiModel_keyMapData = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: schema_keyMapData,
  },
});

const extractData_keyMapData = async (fileArrayBuffer, fileMimeType) => {
  const result = await geminiModel_keyMapData.generateContent([
    {
      inlineData: {
        data: Buffer.from(fileArrayBuffer).toString("base64"),
        mimeType: fileMimeType,
      },
    },
    prompt_keyMapData
  ]);
  return result.response.text();
};

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
    ctx.runAction(api.vsActions.analyseStoredFile, { storedFileId: newStoredFileId });
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

    const fileMetaData = await ctx.storage.getMetadata(storedFile.cvxStoredFileId);

    const fileMimeType = fileMetaData.contentType;

    const fileArrayBuffer = await fetch(fileUrl).then((response) =>
      response.arrayBuffer()
    );

    let uploadedFileData;

    const writeData = {};

    writeData.keyMapData_Status = "generating";
    uploadedFileData = await ctx.runMutation(internal.dbOps.updateStoredFile, {
      storedFileId,
      updateDataStr: JSON.stringify(writeData),
    });
    const keyMapData_Text = await extractData_keyMapData(fileArrayBuffer, fileMimeType);
    writeData.keyMapData_Status = "generated";
    writeData.keyMapData_Text = keyMapData_Text;
    uploadedFileData = await ctx.runMutation(internal.dbOps.updateStoredFile, {
      storedFileId,
      updateDataStr: JSON.stringify(writeData),
    });
  },
});

// DEBUG

export const debugAction = action({
  args: {},
  handler: async (ctx) => {

    await ctx.runAction(api.vsActions.analyseStoredFile,
      { storedFileId: "j97d40kpcjxh77bkqrce58jdw97c41a0" }
    );

    console.log("analysis done");
  },
});

// STABLE DIFFUSION

async function checkStabilityBalance() {
  const response = await fetch(
    "https://api.stability.ai/v1/user/balance",
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${process.env.STABILITY_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Stability API error: ${response.statusText}`);
  }

  const balance = await response.json();
  console.log("Stability API Balance:", balance);
  return balance;
};


export const stableDiffusionAction = action({
  args: {},
  handler: async (ctx) => {

    try {

      const balance = await checkStabilityBalance();
      console.log("Stability API Balance:", balance);

      return balance;

    } catch (error) {
      console.error("Error checking Stability API:", error);
      throw error;
    }
  }
});




// FALLACY EXTRACTION (untested)

const prompt_fallacyExtraction = "Extract a list of logical fallacies from the image. Each fallacy should include an id, name, explainer, and example. Ensure the details are accurate.";

const schema_fallacyExtraction = {
  description: "List of logical fallacies extracted from the image.",
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      id: {
        type: SchemaType.STRING,
        description: "A unique identifier for the fallacy.",
        nullable: false,
      },
      name: {
        type: SchemaType.STRING,
        description: "The name of the logical fallacy.",
        nullable: false,
      },
      explainer: {
        type: SchemaType.STRING,
        description: "A brief explanation of the fallacy.",
        nullable: false,
      },
      example: {
        type: SchemaType.STRING,
        description: "An example illustrating the fallacy.",
        nullable: false,
      }
    },
    required: ["id", "name", "explainer", "example"],
  },
};

const geminiModel_fallacyExtraction = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: schema_fallacyExtraction,
  },
});

const extractFallaciesFromImage = async (fileArrayBuffer, fileMimeType) => {
  const result = await geminiModel_fallacyExtraction.generateContent([
    {
      inlineData: {
        data: Buffer.from(fileArrayBuffer).toString("base64"),
        mimeType: fileMimeType,
      },
    },
    prompt_fallacyExtraction
  ]);
  return result.response.text();
};

export const fallacyExtractionAction = action({
  args: {
    fileUrl: v.string(),
  },
  handler: async (ctx) => {

    const fileArrayBuffer = await fetch(fileUrl).then((response) =>
      response.arrayBuffer()
    );

    const fileMimeType = "image/png";

    const fallacyExtractionData_Text = await extractFallaciesFromImage(fileArrayBuffer, fileMimeType);

    console.log("analysis done");
  },
});