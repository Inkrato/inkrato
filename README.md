# inkrato community edition

This is an early release of the inkrato community edition - an open source collaboration platform for teams and communities.

It is designed for community discussion and collaborative issue tracking. It supports login via email, Facebook, Twitter, Google+ and GitHub. Members can post, reply to posts and up or downvote posts. There is also a REST based API.

What's being discussed or tracked (e.g. issues, feedback, ideas) is fully configurable, as are the discussion topics and labels and the UI theme.

You are free to use and modify this software for both non-commercial and commercial purposes. Please bear in mind this is an early release.

You can see an instance of this software running at [https://discussion.inkrato.com](https://discussion.inkrato.com).

## Getting Started

### Deploying to Heroku

The easiest way to gets started is the button below which
will clone this project and deploy a working instance to Heroku:

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/inkrato/inkrato)

You can set **Config Variables** by clicking the **Manage App** button that Heroku dashboard displays after deploying your app for the first time, then selecting **Settings**.

*NB: If only developing and testing locally specify `http://localhost:3000` in place of `http://YOURAPPNAME.herokuapp.com/` in the configuration steps below.*

By default inkrato is it's own mail server (for things like sending password reset emails and API activation keys) but you can find details of how to configure additional servics in **docs/Authentication.md**.

### Deploying locally

If you want to deploy locally, or on your own server, you will need node.js and monogdb installed.

Just clone the respostory, run `npm install` to install required dependancies and `npm start` to start the application.

### Configuring

To configure your instance, edit `config/app.js` and reload the application.

#### Authentication

Authentication details for login services like Facebook and Twitter can be added in `config/secrets.js`. See **docs/Authentication.md** for details.

*IMPORTANT! Don't commit a configured `secrets.js` to a public repository (this would expose private authentication details!).*

You can also pass options at runtime via environment variables.

e.g. `PORT 80 npm start`

Any login options you provide configuration details for (Twitter, Facebook, Google+, GitHub) will automatically appear on the sign-in screen.

#### Email

You can optionally specify a SendGrid account to use for sending emails more faster and more reliably than relying on inkrato to act as it's own mail server. They offer a free tier for low-volume usage and the service provide integrated email list management.

#### Appearance

To customize the user interface theme edit the variables in `public/css/theme.less` and reload the page (new CSS will be auto-generated).

## Security considerations

There is currently no email address verification requirement, rate-limiting, CAPTCHA support or ability to moderate users or spam, meaning there is currently little protection against users with malicious intent.

If there are no user accounts in the system, the first user to login is granted ADMIN access (and can edit any post), but subsequent users have normal privileges and while they can create new posts they can only edit their own posts.

If you wish to grant admin access to additional users you can update the Users collection in monogodb and change their role to 'ADMIN'.

The API is disabled by default. If enabled allows read+write access via a REST interface. See **docs/API.md** for API documentation.

## About the inkrato platform

The inkrato platform has been used as a discussion platform for a wide range of uses - by activists (for the Labour Digital Government Review), charitable organizations (Friends of the Earth) for video game communities (PlanetSide Tracker), by private companies and by local community groups.

The release of this next generation version as open source software allows anyone to take advantage of it host a community site of their own, for free.

Commercial instances and bespoke versions are available on request. Commercial enquires should be sent to feedback@inkrato.com

This version is designed to replace the origional version of inkrato which can still be found at http://feedback.inkrato.com

## Licensing

This software is released under the MIT License.

This projects contains portions of code from Sahat Yalkabov's hackathon-starter project (in particular related to oAuth), which is also released under the MIT License.

License
-------

The MIT License (MIT)

Copyright (c) 2015 inkrato
Portions copyright (c) 2014 Sahat Yalkabov

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
