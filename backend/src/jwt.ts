import { CognitoJwtVerifier } from "aws-jwt-verify";

const BEARER_PREFIX = "Bearer ";

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID!,
  clientId: process.env.USER_POOL_CLIENT_ID!,
  tokenUse: "access",
});

export const verifyToken = async (
  authHeader: string | undefined,
): Promise<void> => {
  if (!authHeader || !authHeader.startsWith(BEARER_PREFIX)) {
    throw new Error("Missing or invalid Authorization header");
  }

  const token = authHeader.slice(BEARER_PREFIX.length);

  await verifier.verify(token);
};
