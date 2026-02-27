#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "$0")/.."

STACK_NAME="naute"

echo "==> Checking required environment variables definition"
: "${NAUTE_DOMAIN:?Set NAUTE_DOMAIN}"
: "${NAUTE_HOSTED_ZONE_ID:?Set NAUTE_HOSTED_ZONE_ID}"
: "${NAUTE_COGNITO_PREFIX:?Set NAUTE_COGNITO_PREFIX}"

echo "==> Building shared types"
npm run build -w shared

echo "==> Building SAM application"
sam build --template-file infra/template.yaml --no-cached

echo "==> Deploying SAM stack"
sam deploy --config-file infra/samconfig.toml --no-confirm-changeset \
  --parameter-overrides \
    "DomainName=$NAUTE_DOMAIN" \
    "HostedZoneId=$NAUTE_HOSTED_ZONE_ID" \
    "CognitoDomainPrefix=$NAUTE_COGNITO_PREFIX"

echo "==> Building frontend"
npm run build -w frontend

BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" \
  --output text)

echo "==> Syncing frontend to s3://$BUCKET_NAME"
aws s3 sync frontend/dist "s3://$BUCKET_NAME" --delete

DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" \
  --output text)

echo "==> Invalidating CloudFront cache ($DISTRIBUTION_ID)"
aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/*" \
  --query "Invalidation.Id" \
  --output text

echo "==> Done"
