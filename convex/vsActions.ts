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

const schema_checkConditions = {
  description: "List of conditions to check",
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      title: {
        type: SchemaType.STRING,
        description:
          "A suitable title to be shown as heading for the check condition.",
        nullable: false,
      },
      description: {
        type: SchemaType.STRING,
        description: "2 sentence description of the check condition.",
        nullable: false,
      },
    },
    required: ["title", "description"],
  },
};

const schema_criteria = {
  description: "List of eligibility criteria",
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      title: {
        type: SchemaType.STRING,
        description:
          "A suitable title to be shown as heading for the criteria.",
        nullable: false,
      },
      description: {
        type: SchemaType.STRING,
        description: "2 sentence description of the criteria.",
        nullable: false,
      },
    },
    required: ["title", "description"],
  },
};

const schema_classifyDoc = {
  type: SchemaType.STRING,
  description: "The type of document.",
  nullable: false,
  enum: documentTypes.map((d) => d.value),
};

const schema_extractedInfo = {
  description: "List of information available in the document",
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      extractedInfoType: {
        type: SchemaType.STRING,
        description:
          "The type of information does the extracted data represents.",
        nullable: false,
        enum: [
          "age",
          "address",
          "name",
          "nationality",
          "earnings",
          "outstanding-taxes",
          "residency",
          "home-ownership",
        ],
      },
      extractedInfoLabel: {
        type: SchemaType.STRING,
        description: "Label used to indentify the extracted information.",
        nullable: false,
      },
      extractedInfoValue: {
        type: SchemaType.STRING,
        description: "The value of the extracted information.",
        nullable: false,
      },
    },
    required: ["extractedInfoType", "extractedInfoLabel", "extractedInfoValue"],
  },
};

const schema_checkEligibility = {
  type: SchemaType.OBJECT,
  properties: {
    isEligible: {
      type: SchemaType.BOOLEAN,
      description:
        "Value which represents if the applicant is eligible for the criteria",
      nullable: false,
    },
    reason: {
      type: SchemaType.STRING,
      description: "Reason for arriving at the decision.",
      nullable: false,
    },
  },
  required: ["isEligible", "reason"],
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

const soModel_checkConditions = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: schema_checkConditions,
  },
});

const soModel_criteria = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: schema_criteria,
  },
});

const soModel_classifyDoc = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: schema_classifyDoc,
  },
});

const soModel_extractedInfo = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: schema_extractedInfo,
  },
});

const soModel_checkEligibility = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: schema_checkEligibility,
  },
});

// UTILS

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

export const setupCheckingConditions = action({
  args: {
    projectId: v.id("vsProjects"),
  },
  handler: async (ctx, { projectId }) => {
    let updateData;
    let updatedProject;
    const writeData = {};
    writeData.eligibilityCheckObjs_Status = "generating";
    updateData = JSON.stringify(writeData);
    updatedProject = await ctx.runMutation(internal.dbOps.updateProject, {
      projectId,
      updateData,
    });

    const srcDocs = await ctx.runQuery(api.dbOps.getAllSrcDocs_ForProject, {
      projectId,
    });

    const srcDoc = srcDocs[0];

    const eligibilityCriteria = JSON.parse(srcDoc.criteria_Text);

    const ps = eligibilityCriteria.map(
      (ec: any) =>
        new Promise((resolve, reject) => {
          soModel_checkConditions
            .generateContent([
              [
                `List how to perform a check from the given documents to ensure an applicant meets the eligiblity the criteria based on following information. Keep it very short and simple. Discard information which introduces complexity.`,
                "",
                "",
                `## Eligibility Condition:`,
                "",
                ec.title,
                "",
                `## Eligibility Description:`,
                "",
                ec.description,
                "",
                `## Valid Documents:`,
                "",
                ec.valid_docs.join(","),
                "",
              ].join("\n"),
            ])
            .then((result) => {
              const conditionText = result.response.text();
              const conditionJSON = JSON.parse(conditionText);
              resolve({
                eligibilityCritera: ec,
                checkConditions: conditionJSON,
              });
            })
            .catch(reject);
        })
    );

    const eligibilityCheckObjs = (await Promise.allSettled(ps))
      .filter((p) => p.status === "fulfilled")
      .map((p) => p.value);

    writeData.eligibilityCheckObjs_Status = "generated";
    writeData.eligibilityCheckObjs_Text = JSON.stringify(eligibilityCheckObjs);
    updateData = JSON.stringify(writeData);
    updatedProject = await ctx.runMutation(internal.dbOps.updateProject, {
      projectId,
      updateData,
    });
  },
});

// DOCUSIGN

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

