import * as AWS from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { httpResponse } from "../../utils";

const docClient = new AWS.DynamoDB.DocumentClient()
const imagesTable = process.env.IMAGES_TABLE
const imageIdIndex = process.env.IMAGE_ID_INDEX

export const handler: APIGatewayProxyHandler = async (_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const imageId = _event.pathParameters.imageId

    const result = await docClient.query({
      TableName: imagesTable,
      IndexName: imageIdIndex,
      KeyConditionExpression: 'imageId = :imageId',
      ExpressionAttributeValues: {
        ':imageId': imageId
      }
    }).promise()

    if (result.Count !== 0) {
      // Send Back Items
      return httpResponse(200, JSON.stringify(result.Items[0]))
    }
    return httpResponse(404, JSON.stringify({error: `Image ${imageId} not found`}))
  } catch (error) {
    return httpResponse(400, JSON.stringify({ error: error.message }))
  }
};