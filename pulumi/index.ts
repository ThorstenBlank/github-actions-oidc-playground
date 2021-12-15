import * as aws from "@pulumi/aws";

const repoName = "ThorstenBlank/github-actions-oidc-playground";

const identityProvider = new aws.iam.OpenIdConnectProvider("github-oicd", {
  clientIdLists: ["sts.amazonaws.com"],
  thumbprintLists: ["a031c46782e6e6c662c2c87c76da9aa62ccabd8e"],
  url: "https://token.actions.githubusercontent.com",
})

const deployRole = new aws.iam.Role("deploy-role", {
  assumeRolePolicy:  identityProvider.arn.apply((providerArn) => JSON.stringify({
    Version: "2012-10-17",
    Statement: [{
      Sid: "RoleForGithub",
      Action: "sts:AssumeRoleWithWebIdentity",
      Effect: "Allow",
      Principal: { Federated: providerArn },
      Condition: { StringEquals: { "token.actions.githubusercontent.com:sub": `repo:${repoName}:*` } }
    }]
  }))
})

new aws.iam.RolePolicy("deploy-role-policy", {
  role: deployRole.arn,
  policy: JSON.stringify({
    Version: "2012-10-17",
    Statement: [{
      Action: [
        "ecr:BatchGetImage",
        "ecr:BatchCheckLayerAvailability",
        "ecr:CompleteLayerUpload",
        "ecr:GetDownloadUrlForLayer",
        "ecr:InitiateLayerUpload",
        "ecr:PutImage",
        "ecr:UploadLayerPart"
      ],
      Effect: "Allow",
      Resource: "*"
    }]
  })
});

export const deployRoleARN = deployRole.arn
