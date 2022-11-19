import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { httpResponse } from '../../utils';

const XAWS = AWSXRay.captureAWS(AWS)
const docClient = new XAWS.DynamoDB.DocumentClient()
const connectionsTable = process.env.CONNECTIONS_TABLE

export const handler: APIGatewayProxyHandler = async (_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const connectionId = _event.requestContext.connectionId
    const timestamp = new Date().toISOString()

    const item = {
      id: connectionId,
      timestamp
    }

    await docClient.put({
      TableName: connectionsTable,
      Item: item
    }).promise()

    return httpResponse(200, '')
  } catch (error) {
    return httpResponse(400, JSON.stringify({ error: error.message }))
  }
}