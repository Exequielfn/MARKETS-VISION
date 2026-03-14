terraform {
  cloud {
    organization = "MarketsVision"

    workspaces {
      project = "MARKETS-VISION"
      name    = "MARKETS-VISION"
    }
  }

  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 0.15.0"
    }
  }
}

provider "vercel" {
  api_token = var.vercel_api_token
  team      = var.vercel_team_id
}

resource "vercel_project" "markets_vision" {
  name        = "markets-vision"
  framework   = "vite"

  git_repository = {
    type = "github"
    repo = var.github_repo
  }

  vercel_authentication = {
    protect_production = false
  }

  environment = [
    {
      key   = "VITE_SUPABASE_URL"
      value = var.supabase_url
      target = ["production", "preview", "development"]
    },
    {
      key   = "VITE_SUPABASE_ANON_KEY"
      value = var.supabase_anon_key
      target = ["production", "preview", "development"]
    },
    {
      key   = "ALPHAVANTAGE_API_KEY"
      value = var.alphavantage_api_key
      target = ["production", "preview", "development"]
    }
  ]
}

resource "vercel_deployment" "production" {
  project_id = vercel_project.markets_vision.id
  ref        = "main"
  production = true
}
