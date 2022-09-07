import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import middy from '@middy/core'
import { httpErrorHandler } from 'middy/middlewares'
import  cors  from '@middy/http-cors'

import { createAttachmentPresignedUrl } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { CheckOwner } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    const url = await createAttachmentPresignedUrl(todoId)
    const validOwner = await CheckOwner(todoId, userId)

    if (!validOwner) {
        return {
            statusCode: 404,
            
            body: JSON.stringify({
                error: `User ID ${userId} is not associated with the todo item Id ${todoId}`
            })
        }
    }
    
    return {
      statusCode: 201,
  
      body: JSON.stringify({
          uploadUrl: url
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(cors({
      credentials: true,
      origin: '*'
    })
  )

