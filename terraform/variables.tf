variable "vercel_api_token" {
  description = "Vercel API Token"
  type        = string
  sensitive   = true
}

variable "vercel_team_id" {
  description = "Vercel Team ID"
  type        = string
  default     = null
}

variable "github_repo" {
  description = "The GitHub repository to deploy (e.g. username/repo)"
  type        = string
}

variable "supabase_url" {
  description = "Supabase Project URL"
  type        = string
}

variable "supabase_anon_key" {
  description = "Supabase Anonymous Key"
  type        = string
  sensitive   = true
}

variable "alphavantage_api_key" {
  description = "Alpha Vantage API Key"
  type        = string
  sensitive   = true
}
