import * as uuid from 'uuid'

import { Group } from '../models/Group'
import { GroupAccess } from '../dataLayer/groupsAccess'
import { AddGroupRequest } from '../requests/AddGroupRequest'
import { getUserId } from '../auth/utils'

const groupAccess = new GroupAccess()

export async function getAllGroups(): Promise<Group[]> {
  return groupAccess.getAllGroups()
}

export async function createGroup(
  createGroupRequest: AddGroupRequest,
  jwtToken: string
): Promise<Group> {

  const itemId = uuid.v4()
  const userId = getUserId(jwtToken)

  return await groupAccess.createGroup({
    id: itemId,
    userId: userId,
    name: createGroupRequest.name,
    description: createGroupRequest.description,
    timestamp: new Date().toISOString()
  })
}

