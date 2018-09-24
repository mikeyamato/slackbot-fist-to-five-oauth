# README &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](#license)  

This application was created to randomly select a student in class using a custom Slack slash command followed with the day of class. Options are `/victim mw`, `/victim tth` and `/victim sat`.   

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

Note to self: command to view the log within Heroku is `heroku logs --source app`

<sub>Hosting on Heroku using the free tier may result in a slight response delay while the server spins up.</sub>

## Technology

Languages, libraries, applications and packages used:

- [JavaScript (ES6)](http://es6-features.org/)
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [Heroku](https://www.heroku.com/)

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