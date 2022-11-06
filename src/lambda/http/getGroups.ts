import * as AWS from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { httpResponse } from "../../utils";

const docClient = new AWS.DynamoDB.DocumentClient()
const groupsTable = process.env.GROUPS_TABLE

export const handler: APIGatewayProxyHandler = async (_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Get Data From AWS DynamoDB
    const result = await docClient.scan({
      TableName: groupsTable
    }).promise()

    // Send Back Items
    return httpResponse(200, JSON.stringify({
      data: result.Items,
      nextkey: result.LastEvaluatedKey
    }))
  } catch (error) {
    return httpResponse(400, JSON.stringify({ error: error.message }))
  }
};
