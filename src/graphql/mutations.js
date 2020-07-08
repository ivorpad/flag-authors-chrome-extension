import { request } from "graphql-request";

const CREATE_NEW_REASON = `mutation($reason:String!, $authorId: String!, $reviewerId: String!) {
  createOneReason(reason: $reason, authorId: $authorId, reviewerId: $reviewerId) {
    reason
    authorId
    reviewerId
    id
  }
}`;

const DELETE_ITEM = `mutation($id: Int!) {
  deleteOneReason(where: { id: $id }) {
    reason
    id
  }
}`;

export async function createItemMutation(variables) {
  return request(
    `${process.env.REACT_APP_GRAPHQL_HOST}`,
    CREATE_NEW_REASON,
    variables
  )
    .then((data) => data)
    .catch((err) => err);
}

export async function deleteItemMutation(variables) {
  return request(
    `${process.env.REACT_APP_GRAPHQL_HOST}`,
    DELETE_ITEM,
    variables
  )
    .then((data) => data)
    .catch((err) => err);
}
