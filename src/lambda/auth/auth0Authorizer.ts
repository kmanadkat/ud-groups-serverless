import { CustomAuthorizerHandler, CustomAuthorizerEvent, CustomAuthorizerResult } from "aws-lambda";
import * as AWS from 'aws-sdk';

import { verify } from 'jsonwebtoken'
import { JwtToken } from "../../auth/JwtToken";

const secretId = process.env.AUTH_0_SECRET_ID
const secretField = process.env.AUTH_0_SECRET_FIELD

const client = new AWS.SecretsManager()

// Cached secret if a Lambda instance is reused
let cachedSecret: string

export const handler: CustomAuthorizerHandler = async (_event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const decodedToken = await verifyToken(_event.authorizationToken)
    console.log("User was authorized")

    return {
      principalId: decodedToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (error) {
    console.log("User was not authorized", error.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtToken> {
  if(!authHeader) {
    throw new Error('No authorization header')
  }

  if(!authHeader.toLocaleLowerCase().startsWith('bearer ')){
    throw new Error('Invalid authorization header')
  }

  const split = authHeader.split(' ')
  const token = split[1]

  const secretObject = await getSecret()
  const secret = secretObject[secretField]

  return verify(token, secret) as JwtToken

  // A request is authorized.
}

async function getSecret() {
  if (cachedSecret) return JSON.parse(cachedSecret)

  const data = await client.getSecretValue({
    SecretId: secretId,
  }).promise()

  cachedSecret = data.SecretString
  return JSON.parse(cachedSecret)
}