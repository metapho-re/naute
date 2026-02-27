import type { CreateNoteRequest, UpdateNoteRequest } from "@naute/shared";
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import {
  createNote,
  deleteNote,
  findNote,
  listNotes,
  updateNote,
} from "./notes";

const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Content-Type": "application/json",
};

const getSuccessResponse = (body: unknown, statusCode = 200) => ({
  statusCode,
  headers: corsHeaders,
  body: JSON.stringify({ data: body }),
});

const getErrorResponse = (message: string, statusCode = 400) => ({
  statusCode,
  headers: corsHeaders,
  body: JSON.stringify({ error: message }),
});

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const method = event.httpMethod;
  const id = event.pathParameters?.id;

  const route = `${method} ${id ? "/notes/:id" : "/notes"}`;

  try {
    switch (route) {
      case "GET /notes": {
        const result = await listNotes();

        return getSuccessResponse(result);
      }

      case "POST /notes": {
        const body = JSON.parse(event.body || "{}") as CreateNoteRequest;
        const note = await createNote(body);

        return getSuccessResponse(note, 201);
      }

      case "GET /notes/:id": {
        const note = await findNote(id!);

        return getSuccessResponse(note);
      }

      case "PUT /notes/:id": {
        const body = JSON.parse(event.body || "{}") as UpdateNoteRequest;
        const note = await updateNote(id!, body);

        return getSuccessResponse(note);
      }

      case "DELETE /notes/:id": {
        await deleteNote(id as string);

        return getSuccessResponse(null, 204);
      }

      default:
        return getErrorResponse("Method not allowed", 405);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === "ValidationError") {
        return getErrorResponse(error.message, 400);
      }

      if (error.name === "NotFoundError") {
        return getErrorResponse(error.message, 404);
      }
    }

    return getErrorResponse("Internal server error", 500);
  }
};
