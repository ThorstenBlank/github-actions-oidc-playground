locals {
  repo_name = "ThorstenBlank/github-actions-oidc-playground"
}

resource "aws_iam_openid_connect_provider" "github_federation" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = [
    "vstoken.actions.githubusercontent.com|vso:def2860a-d800-4fcb-a6a4-49b1feedfc85",
  ]

  thumbprint_list = ["a031c46782e6e6c662c2c87c76da9aa62ccabd8e"]
}

resource "aws_iam_role" "github_federation_role" {
  name                = "GithubFederationRole"
  managed_policy_arns = ["arn:aws:iam::aws:policy/ReadOnlyAccess"]
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRoleWithWebIdentity"
        Effect = "Allow"
        Principal = {
          Federated = "${aws_iam_openid_connect_provider.github_federation.id}"
        }
        Condition = {
          StringLike = {
            "token.actions.githubusercontent.com:oidc_sub" = "repo:${local.repo_name}:*"
          }
        }
      },
    ]
  })

  tags = {
    tag-key = "tag-value"
  }
}
