import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
//import { stringMap } from 'aws-sdk/clients/backup'
//import { isContext } from 'vm'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('TodosAccess')
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})
const urlExpiration = Number(process.env.SIGNED_URL_EXPIRATION)
const bucketName = process.env.ATTACHMENT_S3_BUCKET

export class TodoAccess { 
    private readonly docClient: DocumentClient
    private readonly todosTable: string

    constructor(
        ) { 
            this.docClient = createDynamoDBClient()
        this.todosTable = process.env.TODOS_TABLE
        }
    
        async getTodosForUser(userId: string): Promise<TodoItem[]> {
            console.log('Getting all todo items')
          
            const result = await this.docClient.query({
               TableName: this.todosTable,
               KeyConditionExpression: 'userId= :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        },
        ScanIndexForward: false
      })
      .promise()
        
            return result.Items as TodoItem[]
          }

          async createTodo(
            todo: TodoItem
          ): Promise<TodoItem> {
        
            //console.log(`Creating a todo item for user id: ${todo.userId}`)
        
            await this.docClient.put({ 
                TableName: this.todosTable,
                Item: todo
            }).promise()
        
            logger.info(`Creating a todo item for user id: ${todo.userId}`, { 
              todoId: `${todo.todoId}`
            })
            return todo
          }

          async deleteTodo(
            todoId: string, userId: string
          ) { 
            await this.docClient.delete({ 
              TableName: this.todosTable,
              Key: { 
                userId: userId,
                todoId: todoId
              }
            },  function (err) { 
              if (err) { 
                console.log('FAIL: Error deleting item from todostable - ' + err)
              } else { 
                console.log('DEBUG: deleteItem worked. ')
              }
            })

          }

          async updateTodo(
            todoId: string, userId: string,
            updatedTodo: TodoUpdate
          ){
        
            console.log(`Updating todo item with id: ${todoId}`)
            const params = { 
              TableName: this.todosTable,
              Key: { 
                userId: userId,
                todoId: todoId
              },
              UpdateExpression: "set done = :done, #na = :name, dueDate = :dueDate",
              ExpressionAttributeNames: {
                '#na' : 'name'
            },
              ExpressionAttributeValues: { 
                ':done': updatedTodo.done,
                ':name': updatedTodo.name,
                ':dueDate': updatedTodo.dueDate
              },
              ReturnValues: "UPDATED_NEW"
            }
            return await this.docClient.update(params).promise()
      
          }
        
        async createAttachmentPresignedUrl(todoId: string): Promise<string> { 
          return getUploadUrl(todoId)
        }
}
async function getUploadUrl(todoId: string) {
  return s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: todoId,
      Expires: urlExpiration
  })
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