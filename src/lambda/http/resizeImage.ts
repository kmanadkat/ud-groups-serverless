import { SNSHandler, SNSEvent, S3EventRecord } from "aws-lambda"
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import Jimp from 'jimp/es';

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3()

const imagesBucketName = process.env.IMAGES_S3_BUCKET
const thumbnailBucketName = process.env.THUMBNAILS_S3_BUCKET

export const handler: SNSHandler = async (event: SNSEvent)  => {
  console.log('Processing SNS Event: ', JSON.stringify(event))
  for(const snsRecord of event.Records) {
    const s3EventStr = snsRecord.Sns.Message
    console.log('Processing S3 event', s3EventStr)
    const s3Event = JSON.parse(s3EventStr)

    for (const record of s3Event.Records) {
      // "record" is an instance of S3EventRecord
      await processImage(record) // A function that should resize each image      
    }
  }
}

const processImage = async (record: S3EventRecord) => {
  try {
    const key = record.s3.object.key
    const response = await s3.getObject({
      Bucket: imagesBucketName,
      Key: key
    }).promise()
  
    const body = response.Body as Buffer
    const image = await Jimp.read(body)
    image.resize(150, Jimp.AUTO)
  
    // Convert an image to a buffer that we can write to a different bucket
    const convertedBuffer = await image.getBufferAsync(image.getMIME())
    await s3.putObject({
      Bucket: thumbnailBucketName,
      Key: `${key}.jpeg`,
      Body: convertedBuffer
    }).promise() 
  } catch (error) {
    console.log(JSON.stringify(error))
  }
}