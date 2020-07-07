import React, { useState } from "react";
import { useQuery, useMutation, queryCache } from "react-query";
import "./App.css";
import { request } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import Linkify from "react-linkify";
import { FETCH_REASONS } from './graphql/queries.ts'
import { DELETE_ITEM, CREATE_NEW_REASON } from "./graphql/mutations.ts";

const authorIdNode = document
  .querySelector(".submission-details > div")
  .querySelectorAll("a")[0].innerText;

const reviewerIdNode = document
  .getElementById("spec-user-username")
  .innerText.toLowerCase();

function App() {
  const [reason, setReason] = useState("")
  const [isVisible, setIsVisible] = useState(false)

  async function getData() {
    return request(`${process.env.REACT_APP_GRAPHQL_HOST}`, FETCH_REASONS, {
      author: authorIdNode,
    })
      .then((data) => data)
      .catch((err) => err);
  }

  async function mutateData(variables) {
    return request(
      `${process.env.REACT_APP_GRAPHQL_HOST}`,
      CREATE_NEW_REASON,
      variables
    )
      .then((data) => data)
      .catch((err) => err);
  }

  async function deleteItemMutation(variables) {
    return request(`${process.env.REACT_APP_GRAPHQL_HOST}`, DELETE_ITEM, variables)
      .then((data) => data)
      .catch((err) => err);
  }

  const { data, isLoading } = useQuery("reasons", getData);
  
  const [mutate] = useMutation(mutateData, {
    onMutate: (newReason) => {
      const previousReasons = queryCache.cancelQueries("reasons");
      queryCache.setQueryData("reasons", (old) => {
        return { reasons: [newReason, ...old.reasons] };
      });
      return () => queryCache.setQueryData("reasons", previousReasons);
    },
    onError: (err, newReason, rollback) => {
      rollback();
    },
    onSettled: () => {
      queryCache.invalidateQueries("reasons");
    },
  });

  const [deleteItem] = useMutation(deleteItemMutation, {
    onMutate: (item) => {
      const previousReasons = queryCache.cancelQueries("reasons");
      queryCache.setQueryData("reasons", (old) => {
        return {
          reasons: old.reasons.filter((reason) => reason.id !== item.id),
        };
      });
      return () => queryCache.setQueryData("reasons", previousReasons);
    }
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="App">
      <button
        className="flag-authors"
        onClick={(e) => {
          e.preventDefault();
          setIsVisible(() => !isVisible);
        }}>
        {isVisible ? "Close" : "Flag Author"}
      </button>
      {isVisible && (
        <form
          className="reasons-form"
          onSubmit={(e) => {
            e.preventDefault();
            const variables = {
              reason,
              authorId: authorIdNode,
              reviewerId: reviewerIdNode,
            };
            mutate(variables, {
              onError: (e) => console.log("error", e),
              onSuccess: (e) => setIsVisible(false),
            });
            setReason("");
          }}>
          <textarea
            onChange={(e) => {
              setReason(e.target.value);
            }}
            name="reason"
            id="reason"
            cols="30"
            value={reason}
            rows="10"></textarea>
          <button type="submit">Send Reason</button>
        </form>
      )}
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
                }}
                >
                [@{reviewerId}]
              </small>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default App;
