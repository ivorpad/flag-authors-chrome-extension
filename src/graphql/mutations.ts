export const CREATE_NEW_REASON = `mutation($reason:String!, $authorId: String!, $reviewerId: String!) {
  createOneReason(reason: $reason, authorId: $authorId, reviewerId: $reviewerId) {
    reason
    authorId
    reviewerId
    id
  }
}`;

export const DELETE_ITEM = `mutation($id: Int!) {
  deleteOneReason(where: { id: $id }) {
    reason
    id
  }
}`;
