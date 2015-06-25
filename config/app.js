/**
 * Application wide configuration settings
 */
module.exports = {
  
  // The name and contact email address for the site (valid email required)
  name: "gameplay.fail",
  description: "Better feedback, better games.",
  email: "help@gameplay.fail",
  
  // Set this option to true if you have an SSL certificate for your site
  ssl: process.env.FORCE_SSL || false,
  
  // Specify a host like 'www.inkrato.com' to force all requests
  // from other domains to be rediected to that domain
  host: process.env.HOST || false,
  
  // If true then allows members with a valid email address to register to
  // request an API Key and be able to call the API endpoints
  api: false,

  // You can opt to have all posts in the same discussion space - which works
  // well for smaller, focused communities - or grouped into 'forums'.
  //
  // By default 'forums' are turned off. You need to specify at least one forum
  // object in the forums[] array below to enable them.
  //
  // Example forum object:
  // { name: "My feedback forum", icon: "comments", description: "About this  forum" }
  forums: [
    { name: "PlanetSide 2", icon: "comments", description: "The FPS MMO RPG for PC and PS4" }
  ],
  
  posts: {
    
    // The name, icon and URL path to use for "posts" on the site
    // e.g. "Tickets", "Feedback", "Discussions"
    // NB: The icons are from http://fontawesome.io/icons
    name: "Games",
    icon: "gamepad",
    
    // Topics, Priorities and States are loaded from here on app startup.
    //
    // You can change the icon, colours and descriptions but if you change the
    // name here a new Topic/Priority/State will be created.
    //
    // To delete an option, just remove it from here and restart the app - it
    // will be marked as deleted and will be no longer selected in the UI.
         
    // The list of topics to use to categorize posts
    topics: [
      { name: "Bugs", icon: "bug", description: "Things that aren't working properly" },
      { name: "Ideas", icon: "lightbulb-o", description: "Share ideas for improvement" },
      { name: "Questions", icon: "question", description: "Get for help and support" },
      { name: "Tips", icon: "gamepad", description: "Share tips and advice" }
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
      { name: "Unresolved", open: true },
      { name: "Resolved", open: false }
    ],
    
    // Allow markdown in posts and comments
    markdown: true
  }
  
};
