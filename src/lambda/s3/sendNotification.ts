import { S3Handler, S3Event } from "aws-lambda";

export const handler: S3Handler = async (event: S3Event) => {
  for (const record of event.Records) {
    const key = record.s3.object.key
    console.log('Processing S3 Item with Key: ', key)
  }
}