# Terraform Deployment Guide

This document explains how to use the provided Terraform configuration to automate the deployment of the **Markets Vision** project to Vercel.

## Prerequisites

1.  **Terraform Installed**: Download and install Terraform from [terraform.io](https://www.terraform.io/downloads).
2.  **Vercel API Token**: Create a token in your [Vercel Account Settings](https://vercel.com/account/tokens).
3.  **Vercel Team ID** (Optional): If you are deploying to a team, get your Team ID from the team settings.
4.  **GitHub Repository**: Your project should be pushed to a GitHub repository.

## Files Created

- `terraform/main.tf`: Core configuration for the Vercel project and environment variables.
- `terraform/variables.tf`: Definitions for required variables.
- `terraform/terraform.tfvars.example`: A template for your private credentials.

## Setup Steps

1.  **Navigate to the terraform directory**:
    ```bash
    cd "c:/Users/Exequiel/Documents/LIBROS Y DOCUMENTOS/Biblioredes/PROYECTOS/Nueva carpeta/MARKETSVISION/terraform"
    ```

2.  **Configure your variables**:
    Rename `terraform.tfvars.example` to `terraform.tfvars` and fill in your actual credentials:
    ```hcl
    vercel_api_token     = "your-secret-token"
    github_repo          = "your-username/markets-vision"
    supabase_url         = "your-project.supabase.co"
    supabase_anon_key    = "your-anon-key"
    alphavantage_api_key = "your-alpha-vantage-key"
    ```

3.  **Initialize Terraform**:
    ```bash
    terraform init
    ```

4.  **Plan the deployment**:
    Check if the configuration is correct and see what Terraform will create.
    ```bash
    terraform plan
    ```

5.  **Apply the configuration**:
    Create the project on Vercel and set the environment variables.
    ```bash
    terraform apply
    ```

## Benefits of this Configuration

- **Infrastructure as Code**: Your Vercel settings and environment variables are versioned.
- **Security**: Secret keys are managed as variables and injected securely into Vercel.
- **Repeatability**: You can easily recreate the environment if needed.

## Important Note on TTS Security

Ensure you have already moved the Google Cloud API key to **Supabase Secrets** as instructed in `GOOGLE_CLOUD_SETUP.md`. This Terraform script handles the Vercel environment variables, while Supabase handles the secure TTS proxy.
