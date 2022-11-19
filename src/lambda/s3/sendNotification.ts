import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk'
import { S3Event, SNSHandler, SNSEvent } from "aws-lambda";

const XAWS = AWSXRay.captureAWS(AWS)
const docClient = new XAWS.DynamoDB.DocumentClient()
const connectionsTable = process.env.CONNECTIONS_TABLE
const stage = process.env.STAGE
const apiId = process.env.API_ID

const connectParams = {
  apiVersion: '2018-11-29',
  endpoint: `${apiId}.execute-api.ap-south-1.amazonaws.com/${stage}`
}

const apiGateway = new XAWS.ApiGatewayManagementApi(connectParams)

export const handler: SNSHandler = async (event: SNSEvent)  => {
  console.log('Processing SNS Event: ', JSON.stringify(event))
  for(const snsRecord of event.Records) {
    const s3EventStr = snsRecord.Sns.Message
    console.log('Processing S3 event', s3EventStr)
    const s3Event = JSON.parse(s3EventStr)
    
    await processS3Event(s3Event)
  }
}

async function processS3Event(s3Event: S3Event) {
  for (const record of s3Event.Records) {
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