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

const schema_offerings = {
  description: "List of offerings",
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      title: {
        type: SchemaType.STRING,
        description: "A suitable title to be shown for the offering.",
        nullable: false,
      },
      description: {
        type: SchemaType.STRING,
        description: "2 sentence description of what is being offered.",
        nullable: false,
      },
      quantity: {
        type: SchemaType.NUMBER,
        description:
          "Quantity of what is being made available (without units).",
        nullable: false,
      },
      units: {
        type: SchemaType.STRING,
        description: "Units for the quantity of what is being offered.",
        nullable: false,
      },
    },
    required: ["title", "description", "quantity", "units"],
  },
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const txtModel_texts = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const soModel_offerings = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: schema_offerings,
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

// SRCDOCS

const generateForPDF_offerings = async (pdfArrayBuffer) => {
  const result = await soModel_offerings.generateContent([
    {
      inlineData: {
        data: Buffer.from(pdfArrayBuffer).toString("base64"),
        mimeType: "application/pdf",
      },
    },
    "Extract the key offerings made available for applicants through this PDF.",
  ]);
  const offerings = result.response.text();
  return offerings;
};

const generateForPDF_title = async (pdfArrayBuffer) => {
  const result = await txtModel_texts.generateContent([
    {
      inlineData: {
        data: Buffer.from(pdfArrayBuffer).toString("base64"),
        mimeType: "application/pdf",
      },
    },
    "Give a short title for this document. Keep it simple and don't use any formatting. Reply directly with one single suitable title.",
  ]);
  const titleText = result.response.text();
  return titleText;
};

const generateForPDF_summary = async (pdfArrayBuffer) => {
  const result = await txtModel_texts.generateContent([
    {
      inlineData: {
        data: Buffer.from(pdfArrayBuffer).toString("base64"),
        mimeType: "application/pdf",
      },
    },
    "Give a very short description of the contents of this document in 1-2 sentences. Keep it simple and don't use any formatting. Reply directly with the answer. Eg: 'New York City's public housing scheme outlining eligibility criteria, application processes and available categories'",
  ]);
  const summaryText = result.response.text();
  return summaryText;
};

export const createNewSrcDoc = action({
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
    const newSrcDocId: any = await ctx.runMutation(
      internal.dbOps.createNewSrcDoc,
      writeData
    );
    ctx.runAction(api.vsActions.analyseSrcDoc, { srcDocId: newSrcDocId });
    return newSrcDocId;
  },
});

export const updateSrcDoc = action({
  args: {
    srcDocId: v.id("vsSrcDoc"),
    updateDataStr: v.string(),
  },
  handler: async (ctx, { srcDocId, updateDataStr }) => {
    const updatedSrcDoc: any = await ctx.runMutation(
      internal.dbOps.updateSrcDoc,
      { srcDocId, updateDataStr }
    );
    return updatedSrcDoc;
  },
});

export const analyseSrcDoc = action({
  args: {
    srcDocId: v.id("vsSrcDoc"),
  },
  handler: async (ctx, { srcDocId }) => {
    const srcDoc = await ctx.runQuery(internal.dbOps.getSrcDoc_BySrcDocId, {
      srcDocId,
    });
    const fileUrl = await ctx.storage.getUrl(srcDoc.cvxStoredFileId);

    const pdfArrayBuffer = await fetch(fileUrl).then((response) =>
      response.arrayBuffer()
    );

    let uploadedFileData;

    const writeData = { titleStatus: "generating" };

    uploadedFileData = await ctx.runMutation(internal.dbOps.updateSrcDoc, {
      srcDocId,
      updateDataStr: JSON.stringify(writeData),
    });
    const titleText = await generateForPDF_title(pdfArrayBuffer);
    writeData.titleStatus = "generated";
    writeData.titleText = titleText;
    uploadedFileData = await ctx.runMutation(internal.dbOps.updateSrcDoc, {
      srcDocId,
      updateDataStr: JSON.stringify(writeData),
    });

    writeData.summaryStatus = "generating";
    uploadedFileData = await ctx.runMutation(internal.dbOps.updateSrcDoc, {
      srcDocId,
      updateDataStr: JSON.stringify(writeData),
    });
    const summaryText = await generateForPDF_summary(pdfArrayBuffer);
    writeData.summaryStatus = "generated";
    writeData.summaryText = summaryText;
    uploadedFileData = await ctx.runMutation(internal.dbOps.updateSrcDoc, {
      srcDocId,
      updateDataStr: JSON.stringify(writeData),
    });

    writeData.offerings_Status = "generating";
    uploadedFileData = await ctx.runMutation(internal.dbOps.updateSrcDoc, {
      srcDocId,
      updateDataStr: JSON.stringify(writeData),
    });
    const offerings_Text = await generateForPDF_offerings(pdfArrayBuffer);
    writeData.offerings_Status = "generated";
    writeData.offerings_Text = offerings_Text;
    uploadedFileData = await ctx.runMutation(internal.dbOps.updateSrcDoc, {
      srcDocId,
      updateDataStr: JSON.stringify(writeData),
    });
  },
});
