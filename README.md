# inkrato community edition

This is an early release of the inkrato community edition - an open source collaboration platform for teams and communities.

This version ships will fully working core functionality (including an API) but does not yet have some of the more sophisticated and deverse functionality of the propriatory version.

You are free to use and modify this software for both non-commercial and commercial purposes.

You can see an instance of this software running at https:///www.inkrato.com

## Getting Started

You will need node.js and monogdb installed. After downloading be sure to run `npm install` to install required dependancies.

To configure, edit `config/app.js` and `config/secrets.js` with your settings and run `npm start` to start the application running on port 3000.

You can also pass options at runtime via environment variables:

    > PORT 80 npm start

To customise the user interface theme edit the variables in `public/css/theme.less` and reload the page (the CSS will be auto-generated).

### Configuring secrets.js

IMPORTANT! You should not commit a configured secrets.js to a public repository.

Any oAuth options you provide configuration details for (Twitter, Facebook, Google) will automatically appear on the sign-in screen.

Only SendGrid is currently supported for email (which must be configred for features like password reset and API Key access to work). They offer a free teir for low-volume usage.

## Using the API

Once logged in you can visit your Profile page to request an API Key to be emailed to you. You can then access the API endpoints documented below.

You will need to pass the API Key as either a form or query string parameter named 'apikey' or as an HTTP header named 'x-apikey' in each request.

### How to pass the API Key

Viewing:

    curl http://127.0.0.1:3000/api/view/1?apikey=2a94819c282bcf0811d28c33223c8c93

    curl --header "x-apikey: 2a94819c282bcf0811d28c33223c8c93" http://127.0.0.1:3000/api/view/1
        

Creating:

    curl --data "apikey=2a94819c282bcf0811d28c33223c8c93&title=Create+a+post&description=testing" http://127.0.0.1:3000/api/new

Updating:

    curl --data "apikey=2a94819c282bcf0811d28c33223c8c93&title=Updating+a+post&description=testing" http://127.0.0.1:3000/api/edit/1
    
### Example response object

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
        "title": "This is an example title",
        "description": "This is an example description",
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
* postId is an autoincrimenting integer ID, and this is the ID you shoud use when viewing and updating posts.
* Topics, Status and Priorites are optional. They are specified by Object ID (HEX). Currently there is no API to query the avalible values.

### API Endpoints

#### POST /api/new

For submitting a new post.

Parameters:

* String  title         Required
* String  description   Required
* String  topic         A valid Topic ID (an Object ID), optional
* String  state         A valid State ID (an Object ID), optional
* String  priority      A valid Priority ID (an Object ID), optional

On success you should get a 200 response and a JSON represenation of the new post.

#### GET /api/view/:id

Pass the postId (a number) in place of ':id' and it will return a JSON respresentation of the requested post..

#### POST /api/edit/:id

Updates an existing post.

Parameters:

* String  title         Required
* String  description   Required
* String  topic         A valid Topic ID (an Object ID), optional
* String  state         A valid State ID (an Object ID), optional
* String  priority      A valid Priority ID (an Object ID), optional

On success you should get a 200 response and a JSON represenation of the updated post.

#### POST /api/upvote/:id

Upvotes a post. You can vote up, down or not at all on a post. Only your last voting action on counts (if you cange your vote, your previous votes are discarded).

Pass the postId (a number) in place of ':id' and it will return a JSON response with the updated total score, upvotes and downvotes for that post.

#### POST /api/downvote/:id

Downvotes a post. You can vote up, down or not at all on a post. Only your last voting action on counts (if you cange your vote, your previous votes are discarded).


Pass the postId (a number) in place of ':id' and it will return a JSON response with the updated total score, upvotes and downvotes for that post.

### POST /api/unvote/:id

Reset your vote on a post (sets it to neither an upvote or a downvote). You can vote up, down or not at all on a post. Only your last voting action on counts (if you cange your vote, your previous votes are discarded).

Pass the postId (a number) in place of ':id' and it will return a JSON response with the updated total score, upvotes and downvotes for that post.

### GET /api/search

Parameters:

* String  q             The query string to search for, required

Example response:

    {
      query: String     // The query string
      posts: [ Post ]   // An array of post objects
      count: Number     // Total number of matching results (max 100)
    }

### GET /api/topics

Returns an array of the valid Topic objects (and their id value).

### GET /api/states

Returns an array of the valid Priority objects (and their id value).

### GET /api/priorities

Returns an array of the valid Priority objects (and their id value).

## Security considerations

There is currently no email address verification requirement, rate-limiting, capatcha support or ability to moderate users or spam, meaning there is currently little protection against users with malicious intent.

If there are no user accounts in the system, the first user to login is granted ADMIN access (and can edit any post), but subsequent users have normal privileges and while they can create new posts they can only edit their own posts.

If you wish to grant admin access to additional users you can update the monogo db Users collection to change their role property to 'ADMIN' (other roles are not yet supported).

## About the inkrato platform

The inkrato platform has been used as a feedback platform for a wide range of uses - by activists (for the Labour Digital Goverment Review), charitable organisations (Friends of the Earth) for video game communites (PlanetSide Tracker), by private companies and by local community groups.

The release of this next generation version as open source software allows anyone to take advantage of it host a community site of their own, for free.

Commercial instances and bespoke versions are available on request. Commercial enquires should be sent to feedback@inkrato.com

This version will eventually replace the current, proprietary version of inkrato at http://feedback.inkrato.com

## Licensing

This software is released to the community under the MIT Licence.

This projects contains portions of code from the hackathon-starter project (in particular related to oAuth) by Sahat Yalkabov, which is incorporated under the MIT License.

License
-------

The MIT License (MIT)

Copyright (c) 2015 inkrato
Portions copyright (c) 2014 Sahat Yalkabov

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.