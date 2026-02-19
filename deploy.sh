#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "--- Deploying Infrastructure with Terraform ---"
cd terraform

terraform apply --auto-approve

BLOG_BUCKET_NAME=$(terraform output -raw blog_s3_bucket_name)
BLOG_DISTRIBUTION_ID=$(terraform output -raw blog_cloudfront_distribution_id)

cd ..

echo "--- Building and Deploying Blog ---"
cd blog && pnpm run build && cd ..

aws s3 sync blog/dist/ "s3://${BLOG_BUCKET_NAME}" \
  --delete \
  --exclude ".DS_Store" \
  --cache-control "public, max-age=31536000, immutable"

aws s3 cp blog/dist/ "s3://${BLOG_BUCKET_NAME}" \
  --recursive \
  --exclude "*" \
  --include "*.html" \
  --include "*.xml" \
  --include "*.txt" \
  --include "*.json" \
  --exclude ".DS_Store" \
  --cache-control "public, max-age=0, must-revalidate"

aws cloudfront create-invalidation --distribution-id "${BLOG_DISTRIBUTION_ID}" --paths "/*"

echo "--- DEPLOYMENT COMPLETE ---"
