#!/bin/bash

# Set MinIO client alias first
mc alias set minio http://mariami-minio-dev:9000 ${MINIO_ROOT_USER:-minioadmin} ${MINIO_ROOT_PASSWORD:-minioadmin}

# Wait for MinIO to be ready using mc command
echo "Waiting for MinIO to be ready..."
until mc admin info minio > /dev/null 2>&1; do
    echo "MinIO not ready yet. Waiting..."
    sleep 2
done

echo "MinIO is ready! Creating buckets..."

# Create buckets if they don't exist
mc mb minio/user-data --ignore-existing
mc mb minio/static --ignore-existing
mc mb minio/templates --ignore-existing

echo "Buckets created successfully!"

# Set templates bucket as public with download policy
echo "Setting up public access for templates bucket..."
mc anonymous set download minio/templates

# Configure caching policy for templates bucket (cache for 1 hour)
mc ilm add --expiry-days 365 --storage-class STANDARD minio/templates

# Upload template files to templates bucket
echo "Uploading template files to templates bucket..."
TEMPLATE_DIR="/templates"

if [ -f "$TEMPLATE_DIR/pnl_template.csv" ]; then
    mc cp "$TEMPLATE_DIR/pnl_template.csv" minio/templates/pnl_template.csv \
        --attr "Cache-Control=public, max-age=3600" \
        --attr "Content-Type=text/csv"
    echo "Uploaded pnl_template.csv"
fi

if [ -f "$TEMPLATE_DIR/transactions_template.csv" ]; then
    mc cp "$TEMPLATE_DIR/transactions_template.csv" minio/templates/transactions_template.csv \
        --attr "Cache-Control=public, max-age=3600" \
        --attr "Content-Type=text/csv"
    echo "Uploaded transactions_template.csv"
fi

if [ -f "$TEMPLATE_DIR/invoices_template.csv" ]; then
    mc cp "$TEMPLATE_DIR/invoices_template.csv" minio/templates/invoices_template.csv \
        --attr "Cache-Control=public, max-age=3600" \
        --attr "Content-Type=text/csv"
    echo "Uploaded invoices_template.csv"
fi

echo "Template files uploaded successfully with caching headers!"


echo "Uploading docs files to templates bucket..."
DOCS_DIR="/docs"


if [ -f "$DOCS_DIR/TermsOfService.md" ]; then
    mc cp "$DOCS_DIR/TermsOfService.md" minio/templates/TermsOfService.md \
        --attr "Cache-Control=public, max-age=3600" \
        --attr "Content-Type=text/csv"
    echo "Uploaded TermsOfService.md"
fi

if [ -f "$DOCS_DIR/PrivacyPolicy.md" ]; then
    mc cp "$DOCS_DIR/PrivacyPolicy.md" minio/templates/PrivacyPolicy.md \
        --attr "Cache-Control=public, max-age=3600" \
        --attr "Content-Type=text/csv"
    echo "Uploaded PrivacyPolicy.md"
fi

echo "Docs files uploaded successfully with caching headers!"