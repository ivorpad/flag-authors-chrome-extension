import React, { useEffect, useState } from "react";
import { useQuery, useMutation, queryCache } from "react-query";
import "./App.css";
import { request } from "graphql-request";
import { v4 as uuidv4 } from "uuid";
import Linkify from "react-linkify";

const FETCH_REASONS = `query($author: String!) {
  reasons(orderBy: {createdAt: desc}, where: { authorId: { equals: $author } }) {
    id
    reviewerId
    reason
    authorId
  }
}`;

const CREATE_NEW_REASON = `mutation($reason:String! $authorId: String! $reviewerId: String!) {
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

function App() {

  const [pageData, setPageData] = useState({})
  const [reason, setReason] = useState("")
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {

    const authorId = document
      .querySelector(".submission-details > div")
      .querySelectorAll("a")[0].innerText;

    const reviewerId = document
      .getElementById("spec-user-username")
      .innerText.toLowerCase();
  
      setPageData({
        authorId,
        reviewerId,
      });

  }, []);

  async function getData() {
    const author = document
      .querySelector(".submission-details > div")
      .querySelectorAll("a")[0].innerText;

    return request(`${process.env.REACT_APP_GRAPHQL_HOST}`, FETCH_REASONS, {
      author,
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
        {isVisible ? "× Close" : "Flag Author"}
      </button>
      {isVisible && (
        <form
          className="reasons-form"
          onSubmit={(e) => {
            e.preventDefault();
            const variables = {
              reason,
              authorId: pageData.authorId,
              reviewerId: pageData.reviewerId,
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
