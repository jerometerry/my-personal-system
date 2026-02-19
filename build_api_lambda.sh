#!/bin/bash
# Stop on any error
set -e

echo "--- Building Lambda Package ---"

BACKEND_DIR="backend"
BUILD_DIR="${BACKEND_DIR}/build"
APP_DIR="${BUILD_DIR}/app"
ZIP_FILE_NAME="api_lambda_function.zip"
REQUIREMENTS_FILE="requirements.txt"

rm -rf "${BUILD_DIR}" "${ZIP_FILE_NAME}"
echo "Cleaned up old build files."

echo "Installing dependencies for Linux..."
docker run --platform linux/amd64 --rm --entrypoint "" -v "$(pwd)/${BACKEND_DIR}":/var/task public.ecr.aws/lambda/python:3.12 /bin/sh -c "pip install -r ${REQUIREMENTS_FILE} -t build/"

echo "Creating 'app' package..."
mkdir "${APP_DIR}"
touch "${APP_DIR}/__init__.py"

echo "Copying application code..."
cp "${BACKEND_DIR}"/*.py "${APP_DIR}/"

echo "Creating lambda_function zip package..."
cd "${BUILD_DIR}"
zip -r "../../${ZIP_FILE_NAME}" .
cd ../.. 

echo "--- API Lambda function package created successfully at ${ZIP_FILE_NAME} ---"