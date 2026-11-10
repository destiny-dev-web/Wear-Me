/* The only file you edit to connect the website to the server. */
window.WM_CONFIG = {
  // Where the server lives, with no slash at the end.
  // Testing on your own computer:   "http://localhost:4000"
  // Website and server on one host:  ""   (empty)
  // Live example:                    "https://api.yourdomain.com"
  apiBase: "https://wear-me-admin-production.up.railway.app",

  // How often the pages check the server for new orders and changes, in seconds.
  pollSeconds: 5
};
