#!/bin/bash

# MinIO Initialization Script
# This script sets up MinIO bucket and policies

set -e

echo "🗄️  Initializing MinIO..."

# Wait for MinIO to be ready
echo "⏳ Waiting for MinIO to be ready..."
until curl -f http://minio:9000/minio/health/live > /dev/null 2>&1; do
    echo "Waiting for MinIO..."
    sleep 5
done

echo "✅ MinIO is ready!"

# Set up MinIO client alias
echo "🔧 Setting up MinIO client..."
mc alias set local http://minio:9000 ${MINIO_ACCESS_KEY} ${MINIO_SECRET_KEY}

# Create bucket if it doesn't exist
echo "📦 Creating bucket: ${MINIO_BUCKET_NAME}"
mc mb local/${MINIO_BUCKET_NAME} || echo "Bucket already exists"

# Set bucket policy for public read access
echo "🔒 Setting bucket policy..."
cat > /tmp/bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${MINIO_BUCKET_NAME}/*"
        }
    ]
}
EOF

mc policy set-json /tmp/bucket-policy.json local/${MINIO_BUCKET_NAME}

# Create necessary folders
echo "📁 Creating folder structure..."
mc mkdir -p local/${MINIO_BUCKET_NAME}/profiles/
mc mkdir -p local/${MINIO_BUCKET_NAME}/books/
mc mkdir -p local/${MINIO_BUCKET_NAME}/qr-codes/
mc mkdir -p local/${MINIO_BUCKET_NAME}/static/

echo "🎉 MinIO initialization complete!"
echo "📊 MinIO Console: http://localhost:9001"
echo "🗄️  MinIO API: http://localhost:9000"
echo "📦 Bucket: ${MINIO_BUCKET_NAME}"
