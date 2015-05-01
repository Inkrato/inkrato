/**
 * Application wide configuration settings
 */
module.exports = {
  
  // The name and contact email address
  name: "inkrato",
  email: "feedback@inkrato.com",
  
  posts: {
    // The name and URL path to use for "posts" on the site
    name: "Discussion",
    path: "/discussion/",
    icon: "comment",
    // The list of topics to use to categorise posts
    topics: [
      { name: "Problems", icon: "warning", description: "Things that aren't working properly" },
      { name: "Suggestions", icon: "lightbulb-o", description: "New features and ideas for improvement" },
      { name: "Questions", icon: "question-circle", description: "Support questions and other enquiries" }
    ]
  }
  
};