// https://developers.docusign.com/platform/auth/jwt/jwt-get-token/
// function createJWT(integrationKey, userId, privateKey, publicKey) {
//   const header = {
//     alg: "RS256",
//     typ: "JWT"
//   };

//   const currentTime = Math.floor(Date.now() / 1000);
//   const body = {
//     iss: integrationKey,
//     sub: userId,
//     aud: "account-d.docusign.com",
//     iat: currentTime,
//     exp: currentTime + 6000,
//     scope: "signature impersonation"
//   };

//   return jwt.sign(body, privateKey, { algorithm: "RS256", header });
// };

async function getActiveTokenForDocusign(ctx, storedUserData) {
  let docusignUserTknObj = storedUserData.docusignUserTknObj;
  const issuedAt = docusignUserTknObj.issuedAt;
  const tokenDurationInSecs = parseInt(docusignUserTknObj.expires_in);
  const expirtyTs = new Date(
    new Date(issuedAt).getTime() + (tokenDurationInSecs - 10 * 60) * 1000
  );
  const tokenNeedsRefresh =
    new Date(expirtyTs).getTime() < new Date().getTime();
  if (tokenNeedsRefresh) {
    const restApi = docusign.ApiClient.RestApi;
    const oAuth = docusign.ApiClient.OAuth;
    const basePath = restApi.BasePath.DEMO;
    const oAuthBasePath = oAuth.BasePath.DEMO;
    const apiClient = new docusign.ApiClient({
      basePath: basePath,
      oAuthBasePath: oAuthBasePath,
    });
    apiClient.addDefaultHeader(
      "Authorization",
      "Bearer " + docusignUserTknObj.access_token
    );

    const scopes = [oAuth.Scope.IMPERSONATION, oAuth.Scope.SIGNATURE];
    const userId = storedUserData.docusignUserInfo.sub;
    const expiresIn = 60 * 60;

    const res = await apiClient.requestJWTUserToken(
      process.env.DOCUSIGN_INTEGRATION_KEY,
      userId,
      scopes,
      Buffer.from(process.env.DOCUSIGN_RSA_PRV_KEY.replace(/\\n/g, "\n")),
      expiresIn
    );

    docusignUserTknObj = res.body;
    docusignUserTknObj.issuedAt = new Date().toISOString();

    const docusignUserInfo = await apiClient.getUserInfo(
      docusignUserTknObj.access_token
    );
    const userDataStr = JSON.stringify({
      docusignUserTknObj,
      docusignUserInfo,
    });
    const storedData: any = await ctx.runMutation(
      internal.dbOps.upsertUserData_ForUser,
      { userDataStr }
    );
  }
  return docusignUserTknObj;
}

export const startDocusignOAuth = action({
  args: {},
  handler: async (ctx) => {
    const restApi = docusign.ApiClient.RestApi;
    const oAuth = docusign.ApiClient.OAuth;
    const basePath = restApi.BasePath.DEMO;
    const oAuthBasePath = oAuth.BasePath.DEMO;
    const apiClient = new docusign.ApiClient({
      basePath: basePath,
      oAuthBasePath: oAuthBasePath,
    });

    const scopes = [oAuth.Scope.IMPERSONATION, oAuth.Scope.SIGNATURE];

    const oauthLoginUrl = apiClient.getAuthorizationUri(
      process.env.DOCUSIGN_INTEGRATION_KEY,
      scopes,
      `${DEV ? "http://localhost:5173" : "https://versee.vercel.app"}/callback/docusign`,
      "code"
    );
    return oauthLoginUrl;
  },
});

export const retrieveDocusignAccessToken = action({
  args: {
    authCode: v.string(),
  },
  handler: async (ctx, { authCode }) => {
    const restApi = docusign.ApiClient.RestApi;
    const oAuth = docusign.ApiClient.OAuth;
    const basePath = restApi.BasePath.DEMO;
    const oAuthBasePath = oAuth.BasePath.DEMO;
    const apiClient = new docusign.ApiClient({
      basePath: basePath,
      oAuthBasePath: oAuthBasePath,
    });

    const code = authCode;
    const docusignAccessTknObj = await apiClient.generateAccessToken(
      process.env.DOCUSIGN_INTEGRATION_KEY,
      process.env.DOCUSIGN_CLIENT_SECRET,
      code
    );
    docusignAccessTknObj.issuedAt = new Date().toISOString();
    const docusignUserInfo = await apiClient.getUserInfo(
      docusignAccessTknObj.accessToken
    );
    const userDataStr = JSON.stringify({
      docusignAccessTknObj,
      docusignUserInfo,
    });
    const storedData: any = await ctx.runMutation(
      internal.dbOps.upsertUserData_ForUser,
      { userDataStr }
    );
    return storedData;
  },
});

