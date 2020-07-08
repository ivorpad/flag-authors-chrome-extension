import React from "react";

function Button({ isVisible, setIsVisible }) {
  return (
    <button
      className="flag-authors"
      onClick={(e) => {
        e.preventDefault();
        setIsVisible(() => !isVisible);
      }}>
      {isVisible ? "Close" : "Flag Author"}
    </button>
  );
}

export default Button;
