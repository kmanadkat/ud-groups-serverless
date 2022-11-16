import { CustomAuthorizerHandler, CustomAuthorizerEvent, CustomAuthorizerResult } from "aws-lambda";

export const handler: CustomAuthorizerHandler = async (_event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    verifyToken(_event.authorizationToken)
    console.log("User was authorized")

    return {
      principalId: 'user',
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

function verifyToken(authHeader: string) {
  if(!authHeader) {
    throw new Error('No authorization header')
  }

  if(!authHeader.toLocaleLowerCase().startsWith('bearer ')){
    throw new Error('Invalid authorization header')
  }

  const split = authHeader.split(' ')
  const token = split[1]

  if(token !== '123'){
    throw new Error('Invalid token')
  }

  // A request is authorized.
}