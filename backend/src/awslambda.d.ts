import type { APIGatewayProxyEventV2, Context, Handler } from "aws-lambda";
import type { Writable } from "node:stream";

declare global {
  namespace awslambda {
    const HttpResponseStream: {
      from(
        stream: Writable,
        metadata: {
          statusCode: number;
          headers?: Record<string, string>;
        },
      ): Writable;
    };

    const streamifyResponse: (
      handler: (
        event: APIGatewayProxyEventV2,
        responseStream: Writable,
        context: Context,
      ) => Promise<void>,
    ) => Handler<APIGatewayProxyEventV2>;
  }
}
