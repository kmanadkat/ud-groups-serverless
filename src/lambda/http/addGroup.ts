import * as AWS from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { v4 as uuid } from 'uuid';
import { httpResponse } from '../../utils';

const docClient = new AWS.DynamoDB.DocumentClient()
const groupsTable = process.env.GROUPS_TABLE

export const handler: APIGatewayProxyHandler = async (_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const itemId = uuid()
    const parsedBody = JSON.parse(_event.body)

    const newItem = {
      id: itemId,
      ...parsedBody
    }

    await docClient.put({
      TableName: groupsTable,
      Item: newItem
    }).promise()
    return httpResponse(201, JSON.stringify({ newItem }))
  } catch (error) {
    return httpResponse(400, JSON.stringify({ error: error.message }))
  }
};