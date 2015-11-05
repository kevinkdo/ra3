# ra3
Relational Algebra v3.0 (CS 316 Final Project)

# Proposal
We propose to implement an improved version of RA. The major improvements will be

1. Improved SQL query generation by limiting ourselves to PostgreSQL
2. Terminal emulation in the browser so users can just visit a webpage
3. Graphical relational algebra query generation in the browser

At the end, we plan to demonstrate a fully working RA solution in the browser, allowing users to visit a webpage and immediately start writing queries into a terminal emulator or generating these queries graphically.

This is important and useful because RA is a piece of software used by hundreds of students at both Stanford and Duke, and we aim to make it more easily accessible to casual users interested in relational algebra.

Our general system architecture involves modifying the existing open-source RA code written by Professor Jun Yang to generate SQL queries using nested queries (rather than creating many temporary views) [0]. To accommodate this, we plan to limit RA system administrators to only using PostgreSQL as the backing store. We will also modify this Java code to expose a REST API to be consumed by the frontend.

The frontend will be written in HTML, CSS, and Javascript. We will use React.js for UI management, and D3.js for relational algebra syntax tree generation and visualization.

The backend will be written in Java. We will use the Spark web framework to create a REST endpoint for RA queries. Then, we will process them using ANTLR and our own SQL generation code. We will execute the generated SQL command on a PostgresQL database and return the output to the frontend via JSON.

We have cleared this project with Professor Jun Yang, with whom we discussed our ideas and general architecture in person several weeks ago.

[0] This modification is necessary to support multiple concurrent users. Though we could write some sort of logic to ensure that the views generated by each user don't conflict, we have decided it would be preferable to generate idempotent queries for the sake of simplicity.

# Current Progress
On the front end, the terminal emulator is essentially complete, and can make calls to the primary backend API endpoint that executes RA queries. The GUI for drag and drop AST generation is also complete.

On the back end, the RA parser has been implemented, and we are in the midst of creating detailed error messages for RA queries. The REST endpoint for executing RA queries has also been created so that we can pass JSON objects to the front end. Our application can currently be deployed on Heroku, and a build script has been created to allow users to run the application on a Vagrant VM.

# Tasks to be Completed
- Polish the UI to improve user experience
- Add more REST endpoints to facilitate frontend features
