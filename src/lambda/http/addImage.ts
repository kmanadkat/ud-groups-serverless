import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { v4 as uuid } from 'uuid';
import { httpResponse } from "../../utils";
import { getUserId } from '../../auth/utils';

const XAWS = AWSXRay.captureAWS(AWS)
const docClient = new XAWS.DynamoDB.DocumentClient()

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
});

const groupsTable = process.env.GROUPS_TABLE
const imagesTable = process.env.IMAGES_TABLE
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler: APIGatewayProxyHandler = async (_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const groupId = _event.pathParameters.groupId
    const authorization = _event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]
    const userId = getUserId(jwtToken)

    // Validate Group
    const validGroupId = await _groupExists(groupId)
    if (!validGroupId) {
      return httpResponse(404, JSON.stringify({ error: `Group ${groupId} does not exists` }))
    }

    // Add Image To DB
    const { title } = JSON.parse(_event.body)
    const imageId = uuid()
    const newItem = {
      title,
      groupId,
      timestamp: new Date().toISOString(),
      imageId,
      imageUrl: `https://${bucketName}.s3.amazonaws.com/${imageId}`,
      userId
    }

    await docClient.put({
      TableName: imagesTable,
      Item: newItem
    }).promise()

    // Create Signed URL
    const url = _getUploadUrl(imageId)

    // Send Back Items
    return httpResponse(201, JSON.stringify({ newItem, uploadUrl: url }))
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

const _getUploadUrl = (key: string) => {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: key,
    Expires: parseInt(urlExpiration),
  });
}