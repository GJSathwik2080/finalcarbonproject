#!/bin/bash

BUCKET_NAME="carbon-tracker-app-2025"
REGION="eu-north-1"

echo "Building frontend..."
npm run build

echo "Creating S3 bucket..."
aws s3 mb s3://$BUCKET_NAME --region $REGION 2>/dev/null || echo "Bucket exists"

echo "☁️  Uploading to S3..."
aws s3 sync dist/ s3://$BUCKET_NAME --region $REGION --delete

echo "Enabling static website hosting..."
aws s3 website s3://$BUCKET_NAME \
  --index-document index.html \
  --error-document index.html \
  --region $REGION

echo "Disabling block public access..."
aws s3api put-public-access-block \
  --bucket $BUCKET_NAME \
  --public-access-block-configuration BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false \
  --region $REGION

echo "Applying bucket policy..."
aws s3api put-bucket-policy \
  --bucket $BUCKET_NAME \
  --policy file://bucket-policy.json \
  --region $REGION

echo "Deployment complete!"
echo "Your site: http://$BUCKET_NAME.s3-website.$REGION.amazonaws.com"
