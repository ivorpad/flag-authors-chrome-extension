export const FETCH_REASONS = `query($author: String!) {
  reasons(orderBy: {createdAt: desc}, where: { authorId: { equals: $author } }) {
    id
    reviewerId
    reason
    authorId
  }
}`;