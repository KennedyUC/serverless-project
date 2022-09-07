import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import middy from '@middy/core'
import { httpErrorHandler } from 'middy/middlewares'
import  cors  from '@middy/http-cors'

import { deleteTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { CheckOwner } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    const validOwner = await CheckOwner(todoId, userId)
    // TODO: Remove a TODO item by id
    if (!validOwner) {
      return {
          statusCode: 404,
          headers: {
              'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
              error: `User ID ${userId} is not associated with the todo item Id ${todoId}`
          })
      }
  }
    
    await deleteTodo(todoId, userId)
    
    return {
      statusCode: 200,
      
      body: JSON.stringify({
          
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(cors({
      credentials: true
    })
  )
