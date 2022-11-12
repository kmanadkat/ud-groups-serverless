import * as AWS from 'aws-sdk';
import { S3Handler, S3Event } from "aws-lambda";

const docClient = new AWS.DynamoDB.DocumentClient()
const connectionsTable = process.env.CONNECTIONS_TABLE
const stage = process.env.STAGE
const apiId = process.env.API_ID

const connectParams = {
  apiVersion: '2018-11-29',
  endpoint: `${apiId}.execute-api.ap-south-1.amazonaws.com/${stage}`
}

const apiGateway = new AWS.ApiGatewayManagementApi(connectParams)

export const handler: S3Handler = async (event: S3Event) => {
  for (const record of event.Records) {
    const key = record.s3.object.key
    console.log('Processing S3 Item with Key: ', key)

    const connections = await docClient.scan({
      TableName: connectionsTable
    }).promise()

    const payload = {
      imageId: key
    }

    for(const connection of connections.Items) {
      const connectionId = connection.id
      await sendMessageToClient(connectionId, payload)
    }

  }
}

async function sendMessageToClient(connectionId:string, payload: any) {
  try {
    console.log('Sending message to connection id: ', connectionId)

    await apiGateway.postToConnection({
      ConnectionId: connectionId,
      Data: JSON.stringify(payload)
    }).promise()

  } catch (error) {
    console.log('Failed to send message', JSON.stringify(error))
    if(error.statusCode === 401) {
      console.log('Stale Connection')

      await docClient.delete({
        TableName: connectionsTable,
        Key: {
          id: connectionId
        }
      }).promise()
    }
  }
}