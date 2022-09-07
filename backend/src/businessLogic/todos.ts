//import { TodoUpdate } from '../models/TodoUpdate'
import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as uuid from 'uuid'

const todoAccess = new TodoAccess()
const bucketName = process.env.ATTACHMENT_S3_BUCKET

export async function getTodosForUser(userId: string): Promise<TodoItem[]> { 
    return todoAccess.getTodosForUser(userId)
}

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    userId: string
): Promise<TodoItem>  { 
    const itemId = uuid.v4()

    return await todoAccess.createTodo({ 
        todoId: itemId,
        userId: userId,
        done: false,
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        createdAt: new Date().toISOString(),
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${itemId}`
    })
}

export async function createAttachmentPresignedUrl(todoId: string): Promise<string> { 
  return await todoAccess.createAttachmentPresignedUrl(todoId)
}

export async function deleteTodo(
    todoId: string, userId: string
) { 
    await todoAccess.deleteTodo(todoId, userId)
}

export async function updateTodo(
    todoId: string, userId: string,
    updatedTodo: UpdateTodoRequest
) { 
    
    await todoAccess.updateTodo(
        todoId,
        userId,
        { 
            done: updatedTodo.done,
            name: updatedTodo.name,
            dueDate: updatedTodo.dueDate
        }
    )
}