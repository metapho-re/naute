import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN!;
const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID!;
const COGNITO_DOMAIN = process.env.COGNITO_DOMAIN!;

const COOKIE_NAME = "naute_rt";
const COOKIE_REGEXP = new RegExp(`${COOKIE_NAME}=([^;]+)`);
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60;

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Credentials": "true",
  "Content-Type": "application/json",
};

const getSetCookieHeader = (refreshToken: string): string =>
  [
    `${COOKIE_NAME}=${refreshToken}`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Path=/auth",
    `Max-Age=${REFRESH_TOKEN_MAX_AGE}`,
  ].join("; ");

const getClearCookieHeader = (): string =>
  [
    `${COOKIE_NAME}=`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Path=/auth",
    "Max-Age=0",
  ].join("; ");

const getRefreshTokenFromCookie = (
  cookieHeader: string | undefined,
): string | null => {
  if (!cookieHeader) {
    return null;
  }

  const match = cookieHeader.match(COOKIE_REGEXP);

  return match ? match[1] : null;
};

interface CognitoTokenResponse {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
}

const exchangeToken = async (
  params: URLSearchParams,
): Promise<CognitoTokenResponse> => {
  const response = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!response.ok) {
    throw new Error("Token exchange failed");
  }

  return response.json() as Promise<CognitoTokenResponse>;
};

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const route = `${event.httpMethod} ${event.resource}`;

  try {
    switch (route) {
      case "POST /auth/token": {
        const { code, code_verifier, redirect_uri } = JSON.parse(
          event.body || "{}",
        ) as Record<string, string>;

        if (!code || !code_verifier || !redirect_uri) {
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: "Missing required fields" }),
          };
        }

        const data = await exchangeToken(
          new URLSearchParams({
            grant_type: "authorization_code",
            client_id: COGNITO_CLIENT_ID,
            redirect_uri,
            code_verifier,
            code,
          }),
        );

        if (!data.refresh_token) {
          throw new Error("No refresh token in response");
        }

        return {
          statusCode: 200,
          headers: {
            ...corsHeaders,
            "Set-Cookie": getSetCookieHeader(data.refresh_token),
          },
          body: JSON.stringify({
            data: {
              access_token: data.access_token,
              id_token: data.id_token,
            },
          }),
        };
      }

      case "POST /auth/refresh": {
        const refreshToken = getRefreshTokenFromCookie(
          event.headers?.Cookie || event.headers?.cookie,
        );

        if (!refreshToken) {
          return {
            statusCode: 401,
            headers: corsHeaders,
            body: JSON.stringify({ error: "No refresh token" }),
          };
        }

        const data = await exchangeToken(
          new URLSearchParams({
            grant_type: "refresh_token",
            client_id: COGNITO_CLIENT_ID,
            refresh_token: refreshToken,
          }),
        );

        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            data: {
              access_token: data.access_token,
              id_token: data.id_token,
            },
          }),
        };
      }

      case "POST /auth/logout": {
        return {
          statusCode: 200,
          headers: {
            ...corsHeaders,
            "Set-Cookie": getClearCookieHeader(),
          },
          body: JSON.stringify({ data: null }),
        };
      }

      default:
        return {
          statusCode: 405,
          headers: corsHeaders,
          body: JSON.stringify({ error: "Method not allowed" }),
        };
    }
  } catch (error: unknown) {
    console.error("Authentication error:", error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
