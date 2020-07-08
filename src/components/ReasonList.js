import React from "react";
import { useQuery, useMutation, queryCache } from "react-query";
import { v4 as uuidv4 } from "uuid";
import Linkify from "react-linkify";
import { getData } from "../graphql/queries";
import { deleteItemMutation } from "../graphql/mutations";

function ReasonList() {
  const { data, isLoading } = useQuery("reasons", getData);

  const [deleteItem] = useMutation(deleteItemMutation, {
    onMutate: (item) => {
      const previousReasons = queryCache.cancelQueries("reasons");
      queryCache.setQueryData("reasons", (old) => {
        return {
          reasons: old.reasons.filter((reason) => reason.id !== item.id),
        };
      });
      return () => queryCache.setQueryData("reasons", previousReasons);
    },
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <ul className="reasons-list">
      {Object.values(data).length > 0 && data.reasons?.length === 0 ? (
        <p>No reports</p>
      ) : (
        data.reasons.map(({ reason, id, reviewerId }) => (
          <li key={uuidv4()}>
            <Linkify>{reason}</Linkify>
            <small
              style={{
                textDecoration: "underline",
                cursor: "pointer",
                color: "blue",
                marginLeft: ".2rem",
              }}
              onClick={(e) => {
                e.preventDefault();
              }}>
              [edit]
            </small>
            <small
              style={{
                textDecoration: "underline",
                cursor: "pointer",
                color: "red",
                marginLeft: ".2rem",
              }}
              onClick={(e) => {
                e.preventDefault();
                deleteItem({ id: +id });
              }}>
              [×]
            </small>
            <small
              style={{
                marginLeft: ".5rem",
              }}>
              [@{reviewerId}]
            </small>
          </li>
        ))
      )}
    </ul>
  );
}

export default ReasonList;
