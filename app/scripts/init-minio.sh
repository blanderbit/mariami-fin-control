#!/bin/bash

# Wait for MinIO to be ready
echo "Waiting for MinIO to be ready..."
until curl -f http://mariami-minio-dev:9000/minio/health/live; do
    echo "MinIO not ready yet. Waiting..."
    sleep 2
done

echo "MinIO is ready! Creating buckets..."

# Set MinIO client alias
mc alias set minio http://mariami-minio-dev:9000 ${MINIO_ROOT_USER:-minioadmin} ${MINIO_ROOT_PASSWORD:-minioadmin}

# Create buckets if they don't exist
mc mb minio/user-data --ignore-existing
mc mb minio/static --ignore-existing

echo "Buckets created successfully!"