export const retrieveDocusignUserToken = action({
  handler: async (ctx) => {
    const storedUserData = await ctx.runQuery(
      api.dbOps.getUserData_ForCurrUser
    );

    const restApi = docusign.ApiClient.RestApi;
    const oAuth = docusign.ApiClient.OAuth;
    const basePath = restApi.BasePath.DEMO;
    const oAuthBasePath = oAuth.BasePath.DEMO;
    const apiClient = new docusign.ApiClient({
      basePath: basePath,
      oAuthBasePath: oAuthBasePath,
    });

    const scopes = [oAuth.Scope.IMPERSONATION, oAuth.Scope.SIGNATURE];
    const userId = storedUserData.docusignUserInfo.sub;
    const expiresIn = 3600;

    const res = await apiClient.requestJWTUserToken(
      process.env.DOCUSIGN_INTEGRATION_KEY,
      userId,
      scopes,
      Buffer.from(process.env.DOCUSIGN_RSA_PRV_KEY.replace(/\\n/g, "\n")),
      expiresIn
    );

    const docusignUserTknObj = res.body;
    docusignUserTknObj.issuedAt = new Date().toISOString();
    const docusignUserInfo = await apiClient.getUserInfo(
      docusignUserTknObj.access_token
    );

    const userDataStr = JSON.stringify({
      docusignUserTknObj,
      docusignUserInfo,
    });
    const storedData: any = await ctx.runMutation(
      internal.dbOps.upsertUserData_ForUser,
      { userDataStr }
    );
    return storedData;
  },
});

export const sendDocusignSigningEmail = action({
  args: {
    srcDocId: v.id("vsSrcDoc"),
  },
  handler: async (ctx, { srcDocId }) => {
    const restApi = docusign.ApiClient.RestApi;
    const oAuth = docusign.ApiClient.OAuth;
    const basePath = restApi.BasePath.DEMO;
    const oAuthBasePath = oAuth.BasePath.DEMO;
    const dsApiClient = new docusign.ApiClient({
      basePath: basePath,
      oAuthBasePath: oAuthBasePath,
    });

    const storedUserData = await ctx.runQuery(
      api.dbOps.getUserData_ForCurrUser
    );
    const accountId = storedUserData.docusignUserInfo.accounts[0].accountId;

    const docusignUserTknObj = await getActiveTokenForDocusign(
      ctx,
      storedUserData
    );
    const accessToken = docusignUserTknObj.access_token;

    const srcDoc = await ctx.runQuery(internal.dbOps.getSrcDoc_BySrcDocId, {
      srcDocId,
    });
    const fileUrl = await ctx.storage.getUrl(srcDoc.cvxStoredFileId);
    const docBytes = await downloadFileAsBytes(fileUrl);
    const doc3b64 = Buffer.from(docBytes).toString("base64");

    dsApiClient.addDefaultHeader("Authorization", "Bearer " + accessToken);
    const envelopesApi = new docusign.EnvelopesApi(dsApiClient);

    const envDef = new docusign.EnvelopeDefinition();
    envDef.emailSubject = `Please Sign: ${srcDoc.titleText}`;
    envDef.emailBlurb = srcDoc.summaryText;

    // add a document to the envelope
    const doc = new docusign.Document();
    const base64Doc = doc3b64;
    doc.documentBase64 = base64Doc;
    doc.name = "TestFile.pdf";
    doc.documentId = "1";

    const docs = [];
    docs.push(doc);
    envDef.documents = docs;

    // Add a recipient to sign the document
    const signer = new docusign.Signer();
    signer.email = "amit.lzkpa@gmail.com";
    signer.name = "Amit N";
    signer.recipientId = "1";

    // create a signHere tab somewhere on the document for the signer to sign
    // default unit of measurement is pixels, can be mms, cms, inches also
    const signHere = new docusign.SignHere();
    signHere.documentId = "1";
    signHere.pageNumber = "1";
    signHere.recipientId = "1";
    signHere.xPosition = "100";
    signHere.yPosition = "100";

    // can have multiple tabs, so need to add to envelope as a single element list
    const signHereTabs = [];
    signHereTabs.push(signHere);
    const tabs = new docusign.Tabs();
    tabs.signHereTabs = signHereTabs;
    signer.tabs = tabs;

    // Above causes issue
    envDef.recipients = new docusign.Recipients();
    envDef.recipients.signers = [];
    envDef.recipients.signers.push(signer);

    // send the envelope (otherwise it will be "created" in the Draft folder
    envDef.status = "sent";

    const envelopeSummary = await envelopesApi.createEnvelope(accountId, {
      envelopeDefinition: envDef,
    });
    return JSON.stringify(envelopeSummary);
  },
});

