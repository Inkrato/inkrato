/**
 * Application wide configuration settings
 */
module.exports = {
  
  // The name and contact email address for the site (valid email required)
  name: "inkrato",
  description: "An open source platform for online collaboration",
  email: "feedback@inkrato.com",
  
  // Set this option to true if you have an SSL certificate for your site
  ssl: process.env.FORCE_SSL || false,
  
  // Specify a host like 'www.inkrato.com' to force all requests
  // from other domains to be rediected to that domain
  host: process.env.HOST || false,
  
  // If true then allows members with a valid email address to register to
  // request an API Key and be able to call the API endpoints.
  //
  // Currently recommended only for private instances due to potential for abuse
  api: false,

  // You can opt to have all posts in the same discussion space - which works
  // well for smaller, focused communities - or grouped into forums.
  //
  // You need to specify at least one forum object in the forums[] array below 
  // to enable forums. Leave the array empty if you don't need seperate discussion forums.
  forums: [ 
    { name: "Feedback", icon: "comments-o", description: "Help make inkrato even better" },
    { name: "Sandbox", icon: "wrench", description: "Try out inkrato here" }
  ],
  
  posts: {
    
    // The name, icon and URL path to use for "posts" menu option the site
    // e.g. "Posts", "Issues", "Ideas", "Tickets", "Feedback", "Discussions"...
    //
    // NB: See Font Awesome for the list of icons: http://fontawesome.io/icons
    name: "Discussions",
    icon: "comments",
    
    // Topics, Priorities and States are loaded from here on app startup.
    //
    // You can change the icon, colours and descriptions but if you change the
    // name here a new Topic/Priority/State will be created.
    //
    // To delete an option, just remove it from here and restart the app - it
    // will be marked as deleted and will be no longer selected in the UI.
         
    // The list of topics to use to categorise posts
    topics: [
      { name: "Problems", icon: "warning", description: "Things that aren't working properly" },
      { name: "Suggestions", icon: "lightbulb-o", description: "New features and ideas for improvement" },
      { name: "Questions", icon: "question", description: "Support questions and other enquiries" }
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
    ],
    
    // Allow markdown in posts and comments
    markdown: true
  }
  
};
