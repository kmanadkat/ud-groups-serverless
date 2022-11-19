import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { httpResponse } from "../../utils";
import { getAllGroups } from '../../businessLogic/groups';

export const handler: APIGatewayProxyHandler = async (_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Get Data From AWS DynamoDB
    const groups = await getAllGroups()

    // Send Back Items
    return httpResponse(200, JSON.stringify({
      data: groups
    }))
  } catch (error) {
    return httpResponse(400, JSON.stringify({ error: error.message }))
  }
};