export const createSenderViewFromDoc = action({
  args: {
    projectId: v.id("vsProjects"),
    returnUrl: v.string(),
  },
  handler: async (ctx, { projectId, returnUrl }) => {
    // Set up docusign API client
    const restApi = docusign.ApiClient.RestApi;
    const oAuth = docusign.ApiClient.OAuth;
    const basePath = restApi.BasePath.DEMO;
    const oAuthBasePath = oAuth.BasePath.DEMO;
    const dsApiClient = new docusign.ApiClient({
      basePath: basePath,
      oAuthBasePath: oAuthBasePath,
    });

    const storedUserData = await ctx.runQuery(
      api.dbOps.getUserData_ForCurrUser
    );
    const accountId = storedUserData.docusignUserInfo.accounts[0].accountId;

    const docusignUserTknObj = await getActiveTokenForDocusign(
      ctx,
      storedUserData
    );
    const accessToken = docusignUserTknObj.access_token;
    dsApiClient.addDefaultHeader("Authorization", "Bearer " + accessToken);
    const envelopesApi = new docusign.EnvelopesApi(dsApiClient);

    // Create EnvelopeDefinition
    const envDef = new docusign.EnvelopeDefinition();
    envDef.emailSubject = `Please Sign: ENVELOP_TITLE`;
    envDef.emailBlurb = `ENVELOP_BLURB`;

    // Get project data
    const projectData = await ctx.runQuery(api.dbOps.getProject_ByProjectId, {
      projectId,
    });

    // Gather all docs
    const srcDocs = await ctx.runQuery(api.dbOps.getAllSrcDocs_ForProject, {
      projectId,
    });

    // Get docs binary data
    const ps = srcDocs.map(
      (srcDoc, idx) =>
        new Promise((resolve, reject) => {
          downloadFileAsBytes(srcDoc.fileUrl)
            .then((docBytes) => {
              const doc3b64 = Buffer.from(docBytes).toString("base64");
              const doc = new docusign.Document();
              const base64Doc = doc3b64;
              doc.documentBase64 = base64Doc;
              doc.name = `File_${idx + 1}.pdf`;
              doc.documentId = (idx + 1).toString();
              resolve(doc);
            })
            .catch((err) => {
              reject(err);
            });
        })
    );

    const docs = (await Promise.allSettled(ps))
      .filter((p) => p.status === "fulfilled")
      .map((p) => p.value);

    envDef.documents = [...docs];

    // Add signers for the document
    const signerData = projectData.signers ?? [];
    const signerObjs = signerData.map((sg, idx) => {
      const signer = new docusign.Signer();
      signer.name = sg.signerName;
      signer.email = sg.signerEmail;
      signer.recipientId = (idx + 1).toString();
      return signer;
    });

    envDef.recipients = new docusign.Recipients();
    envDef.recipients.signers = [...signerObjs];

    // Set envelope status to draft
    envDef.status = "created";

    const envelopeSummary = await envelopesApi.createEnvelope(accountId, {
      envelopeDefinition: envDef,
    });

    const envelopeId = envelopeSummary.envelopeId;

    // Generate url to add tabs to envelope

    const envelopeViewSettings = new docusign.EnvelopeViewSettings();
    envelopeViewSettings.startingScreen = "Tagger";
    envelopeViewSettings.sendButtonAction = "redirect";
    envelopeViewSettings.showBackButton = false;
    envelopeViewSettings.showHeaderActions = false;
    envelopeViewSettings.showDiscardAction = false;

    const envelopeViewRecipientSettings =
      new docusign.EnvelopeViewRecipientSettings();
    envelopeViewRecipientSettings.showEditRecipients = false;
    envelopeViewSettings.recipientSettings = envelopeViewRecipientSettings;

    const envelopeViewDocumentSettings =
      new docusign.EnvelopeViewDocumentSettings();
    envelopeViewDocumentSettings.showEditDocuments = false;
    envelopeViewDocumentSettings.showEditDocumentVisibility = false;
    envelopeViewDocumentSettings.showEditPages = false;
    envelopeViewSettings.documentSettings = envelopeViewDocumentSettings;

    const viewRequest = new docusign.EnvelopeViewRequest();
    viewRequest.returnUrl = returnUrl;
    viewRequest.viewAccess = "envelope";
    viewRequest.settings = envelopeViewSettings;

    const viewRequestResults = await envelopesApi.createSenderView(
      accountId,
      envelopeId,
      { envelopeViewRequest: viewRequest }
    );

    return {
      envelopeId,
      taggingUrl: viewRequestResults.url,
    };
  },
});

