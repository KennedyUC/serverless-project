import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import middy from '@middy/core'
import { httpErrorHandler } from 'middy/middlewares'
import  cors  from '@middy/http-cors'

import { updateTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { CheckOwner } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    const validOwner = await CheckOwner(todoId, userId)
    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
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

    await updateTodo(todoId, userId, updatedTodo)
    return {
      statusCode: 200,
      
      body: JSON.stringify({
          
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true,
      origin: '*'
    })
  )
