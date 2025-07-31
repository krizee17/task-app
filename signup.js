document.addEventListener('DOMContentLoaded', function() {
  const signupForm = document.querySelector('.signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
      e.preventDefault();
      // Simulate successful signup, then redirect
      window.location.href = 'index.html';
    });
  }
  // Also handle the 'Sign In' link
  const signinLink = document.querySelector('.signin-link a');
  if (signinLink) {
    signinLink.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = 'index.html';
    });
  }
});