export const sendDocusignEnvelope = action({
  args: {
    projectId: v.id("vsProjects"),
    emailSubject: v.string(),
    emailBlurb: v.string(),
  },
  handler: async (ctx, { projectId, emailSubject, emailBlurb }) => {
    const project = await ctx.runQuery(api.dbOps.getProject_ByProjectId, {
      projectId,
    });

    const envelopeId = project.envelopeId;

    const restApi = docusign.ApiClient.RestApi;
    const oAuth = docusign.ApiClient.OAuth;
    const basePath = restApi.BasePath.DEMO;
    const oAuthBasePath = oAuth.BasePath.DEMO;
    const dsApiClient = new docusign.ApiClient({
      basePath: basePath,
      oAuthBasePath: oAuthBasePath,
    });

    const storedUserData = await ctx.runQuery(
      api.dbOps.getUserData_ForCurrUser
    );
    const accountId = storedUserData.docusignUserInfo.accounts[0].accountId;

    const docusignUserTknObj = await getActiveTokenForDocusign(
      ctx,
      storedUserData
    );
    const accessToken = docusignUserTknObj.access_token;

    dsApiClient.addDefaultHeader("Authorization", "Bearer " + accessToken);
    const envelopesApi = new docusign.EnvelopesApi(dsApiClient);

    const envDef = new docusign.Envelope();
    envDef.envelopeId = envelopeId;
    envDef.emailSubject = emailSubject;
    envDef.emailBlurb = emailBlurb;
    envDef.status = "sent";

    const envelopeSummary = await envelopesApi.update(accountId, envelopeId, {
      advancedUpdate: "true",
      resendEnvelope: "true",
      envelope: envDef,
    });

    return JSON.stringify(envelopeSummary);
  },
});

// GOOGLE WORKSPACE

const getActiveTokenForGWspc = async (ctx, storedUserData) => {
  let googleDriveTknObj = storedUserData.googleDriveTknObj;
  const expirtyTs = new Date(
    new Date(googleDriveTknObj.tokens.expiry_date).getTime()
  );
  const currentTs = new Date();
  const timeDifference = expirtyTs.getTime() - currentTs.getTime();
  const minutesDifference = Math.floor(timeDifference / (1000 * 60));
  const tokenNeedsRefresh = minutesDifference <= 5;

  if (tokenNeedsRefresh) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_WORKSPACE_CLIENT_ID,
      process.env.GOOGLE_WORKSPACE_SECRET,
      `http://localhost:5173/callback/google-workspace`
    );
    oauth2Client.setCredentials(googleDriveTknObj.tokens);

    const refreshedToken = await oauth2Client.refreshAccessToken();
    const tokens = refreshedToken.credentials;

    googleDriveTknObj = {
      tokens,
      issuedAt: new Date().toISOString(),
    };

    const userDataStr = JSON.stringify({
      googleDriveTknObj,
    });
    const storedData: any = await ctx.runMutation(
      internal.dbOps.upsertUserData_ForUser,
      { userDataStr }
    );
  }

  return googleDriveTknObj;
};

export const startGWspcOAuth = action({
  args: {},
  handler: async (ctx) => {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_WORKSPACE_CLIENT_ID,
      process.env.GOOGLE_WORKSPACE_SECRET,
      `${DEV ? "http://localhost:5173" : "https://versee.vercel.app"}/callback/google-workspace`
    );

    const scopes = [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/spreadsheets",
    ];

    const oauthLoginUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
    });

    return oauthLoginUrl;
  },
});

export const retrieveGWspcToken = action({
  args: {
    authCode: v.string(),
  },
  handler: async (ctx, { authCode }) => {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_WORKSPACE_CLIENT_ID,
      process.env.GOOGLE_WORKSPACE_SECRET,
      `${DEV ? "http://localhost:5173" : "https://versee.vercel.app"}/callback/google-workspace`
    );
    const { tokens } = await oauth2Client.getToken(authCode);

    const googleDriveTknObj = {
      tokens,
      issuedAt: new Date().toISOString(),
    };

    const userDataStr = JSON.stringify({
      googleDriveTknObj,
    });
    const storedData: any = await ctx.runMutation(
      internal.dbOps.upsertUserData_ForUser,
      { userDataStr }
    );
    return storedData;
  },
});

export const test_readSheet = action({
  args: {
    sheetId: v.string(),
    sheetRange: v.string(),
  },
  handler: async (ctx, { sheetId, sheetRange }) => {
    const storedUserData = await ctx.runQuery(
      api.dbOps.getUserData_ForCurrUser
    );

    const googleDriveTknObj = await getActiveTokenForGWspc(ctx, storedUserData);

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_WORKSPACE_CLIENT_ID,
      process.env.GOOGLE_WORKSPACE_SECRET,
      `http://localhost:5173/callback/google-workspace`
    );

    oauth2Client.setCredentials(googleDriveTknObj.tokens);

    const sheetsSdk = google.sheets({ version: "v4", auth: oauth2Client });

    const res = await sheetsSdk.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: sheetRange,
    });

    return res.data;
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

