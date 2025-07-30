document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevents the default form submission
    window.location.href = "dashboard.html"; // Redirects to the dashboard
  });

document.addEventListener("DOMContentLoaded", function () {
  const signupLink = document.querySelector(".signup-link");
  if (signupLink) {
    signupLink.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "../signup.html";
    });
  }
});
