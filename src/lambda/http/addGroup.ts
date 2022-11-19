import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { httpResponse } from '../../utils';
import { createGroup } from '../../businessLogic/groups';
import { AddGroupRequest } from '../../requests/AddGroupRequest'


export const handler: APIGatewayProxyHandler = async (_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const parsedBody: AddGroupRequest = JSON.parse(_event.body)
    const authorization = _event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]

    const newItem = await createGroup(parsedBody, jwtToken)

    return httpResponse(201, JSON.stringify({ newItem }))
  } catch (error) {
    return httpResponse(400, JSON.stringify({ error: error.message }))
  }
};