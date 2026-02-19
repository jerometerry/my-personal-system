# My Personal System

This project contains a modern full-stack application with a React frontend and a FastAPI backend, designed for personal organization and data analysis.

## Problem Statement

The primary motivation for this project is to replace a manual, spreadsheet-based system for tracking daily activities. This data is used to analyze patterns and guide decisions aimed at improving quality of life. While functional, the spreadsheet approach is time-consuming, error-prone, and difficult to query for meaningful insights.

This application solves these problems by providing a dedicated, web-based interface for streamlined data entry and a structured database for powerful querying and future analysis.

## Project Goals

This project aims to create a superior workflow for personal data tracking with the following goals:

* **Streamlined Data Entry**: Provide a simple, fast, and mobile-friendly interface for logging daily activities. This replaces the cumbersome, time-consuming, and error-prone process of manually editing spreadsheets.

* **Centralized Data Store**: Consolidate all personal data into a single, secure MongoDB database, creating a reliable "single source of truth."

* **Powerful Analytics**: Enable robust querying and analysis of the collected data to identify patterns and insights that can be used to guide decisions and improve quality of life.

* **Flexible Data Export**: Retain the benefits of spreadsheet analysis by providing the ability to generate and export custom spreadsheets from the central data store on demand.

## Technology Stack

* **Backend**: Python, FastAPI, Pydantic, PyMongo (Async Driver), Uvicorn
* **Frontend**: TypeScript, React, Vite, Redux Toolkit (RTK Query), PNPM
* **Database**: MongoDB
* **Infrastructure**: Docker

---

## Development Workflow

### Initial One-Time Setup

This guide assumes you are on macOS with Homebrew installed.

1.  **Install Prerequisites:**
    ```bash
    # Install core tools
    brew install tfenv pyenv nvm pnpm docker git

    # Configure Git (first time only)
    git config --global user.name "<YOUR_NAME>"
    git config --global user.email "<YOUR_EMAIL>"
    ```

2.  **Set up Runtimes:**
    ```bash
    # Set up Terraform (use the latest version)
    tfenv install latest
    tfenv use latest

    # Set up Python (use the version specified in .python-version)
    pyenv install 3.13.7
    pyenv global 3.13.7
    
    # Set up Node.js
    nvm install --lts
    nvm use --lts
    ```

3.  **Install Project Dependencies:**
    ```bash
    # Install backend dependencies (from project root)
    cd backend
    python -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    cd ..

    # Install frontend dependencies (from project root)
    cd frontend
    pnpm install
    cd ..
    ```

### Running the Application Locally

You will need **three separate terminal windows** open.

#### Terminal 1: Run MongoDB
**First time only:**
```bash
docker run --name my-mongo -p 27017:27017 -d mongo
```

**To start the container on subsequent runs:**
```bash
docker start my-mongo
```
> **Tip:** To stop the container, run `docker stop my-mongo`.

#### Terminal 2: Start the Backend API
From the **project root**:
```bash
source backend/.venv/bin/activate
uvicorn backend.main:app --reload
```

#### Terminal 3: Start the Frontend App
From the **`frontend`** directory, first set up your local environment file:
```bash
# This only needs to be done once
cp .env.example .env.development
```
Then start the server:
```bash
pnpm start
```

---

## AWS Deployment

### One-Time AWS Setup

1.  **Configure AWS CLI**: Ensure your local machine is configured to access your AWS account.
    ```bash
    aws configure
    aws sts get-caller-identity # Confirms you are logged in
    ```

