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

# Code overview
The frontend and backend are in separate repositories.

The frontend code is in ra3/src/frontend. The webpage is index.html, and the Javascript is spread across main.js (globals), left.js (left pane), and right.js (right pane).

# How to build
Serve the frontend by `cd`ing to the `ra3/src/frontend` directory and running `python -m SimpleHTTPServer'. You may need to modify the DOMAIN global variable to match whatever port the Java backend is exposed on in the next step.



    1. Clone the repo
    2. Create the VM (using the command "vagrant up")
    3. SSH into the VM ("vagrant ssh")
    4. Go to the shared directory ("cd /vagrant")
    5. Run the build script "init.sh" ("./init.sh")
        - This will take a while
        - You will be prompted to accept an OpenJDK agreement, you must
            accept this for the installation to be successful
    6. Run the server using the command specified at the end of the prompt
        ("java -jar /vagrant/target/ra3-1.0-SNAPSHOT-jar-with-dependencies.jar")
    7. You can now access the website on your host machine @ localhost:8080
