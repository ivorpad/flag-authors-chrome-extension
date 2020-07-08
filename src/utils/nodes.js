export const authorIdNode = document
  .querySelector(".submission-details > div")
  .querySelectorAll("a")[0].innerText;

export const reviewerIdNode = document
  .getElementById("spec-user-username")
  .innerText.toLowerCase();