const generateForPDF_criteria = async (pdfArrayBuffer) => {
  const result = await soModel_criteria.generateContent([
    {
      inlineData: {
        data: Buffer.from(pdfArrayBuffer).toString("base64"),
        mimeType: "application/pdf",
      },
    },
    "Extract criterias relevant for applicants described in the PDF. List only 1 criteria in each item. Keep it very short and simple. Discard information which introduces complexity.",
  ]);
  const criteria = result.response.text();
  return criteria;
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

    writeData.criteria_Status = "generating";
    uploadedFileData = await ctx.runMutation(internal.dbOps.updateSrcDoc, {
      srcDocId,
      updateDataStr: JSON.stringify(writeData),
    });
    const criteria_Text = await generateForPDF_criteria(pdfArrayBuffer);
    writeData.criteria_Status = "generated";
    writeData.criteria_Text = criteria_Text;
    uploadedFileData = await ctx.runMutation(internal.dbOps.updateSrcDoc, {
      srcDocId,
      updateDataStr: JSON.stringify(writeData),
    });
  },
});

// PRJFILE

const generateForPDF_classifyDoc = async (pdfArrayBuffer) => {
  const result = await soModel_classifyDoc.generateContent([
    {
      inlineData: {
        data: Buffer.from(pdfArrayBuffer).toString("base64"),
        mimeType: "application/pdf",
      },
    },
    "Categorize the type of document.",
  ]);
  const classifyDoc = result.response.text();
  return classifyDoc;
};

const generateForPDF_extractedInfo = async (pdfArrayBuffer) => {
  const result = await soModel_extractedInfo.generateContent([
    {
      inlineData: {
        data: Buffer.from(pdfArrayBuffer).toString("base64"),
        mimeType: "application/pdf",
      },
    },
    "Extract all available information about the applicant from the document.",
  ]);
  const extractedInfo = result.response.text();
  return extractedInfo;
};

const verifyInfo_prjFile = async (extractedInfoText, classifyDocText) => {
  const documentEnums = documentTypes.map((d: any) => d?.value);
  return documentEnums.includes(classifyDocText) ? "verified" : "unverified";
};

export const createNewPrjFile = action({
  args: {
    cvxStoredFileId: v.string(),
    applicationId: v.id("vsApplications"),
    projectId: v.string(),
  },
  handler: async (ctx, { cvxStoredFileId, projectId, applicationId }) => {
    const _cvxStoredFileId = cvxStoredFileId as Id<"_storage">;
    const _projectId = projectId as Id<"vsProjects">;
    const _applicationId = applicationId as Id<"vsApplications">;
    const writeData = {
      cvxStoredFileId: _cvxStoredFileId,
      projectId: _projectId,
      applicationId: _applicationId,
    };
    const newPrjFileId: any = await ctx.runMutation(
      internal.dbOps.createNewPrjFile,
      writeData
    );
    (async () => {
      ctx.scheduler.runAfter(0, api.vsActions.analysePrjFile, {
        prjFileId: newPrjFileId,
      });
    })();
    return newPrjFileId;
  },
});

export const deletePrjFile = action({
  args: {
    prjFileId: v.id("vsPrjFile"),
  },
  handler: async (ctx, { prjFileId }) => {
    const prjFile = await ctx.runQuery(api.dbOps.getPrjFile_ByPrjFileId, {
      prjFileId,
    });
    const assocApplicationId = prjFile.applicationId;
    const cvxStoredFileId = prjFile.cvxStoredFileId;
    const deletedPrjFileId: any = await ctx.runMutation(
      internal.dbOps.deletePrjFile,
      { prjFileId }
    );
    await ctx.storage.delete(cvxStoredFileId);
    (async () => {
      ctx.scheduler.runAfter(0, api.vsActions.analyseApplication, {
        applicationId: assocApplicationId,
      });
    })();
    return deletedPrjFileId;
  },
});

