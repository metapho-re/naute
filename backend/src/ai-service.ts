import Anthropic from "@anthropic-ai/sdk";
import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import type { GenerateNoteRequest, GenerateNoteResponse } from "@naute/shared";

import { TAG_PATTERN, validatePrompt } from "./errors";

let cachedApiKey: string | null = null;

const SYSTEM_PROMPT = `You are a note generation assistant. Given a user prompt, generate a well-structured markdown note.

Return ONLY valid JSON with this exact structure:
{
  "title": "A concise, descriptive title (max 200 characters)",
  "content": "Well-structured markdown content",
  "tags": ["lowercase-kebab-case-tags"]
}

Rules:
- title: concise and descriptive, max 200 characters
- content: well-structured markdown with headings, lists, code blocks as appropriate
- tags: 1-5 tags, lowercase kebab-case only (e.g. "machine-learning", "javascript")
- Return ONLY the JSON object, no other text`;

const ssmClient = new SSMClient();

const getApiKey = async (): Promise<string> => {
  if (cachedApiKey) {
    return cachedApiKey;
  }

  const result = await ssmClient.send(
    new GetParameterCommand({
      Name: "/naute/anthropic-api-key",
      WithDecryption: true,
    }),
  );

  const value = result.Parameter?.Value;

  if (!value) {
    throw new Error("Failed to retrieve Anthropic API key from SSM");
  }

  cachedApiKey = value;

  return value;
};

export const generateNote = async (
  req: GenerateNoteRequest,
): Promise<GenerateNoteResponse> => {
  validatePrompt(req.prompt);

  const apiKey = await getApiKey();
  const claudeApiClient = new Anthropic({ apiKey });

  const response = await claudeApiClient.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: req.prompt }],
  });

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === "text",
  );

  if (!textBlock) {
    throw new Error("No text response from Claude");
  }

  let note: GenerateNoteResponse;

  try {
    const json = textBlock.text
      .trim()
      .replace(/^```(?:json)?\s*/, "")
      .replace(/\s*```$/, "");

    note = JSON.parse(json) as GenerateNoteResponse;
  } catch (e) {
    console.error(
      "Failed to parse Claude response as JSON:",
      e,
      textBlock.text,
    );

    throw new Error("Failed to parse Claude response as JSON");
  }

  if (!note.title || !note.content || !Array.isArray(note.tags)) {
    console.error(
      "Invalid response structure from Claude:",
      JSON.stringify(note),
    );

    throw new Error("Invalid response structure from Claude");
  }

  return {
    title: note.title.slice(0, 200),
    content: note.content,
    tags: note.tags.filter((tag) => TAG_PATTERN.test(tag)).slice(0, 5),
  };
};
