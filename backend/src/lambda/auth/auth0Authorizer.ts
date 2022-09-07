import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
//import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import middy from '@middy/core'
import { ssm } from 'middy/middlewares'

const logger = createLogger('auth')
const certId = process.env.AUTH_0_CERT_ID

export const handler = middy(async (
  event: CustomAuthorizerEvent, context
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken, context.AUTH0_CERT)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
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
  } catch (e) {
    logger.error('User not authorized', { error:' '+ e.message })

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
})
handler.use(
  ssm({
    cache: true,
    cacheKey: 'ssm-certificate',
    setToContext: true,
      names: { 
          AUTH0_CERT: certId
      }
    
  })
)

async function verifyToken(authHeader: string, cert: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  console.log('certificate', cert )
  
  return verify(token, cert, { algorithms: ['RS256'] }) as Jwt["payload"]
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
