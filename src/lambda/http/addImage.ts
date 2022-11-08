import * as AWS from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { v4 as uuid } from 'uuid';
import { httpResponse } from "../../utils";

const docClient = new AWS.DynamoDB.DocumentClient()
const groupsTable = process.env.GROUPS_TABLE
const imagesTable = process.env.IMAGES_TABLE

export const handler: APIGatewayProxyHandler = async (_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const groupId = _event.pathParameters.groupId

    // Validate Group
    const validGroupId = await _groupExists(groupId)
    if (!validGroupId) {
      return httpResponse(404, JSON.stringify({ error: `Group ${groupId} does not exists` }))
    }

    // Add Image To DB
    const { title } = JSON.parse(_event.body)
    const newItem = {
      title,
      groupId,
      timestamp: new Date().toISOString(),
      imageId: uuid()
    }

    await docClient.put({
      TableName: imagesTable,
      Item: newItem
    }).promise()

    // Send Back Items
    return httpResponse(201, JSON.stringify({ newItem }))
  } catch (error) {
    return httpResponse(400, JSON.stringify({ error: error.message }))
  }
};


const _groupExists = async (groupId: string) => {
  const result = await docClient.get({
    TableName: groupsTable,
    Key: {
      id: groupId
    }
  }).promise()

  console.log('Get Group: ', result)
  return !!result.Item
}