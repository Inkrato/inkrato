/**
 * Application wide configuration settings
 */
module.exports = {
  
  // The name and contact email address
  name: "inkrato",
  email: "feedback@inkrato.com",
  
  ssl: process.env.FORCE_SSL || false,
  
  posts: {
    // The name and URL path to use for "posts" on the site
    name: "Issues",
    path: "/issues/",
    icon: "list",
    // The list of topics to use to categorise posts
    topics: [
      { name: "Problems", icon: "warning", description: "Things that aren't working properly" },
      { name: "Suggestions", icon: "lightbulb-o", description: "New features and ideas for improvement" },
      { name: "Questions", icon: "question", description: "Support questions and other enquiries" },
    ],
    // List of labels to allow on posts
    priorities: [
      { name: "Critical", color: "#cc0033" },
      { name: "High", color: "#f99823" },
      { name: "Normal", color: "#6d9a39" },
      { name: "Low", color: "#3b93d8" },
      { name: "Trivial", color: "#a3a5a5" },
    ],
    // List of states to allow on posts
    states: [
      { name: "Open", open: true },
      { name: "In Progress", open: true },
      { name: "Closed", open: false }
    ]
  }
  
};