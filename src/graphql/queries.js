import { request } from "graphql-request";
import { authorIdNode } from "../utils/nodes";

const FETCH_REASONS = `query($author: String!) {
  reasons(orderBy: {createdAt: desc}, where: { authorId: { equals: $author } }) {
    id
    reviewerId
    reason
    authorId
  }
}`;

export async function getData() {
  return request(`${process.env.REACT_APP_GRAPHQL_HOST}`, FETCH_REASONS, {
    author: authorIdNode,
  })
    .then((data) => data)
    .catch((err) => err);
}
