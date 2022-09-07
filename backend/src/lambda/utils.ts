import { APIGatewayProxyEvent } from "aws-lambda";
import { parseUserId } from "../auth/utils";
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)
const docClient : DocumentClient = createDynamoDBClient()
const todosTable = process.env.TODOS_TABLE
/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  return parseUserId(jwtToken)
}

export async function CheckOwner(todoId: string, userId: string) {
  const result = await docClient
    .get({
      TableName: todosTable,
      Key: {
          userId: userId,
          todoId: todoId
      }
    })
    .promise()
    const userIdFromTodoTable = result.Item.userId
    var check
    if (userIdFromTodoTable === userId) { 
      check = true
    }
    else { 
      check = false
    }
    
    return check
}

function createDynamoDBClient() { 

  if (process.env.IS_OFFLINE) { 
    console.log('Creating a local dynamoDB instance')

    return new XAWS.DynamoDB.DocumentClient({ 
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }
  return new XAWS.DynamoDB.DocumentClient()
}
