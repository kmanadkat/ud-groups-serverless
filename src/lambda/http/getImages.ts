import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { httpResponse } from "../../utils";

const XAWS = AWSXRay.captureAWS(AWS)
const docClient = new XAWS.DynamoDB.DocumentClient()
const groupsTable = process.env.GROUPS_TABLE
const imagesTable = process.env.IMAGES_TABLE

export const handler: APIGatewayProxyHandler = async (_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const groupId = _event.pathParameters.groupId

    // Validate Group
    const validGroupId = await _groupExists(groupId)
    if(!validGroupId) {
      return httpResponse(404, JSON.stringify({error: `Group ${groupId} does not exists`}))
    }

    // Get Data From AWS DynamoDB
    const images = await _getImagesGroup(groupId)

    // Send Back Items
    return httpResponse(200, JSON.stringify({
      groupId,
      items: images
    }))
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

const _getImagesGroup = async (groupId: string) => {
  const result = await docClient.query({
    TableName: imagesTable,
    KeyConditionExpression: 'groupId = :groupId',
    ExpressionAttributeValues: {
      ':groupId': groupId
    },
    ScanIndexForward: false
  }).promise()

  return result.Items
}