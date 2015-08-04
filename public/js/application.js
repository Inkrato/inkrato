/**
 * These files are included in the header and present when a page is loaded.
 * 
 * main.js depends on these libs but does not load until after the page has been 
 * rendered. This file is loaded first so every page is guaranteed access to
 * things like jQuery, to allow for snippets of inline javascript where needed.
 */
//= require jquery
//= require jquery-ui
//= require bootstrap
//= require underscore