export const analysePrjFile = action({
  args: {
    prjFileId: v.id("vsPrjFile"),
  },
  handler: async (ctx, { prjFileId }) => {
    const prjFile = await ctx.runQuery(internal.dbOps.getPrjFile_ByPrjFileId, {
      prjFileId,
    });
    const fileUrl = await ctx.storage.getUrl(prjFile.cvxStoredFileId);

    const pdfArrayBuffer = await fetch(fileUrl).then((response) =>
      response.arrayBuffer()
    );

    let uploadedFileData;

    const writeData = {};

    writeData.titleStatus = "generating";
    uploadedFileData = await ctx.runMutation(internal.dbOps.updatePrjFile, {
      prjFileId,
      updateDataStr: JSON.stringify(writeData),
    });

    const titleText = await generateForPDF_title(pdfArrayBuffer);
    writeData.titleStatus = "generated";
    writeData.titleText = titleText;
    uploadedFileData = await ctx.runMutation(internal.dbOps.updatePrjFile, {
      prjFileId,
      updateDataStr: JSON.stringify(writeData),
    });

    writeData.summaryStatus = "generating";
    uploadedFileData = await ctx.runMutation(internal.dbOps.updatePrjFile, {
      prjFileId,
      updateDataStr: JSON.stringify(writeData),
    });
    const summaryText = await generateForPDF_summary(pdfArrayBuffer);
    writeData.summaryStatus = "generated";
    writeData.summaryText = summaryText;
    uploadedFileData = await ctx.runMutation(internal.dbOps.updatePrjFile, {
      prjFileId,
      updateDataStr: JSON.stringify(writeData),
    });

    writeData.classifyDocStatus = "generating";
    uploadedFileData = await ctx.runMutation(internal.dbOps.updatePrjFile, {
      prjFileId,
      updateDataStr: JSON.stringify(writeData),
    });
    const classifyDocText = await generateForPDF_classifyDoc(pdfArrayBuffer);
    writeData.classifyDocStatus = "generated";
    writeData.classifyDocText = classifyDocText;
    uploadedFileData = await ctx.runMutation(internal.dbOps.updatePrjFile, {
      prjFileId,
      updateDataStr: JSON.stringify(writeData),
    });

    writeData.extractedInfoStatus = "generating";
    uploadedFileData = await ctx.runMutation(internal.dbOps.updatePrjFile, {
      prjFileId,
      updateDataStr: JSON.stringify(writeData),
    });
    const extractedInfoText =
      await generateForPDF_extractedInfo(pdfArrayBuffer);
    writeData.extractedInfoStatus = "generated";
    writeData.extractedInfoText = extractedInfoText;
    uploadedFileData = await ctx.runMutation(internal.dbOps.updatePrjFile, {
      prjFileId,
      updateDataStr: JSON.stringify(writeData),
    });

    writeData.verificationStatus = "unverified";
    uploadedFileData = await ctx.runMutation(internal.dbOps.updatePrjFile, {
      prjFileId,
      updateDataStr: JSON.stringify(writeData),
    });
    const verificationResult = await verifyInfo_prjFile(
      extractedInfoText,
      classifyDocText
    );
    writeData.verificationStatus = verificationResult;
    uploadedFileData = await ctx.runMutation(internal.dbOps.updatePrjFile, {
      prjFileId,
      updateDataStr: JSON.stringify(writeData),
    });

    (async () => {
      ctx.scheduler.runAfter(0, api.vsActions.analyseApplication, {
        applicationId: assocApplicationId,
      });
    })();
  },
});

// APPLICATIONS

const checkEligibility = async (promptText) => {
  const result = await soModel_checkEligibility.generateContent(promptText);
  const checkResult = result.response.text();
  return checkResult;
};

export const createNewApplication = action({
  args: {
    projectId: v.id("vsProjects"),
  },
  handler: async (ctx, { projectId }) => {
    const newApplication: any = await ctx.runMutation(
      internal.dbOps.createNewApplication,
      { projectId }
    );
    return newApplication;
  },
});

export const updateApplication = action({
  args: {
    applicationId: v.id("vsApplications"),
    updateDataStr: v.string(),
  },
  handler: async (ctx, { applicationId, updateDataStr }) => {
    const updatedApplication: any = await ctx.runMutation(
      internal.dbOps.updateApplication,
      { applicationId, updateDataStr }
    );
    return updatedApplication;
  },
});

