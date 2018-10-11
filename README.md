# README &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](#license)  

This application was created to anonymously poll student in class using the fist-to-five technique and a custom Slack slash command. 

The fist-to-five (a.k.a. fist-for-five) technique is used by agile software development teams to poll team members to help achieve consensus or see how well the team is absorbing a topic at hand. For our purpose, we are using it as the latter. Fist to five is similar to thumbs up, thumbs down or thumbs sideways.

Do note that `tonkotsu-oauth.js` makes use of [workspace tokens](https://api.slack.com/docs/token-types#workspace) allowing for a higher level of security as tokens are valid for only 60 minutes. Unfortunately, Slack has stopped issuing any new workspace refresh tokens as this was exclusive to the developer preview community. Nevertheless, workspace access tokens are still valid and will continue to be valid for a while. `ucla-oauth.js` makes use of [User tokens](https://api.slack.com/docs/token-types#user.)

To use, enter `/fist-to-five reset` from within a Slack channel to clear the memory. Then enter, `/fist-to-five` to poll a class. Poll results will be delivered to everyone and continually updated in realtime.

While `ucla-oauth.js` makes use of OAuth 1.0, `tonkotsu-oauth.js` makes use of OAuth 2.0.

<img src="https://a.slack-edge.com/bfaba/img/api/slack_oauth_flow_diagram@2x.png" alt="Image of Slack OAuth 2.0 flow" width="600"/>

## Table of Contents

- [Installation](#installation)
- [Technology](#technology)
- [License](#license)

## Installation

To run locally download to your local machine and run the following commands:

```sh
$ npm install
$ nodemon server.js
```
Set up within Slack is still required (i.e. slash command & interactive message).

Note to self: command to view the log within Heroku is `heroku logs --source app` or `heroku logs --tail` (realtime). 

<sub>Hosting on Heroku using the free tier may result in a slight response delay while the server spins up.</sub>

## Technology

Languages, libraries, applications and packages used:

- [JavaScript (ES6)](http://es6-features.org/)
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [Request](https://www.npmjs.com/package/request)

## License

MIT License

Copyright (c) 2018 Mike Yamato

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.