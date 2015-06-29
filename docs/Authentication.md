# Authentication

By default inkrato supports signup via email and acts as it's own email server for account verification and for resetting passwords.

Inkrato includes login support for Facebook, Twitter, Google+ and GitHub  and supports using SendGrid to send emails.

You can configure services by setting environment variables (called "Configuration Variables" in Heroku) or by adding them to secrets.js.

## SendGrid for Email

SendGrid is a mail service as a platform with a free teir for low volume traffic. It's highly recommend you configure inkrato to use SendGrid, instead of it's own internal mail platform.

Environment variables:

* SENDGRID_USER
* SENDGRID_PASSWORD

Configuration steps:

1. Go to https://sendgrid.com/user/signup
2. Sign up and confirm your your account via the activation email
3. Set add `SENDGRID_USER` and `SENDGRID_PASSWORD` Config Variables with your account details.

## Facebook Login

Environment variables:

* FACEBOOK_ID
* FACEBOOK_SECRET

Configuration steps:

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **Apps > Create a New App** in the navigation bar
3. Enter *Display Name*, then choose a category, then click **Create app**
5. Specify *App ID* as the **FACEBOOK_ID** Config Variable
6. Specify *App Secret* as the **FACEBOOK_SECRET** Config Variable
7. Click on *Settings* on the sidebar, then click **+ Add Platform**
8. Select **Website**
9. Enter `http://YOURAPPNAME.herokuapp.com` as the *Site URL*

## Twitter Login

Environment variables:

* TWITTER_KEY
* TWITTER_SECRET
  
Configuration steps:

1. Sign in at [https://dev.twitter.com](https://dev.twitter.com/)
2. From the profile picture dropdown menu select **My Applications**
3. Click **Create a new application**
4. Enter your application name, website and description
5. For **Callback URL**: `http://YOURAPPNAME.herokuapp.com/auth/twitter/callback`
6. Go to **Settings** tab
7. Under *Application Type* select **Read and Write** access
8. Check the box **Allow this application to be used to Sign in with Twitter**
9. Click **Update this Twitter's applications settings**
10. Specify *Consumer Key* as the **TWITTER_KEY** Config Variable
11. Specify *Consumer Secret* as the **TWITTER_SECRET** Config Variable

## Google+ Login

Environment variables:

* GOOGLE_ID
* GOOGLE_SECRET

Configuration steps:

1. Visit [Google Cloud Console](https://cloud.google.com/console/project)
2. Click the **CREATE PROJECT** button
3. Enter *Project Name*, then click **CREATE**
4. Then select *APIs & auth* from the sidebar and click on *Credentials* tab
5. Click **CREATE NEW CLIENT ID** button and enter the following data:
 - **Application Type**: Web Application
 - **Authorized Javascript origins**: `http://YOURAPPNAME.herokuapp.com/`
 - **Authorized redirect URI**: `http://YOURAPPNAME.herokuapp.com/auth/google/callback`
6. Specify *Client ID* as the **GOOGLE_ID** Config Variable
7. Specify *Client Secret* as the **GOOGLE_SECRET** Config Variable
  
## GitHub Login

Environment variables:

* GITHUB_ID
* GITHUB_SECRET
  
Configuration steps:

1. Go to [Account Settings](https://github.com/settings/profile)
2. Select **Applications** from the sidebar
3. Select **Developer applications** then click on **Register new application**
4. Enter *Application Name* and *Homepage URL*.
5. Enter  `http://YOURAPPNAME.herokuapp.com/auth/github/callback` as the *Authorization Callback URL*
6. Click **Register application**
7. Specify *Client ID* as the **GITHUB_ID** Config Variable
8. Specify *Client Secret* as the **GITHUB_SECRET** Config Variable