2.  **Create IAM User Policy**: Create an IAM user for deployment with the `PowerUserAccess` managed policy. Then, create the following custom policy named `TerraformProjectIAMPolicy` and attach it to the user. **Remember to replace `<ACCOUNT_ID>` with your 12-digit AWS Account ID.**
    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "iam:GetRole",
                    "iam:CreateRole",
                    "iam:DeleteRole",
                    "iam:AttachRolePolicy",
                    "iam:DetachRolePolicy",
                    "iam:PassRole",
                    "iam:PutRolePolicy",
                    "iam:ListRolePolicies",
                    "iam:ListAttachedRolePolicies"
                ],
                "Resource": "arn:aws:iam::<ACCOUNT_ID>:role/lambda-exec-role"
            },
            {
                "Effect": "Allow",
                "Action": [
                    "iam:GetPolicy",
                    "iam:CreatePolicy",
                    "iam:DeletePolicy",
                    "iam:GetPolicyVersion"
                ],
                "Resource": "arn:aws:iam::<ACCOUNT_ID>:policy/lambda-policy"
            }
        ]
    }
    ```

3.  **Configure Terraform & Atlas Credentials**: In the `terraform` directory, create a `terraform.tfvars` file from the example.
    ```bash
    cd terraform
    cp terraform.tfvars.example terraform.tfvars
    ```
    Edit `terraform.tfvars` and fill in your MongoDB Atlas Project ID and API keys.

4.  **Set MongoDB Connection String**: After the first successful deployment, you must manually set the secret in AWS Systems Manager Parameter Store.
    * **Parameter Name**: `/MyPersonalSystem/MongoUri`
    * **Value**: Your MongoDB Atlas private connection string.

### Running a Deployment

To deploy all infrastructure and application updates, run the automated script from the **project root**:

```bash
./deploy.sh
```

---

## Additional Scripts & Information

**Nuke MongoDB**
⚠️ **Warning:** This will permanently delete all data in the container.
```bash
docker stop my-mongo
docker rm my-mongo
docker run --name my-mongo -p 27017:27017 -d mongo
```

**Hard Restart API Server**
```bash
# CTRL+C to stop the running server
uvicorn backend.main:app --reload
```

## Accessing the App & API Docs

### Frontend Application
When you run `pnpm start`, the Vite server will print the local URL to the console. It is typically:
* **`http://localhost:5173`**

### Backend API Docs
FastAPI automatically generates interactive API documentation. While the backend server is running, you can access them at:
* **Swagger UI**: `http://127.0.0.1:8000/docs` 
* **ReDoc**: `http://127.0.0.1:8000/redoc`

## AWS Cost Analysis

The estimated monthly cost to run this project on AWS with the current serverless architecture (using VPC Endpoints) is approximately **$74 USD**.

The project's costs can be broken down into two main categories: fixed recurring costs, which form the monthly baseline, and usage-based costs, which are expected to be free for this project's low-traffic use case.

*(Calculations use an average of 730 hours per month)*

### 1. Fixed Monthly Costs (The Baseline)
The majority of the cost comes from fixed, hourly charges for the dedicated infrastructure required for this secure, production-ready setup.

* **MongoDB Atlas M10 Cluster**: **~$58.40 / month**
    * (`$0.08/hour * 730 hours`) A dedicated cluster is required to support the secure VPC Peering connection.

* **AWS VPC Endpoints**: **~$14.60 / month**
    * (`$0.01/hour * 2 endpoints * 730 hours`) These provide a secure, private network path from the Lambda function to AWS services (SSM and KMS), avoiding the need for a more expensive NAT Gateway.

* **AWS KMS Key**: **$1.00 / month**
    * This is the flat fee for the custom key used to encrypt the database credentials.

### 2. Usage-Based Costs (Effectively Free)
The following services are usage-based, but their costs are expected to be **$0** as the project's traffic falls well within the AWS Free Tier.

* **AWS Lambda**: 1 million free requests/month.
* **API Gateway (HTTP API)**: 1 million free requests/month (first 12 months).
* **S3 & CloudFront**: Generous free tiers for storage and data transfer.

### Summary

| Service | Estimated Monthly Cost |
| :--- | :--- |
| MongoDB Atlas M10 | ~$58.40 |
| AWS Networking (VPC Endpoints) | ~$14.60 |
| AWS KMS Key | $1.00 |
| Usage-Based Services | ~$0.00 |
| **Total Estimated Bill** | **~$74.00 USD** |
