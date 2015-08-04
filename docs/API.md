# API Documentation

API support must be enabled in `app.js` to use the API.

If API access is enabled, once logged in you can visit your Profile page to request an API Key to be emailed to you so you can access the API endpoints.

You will need to pass the API Key as either a form or query string parameter named 'apikey' or as an HTTP header named 'x-apikey' in each request.

Note: There is currently no 'list' method supported for the API. Currently you can can search, create and edit posts, list the propeties you can set on them and vote on them.

## Security considerations

API access is disabled by default.

If enabled, read and write API access is becomes available to all members - meaning anyone can use it to create, edit and vote on posts.

Although members are only be able to edit their own posts (unless they are moderators or adminstrators) because of the potential for abuse (e.g. posting spam) it is disabled by default and currently recommended for use only on private forums.

## How to pass the API Key

Viewing:

    curl http://127.0.0.1:3000/api/view/1?apikey=2a94819c282bcf0811d28c33223c8c93

    curl --header "x-apikey: 2a94819c282bcf0811d28c33223c8c93" http://127.0.0.1:3000/api/view/1
        

Creating:

    curl --data "apikey=2a94819c282bcf0811d28c33223c8c93&summary=Create+a+post&detail=testing" http://127.0.0.1:3000/api/new

Updating:

    curl --data "apikey=2a94819c282bcf0811d28c33223c8c93&summary=Updating+a+post&detail=testing" http://127.0.0.1:3000/api/edit/1
    
## Example response object

Each 'post' (which could be a ticket, feedback, bug report or something else, depending on how you are using inkrato) looks something like this:

    {
        "_id": "55436f7b921d6babf453d616",
        "postId": 1,
        "topic": {
            "_id": "55436e4cf609fae9f3644b9b",
            "path": "problems",
            "name": "Problems",
            "icon": "warning",
            "description": "Things that aren't working properly",
            "__v": 0,
            "deleted": false,
            "order": 0
        },
        "summary": "This is a summary, the title of the post.",
        "detail": "This is some more detail, the main body of the post. It can contain **markdown**.",
        "creator": '55476d99fa09c09938fd2bb8,
        "__v": 9,
        "comments": [],
        "vote": {
            "negative": [],
            "positive": []
        },
        "_keywords": ["test", "example"],
        "deleted": false,
        "updated": "2015-05-08T14:34:20.564Z",
        "created": "2015-05-01T12:20:11.862Z",
        "tags": []
    }

Notes:

* _id is an internal Object ID ( HEX).
* postId is an auto-incrementing integer ID, and this is the ID you should use when viewing and updating posts.
* Topics, Status and Priorities are optional. They are specified by Object ID (HEX). Currently there is no API to query the available values.

## API Endpoints

### POST /api/new

For submitting a new post.

Parameters:

* String  summary       Required
* String  description   Required
* String  topic         A valid Topic ID (an Object ID), optional
* String  state         A valid State ID (an Object ID), optional
* String  priority      A valid Priority ID (an Object ID), optional

On success you should get a 200 response and a JSON representation of the new post.

### GET /api/view/:id

Pass the postId (a number) in place of ':id' and it will return a JSON representation of the requested post..

### PUT /api/edit/:id

Updates an existing post.

Parameters:

* String  summary       Required
* String  description   Required
* String  topic         A valid Topic ID (an Object ID), optional
* String  state         A valid State ID (an Object ID), optional
* String  priority      A valid Priority ID (an Object ID), optional

On success you should get a 200 response and a JSON representation of the updated post.

### DELETE /api/delete/:id

Deletes an existing post (you must be creator, a moderator or an administrator).

On success you should get a 200 response and a JSON representation of the updated post, which confirms it's new status.

### PUT /api/undelete/:id

Restores a deleted post (you must be creator, a moderator or an administrator).

On success you should get a 200 response and a JSON representation of the updated post, which confirms it's new stus.

### POST /api/upvote/:id

Upvotes a post. You can vote up, down or not at all on a post. Only your last voting action on counts (if you change your vote, your previous votes are discarded).

Pass the postId (a number) in place of ':id' and it will return a JSON response with the updated total score, upvotes and downvotes for that post.

### POST /api/downvote/:id

Downvotes a post. You can vote up, down or not at all on a post. Only your last voting action on counts (if you cange your vote, your previous votes are discarded).


Pass the postId (a number) in place of ':id' and it will return a JSON response with the updated total score, upvotes and downvotes for that post.

### POST /api/unvote/:id

Reset your vote on a post (sets it to neither an upvote or a downvote). You can vote up, down or not at all on a post. Only your last voting action on counts (if you change your vote, your previous votes are discarded).

Pass the postId (a number) in place of ':id' and it will return a JSON response with the updated total score, upvotes and downvotes for that post.

### POST /api/favorite/:id

Add a vote to your favorites, so you can get notifications about it.

Pass the postId (a number) in place of ':id'.

### POST /api/unfavorite/:id

Remove a post from your favorites. You will no longer receive notifications about it.

Pass the postId (a number) in place of ':id'.

### GET /api/search

Parameters:

* String  q             The query string to search for, required

Example response:

    {
      query: String     // The query string
      posts: [ Post ]   // An array of post objects
      count: Number     // Total number of matching results (max 100)
    }

### GET /api/forums

Returns an array of Forum objects (if forums have been configured).

### GET /api/topics

Returns an array of Topic objects.

### GET /api/states

Returns an array of State objects.

### GET /api/priorities

Returns an array of Priority objects.