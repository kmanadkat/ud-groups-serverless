import { CustomAuthorizerEvent, CustomAuthorizerResult } from "aws-lambda";
import { verify } from 'jsonwebtoken'
import { JwtToken } from "../../auth/JwtToken";

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJBNcr467tzYeSMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1zazdxbWt2ay51cy5hdXRoMC5jb20wHhcNMjIwNjIyMTgwMDI4WhcN
MzYwMjI5MTgwMDI4WjAkMSIwIAYDVQQDExlkZXYtc2s3cW1rdmsudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlWoKRBLD9cYQ82hZ
bYf9ZOv2fI60+iB5GGOFktLgBa6t2k2VibEgONnmj1VP/ONmv7jlJ3Qes7lYt44Y
pMfxR/vRsYkF8u7vGLKu4osMMtflzzxO3xVdXZ1j/u2s/rh4CFJWItafTGF77utt
RNZTcq1FzMSwy8bQV3gJ0YE1nDGYxbs+C2VzQjqN7H/Kp0TsqfdSn0w28TPrgkrg
kxTNzjjHxBi6/c6zSiPrsv1SEtRdT2hZm+xphnLxj4DdPnbny84Ww/gVGFYwKZCZ
sD5SnDZdjzhFqCTFzD6Ls+OR0a76On6gKUJzbfa4J33RF8ltsyjgXuWRlfnCT2oj
5xArDQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBTIgzO23Ty0
4Zf56oIg8vvaVDsiCTAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AB7Xj2QDdTCGvlynNKp/uXDLKTEsb0VRteH4I0CKOdpanM4sPsWEniL9O7qHduWH
DRQpCckzN2m4WJ0whIjZ+Ebhzbb5kZNUB1b7DCv1r/c/mPGurw7Qu1sBhdHTsm1N
tG2rXPN2hkKHXLxXPKqsQkOjzMwYdSX7LwfMN38HTppbOEv4qSvE16zB9rWZkFqe
Kqvef7q5ZyDM4lbpX5PrVNBzWfyMxWmo1aW0zpEU1IDKpr15zvn/C7AWfvu1LgRs
JUJ5yDh5j7DcbGu5GOvQMLPPbt1IDhOJj2aSm6hroklBsNsfGmKzNo8BnqEeWIi/
PRBN76ZdYf2nL+SOxkFUQ1o=
-----END CERTIFICATE-----`

export const handler = async (_event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const decodedToken = verifyToken(_event.authorizationToken)
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

function verifyToken(authHeader: string): JwtToken {
  if (!authHeader) {
    throw new Error('No authorization header')
  }

  if (!authHeader.toLocaleLowerCase().startsWith('bearer ')) {
    throw new Error('Invalid authorization header')
  }

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, {algorithms: ['RS256']}) as JwtToken

  // A request is authorized.
}