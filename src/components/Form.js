import React, { useState, createRef, useEffect } from "react";
import { useMutation, queryCache } from "react-query";
import { createItemMutation } from "../graphql/mutations";
import Button from "./Button";
import { authorIdNode, reviewerIdNode } from "../utils/nodes";

const formRef = createRef(null);

function Form() {
  const [isVisible, setIsVisible] = useState(false);
  const [reason, setReason] = useState("");

  const [createItem, { isLoading }] = useMutation(createItemMutation, {
    onMutate: (newReason) => {
      const previousReasons = queryCache.cancelQueries("reasons");
      queryCache.setQueryData("reasons", (old) => {
        return { reasons: [newReason, ...old.reasons] };
      });
      return () => queryCache.setQueryData("reasons", previousReasons);
    },
    onError: (_err, _newReason, rollback) => {
      rollback();
    },
    onSettled: () => {
      queryCache.invalidateQueries("reasons");
    },
  });

  useEffect(() => {
    if (isVisible) {
      formRef.current.focus();
    }
  }, [isVisible]);

  return (
    <>
      <Button isVisible={isVisible} setIsVisible={setIsVisible} />
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
            createItem(variables, {
              onError: (e) => console.log("error", e),
              onSuccess: () => {
                setIsVisible(false);
              },
            });
            setReason("");
          }}>
          <textarea
            ref={formRef}
            onChange={(e) => {
              setReason(e.target.value);
            }}
            disabled={isLoading}
            name="reason"
            id="reason"
            cols="30"
            value={reason}
            rows="10"></textarea>
          <button type="submit">Send Reason</button>
        </form>
      )}
    </>
  );
}

export default Form;
