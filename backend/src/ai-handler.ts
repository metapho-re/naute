import type { GenerateNoteRequest } from "@naute/shared";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import type { Writable } from "node:stream";

import { generateNote } from "./ai-service";
import { verifyToken } from "./jwt";

const HEARTBEAT_INTERVAL_MS = 10_000;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
};

export const handler = awslambda.streamifyResponse(
  async (event: APIGatewayProxyEventV2, responseStream: Writable) => {
    const httpMethod = event.requestContext.http.method;
    const headers = event.headers;

    if (httpMethod === "OPTIONS") {
      const stream = awslambda.HttpResponseStream.from(responseStream, {
        statusCode: 204,
        headers: { ...CORS_HEADERS, "Content-Type": "text/plain" },
      });

      stream.end();

      return;
    }

    let stream: Writable | null = null;
    let heartbeat: ReturnType<typeof setInterval> | null = null;

    try {
      await verifyToken(headers["authorization"]);

      stream = awslambda.HttpResponseStream.from(responseStream, {
        statusCode: 200,
        headers: CORS_HEADERS,
      });

      heartbeat = setInterval(() => {
        stream!.write(": heartbeat\n\n");
      }, HEARTBEAT_INTERVAL_MS);

      const body = JSON.parse(event.body || "{}") as GenerateNoteRequest;

      const data = await generateNote(body);

      stream.write(`data: ${JSON.stringify({ data })}\n\n`);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal server error";
      const statusCode =
        error instanceof Error && error.message.includes("Authorization")
          ? 401
          : 500;

      if (!stream) {
        stream = awslambda.HttpResponseStream.from(responseStream, {
          statusCode,
          headers: CORS_HEADERS,
        });
      }

      stream.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    } finally {
      if (heartbeat) {
        clearInterval(heartbeat);
      }

      if (stream) {
        stream.end();
      }
    }
  },
);