export const analyseApplication = action({
  args: {
    applicationId: v.id("vsApplications"),
  },
  handler: async (ctx, { applicationId }) => {
    const writeData = {};

    writeData.eligibilityCheckResultStatus = "generating";
    await ctx.runMutation(internal.dbOps.updateApplication, {
      applicationId,
      updateDataStr: JSON.stringify(writeData),
    });

    const application = await ctx.runQuery(
      api.dbOps.getApplication_ByApplicationId,
      { applicationId }
    );

    const project = await ctx.runQuery(api.dbOps.getProject_ByProjectId, {
      projectId: application.projectId,
    });

    const srcDocs = await ctx.runQuery(api.dbOps.getAllSrcDocs_ForProject, {
      projectId: application.projectId,
    });

    const prjFiles = await ctx.runQuery(
      api.dbOps.getAllPrjFiles_ForApplication,
      {
        applicationId: application._id,
      }
    );

    const allExtractedInfo = prjFiles
      .map((pf, docIdx) => {
        const infoObjs = JSON.parse(pf.extractedInfoText);
        const extractedInfoList = infoObjs
          .map((io) => `- ${io.extractedInfoLabel}: ${io.extractedInfoValue}`)
          .join("\n");
        const textLines = [
          "",
          `${docIdx + 1}.`,
          `Document Name: ${pf.titleText}`,
          `Document Type: ${pf.classifyDocText}`,
          `Verification Status: ${pf.verificationStatus}`,
          "",
          `Summary`,
          "",
          `${pf.summaryText}`,
          `Extracted Information`,
          "",
          `${extractedInfoList}`,
          "",
        ].join("\n");
        return textLines;
      })
      .join("\n");

    const eligibilityObjs = JSON.parse(project.eligibilityCheckObjs_Text);
    // const ppo = JSON.parse(project.eligibilityCheckObjs_Text);
    // const eligibilityObjs = [ppo[0]];

    const ps = eligibilityObjs.map(
      (eo: any, eoIdx: number) =>
        new Promise((resolve, reject) => {
          const checkSteps = eo.checkConditions
            .map((cc) => `- ${cc.description}`)
            .join("\n");

          const promptText = [
            "Check if the applicant meets this criteria. Criteria and applicant details are given below. If there are specific document types listed as valid docs be strict about checking the associated information only in the relevant document type. If there are no documents uploaded for a certain condition assume it should be marked as ineligible. Based on that respond with a decision if the applicant is eligible or not. Also include a reason for the decision.",
            "",
            "",
            "## Criteria Details",
            "",
            `Criteria Name: ${eo.eligibilityCritera.title}`,
            `Criteria Description: ${eo.eligibilityCritera.description}`,
            `Documents To Refer: ${eo.eligibilityCritera.valid_docs.join(",")}`,
            "",
            "## How to Check",
            "",
            checkSteps,
            "",
            "## Applicant Details",
            "",
            allExtractedInfo,
            "",
          ].join("\n");

          checkEligibility(promptText)
            .then((checkResultStr) => {
              resolve({
                ...JSON.parse(checkResultStr),
                forEligibityObjIdx: eoIdx,
              });
            })
            .catch((err) => {
              console.log(err);
              reject(err);
            });
        })
    );

    const eligibilityCheckResult = (await Promise.allSettled(ps))
      .filter((p) => p.status === "fulfilled")
      .map((p) => p.value);

    console.log(eligibilityCheckResult);

    writeData.eligibilityCheckResult = JSON.stringify(eligibilityCheckResult);
    writeData.eligibilityCheckResultStatus = "generated";
    await ctx.runMutation(internal.dbOps.updateApplication, {
      applicationId,
      updateDataStr: JSON.stringify(writeData),
    });
  },
});

export const createNewReply = action({
  args: {
    applicationId: v.id("vsApplications"),
    msgsStr: v.string(),
  },
  handler: async (ctx, { applicationId, msgsStr }) => {
    const msgsRcvd = JSON.parse(msgsStr);
    const convHistory = msgsRcvd
      .map((msg) => `${msg.author}: ${msg.rawContent}`)
      .join("\n");
    console.log(convHistory);

    const application = await ctx.runQuery(
      api.dbOps.getApplication_ByApplicationId,
      { applicationId }
    );

    const srcDocs = await ctx.runQuery(api.dbOps.getAllSrcDocs_ForProject, {
      projectId: application.projectId,
    });

    const srcDoc = srcDocs[0];

    const fileUrl = await ctx.storage.getUrl(srcDoc.cvxStoredFileId);

    const pdfArrayBuffer = await fetch(fileUrl).then((response) =>
      response.arrayBuffer()
    );

    const promptText = [
      "Use the document as a reference and generate a brief, helpful response to continue the conversation below.",
      "Format the response in markdown and return only the response.",
      "Keep the responses brief.",
      // "Use tables and other formatting to explain and summarize information.",
      "Say you are not sure about the response if the answer to any questions isn't simple.",
      "Try to be helpful and mention the page numbers for any retrieved information.",
      "",
      "## Convsation History",
      convHistory,
      "",
    ].join("\n\n");

    const result = await txtModel_texts.generateContent([
      {
        inlineData: {
          data: Buffer.from(pdfArrayBuffer).toString("base64"),
          mimeType: "application/pdf",
        },
      },
      promptText,
    ]);
    const response = result.response.text();
    return response;
  },
});
