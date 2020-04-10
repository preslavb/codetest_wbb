# Code Test - Preslav Petrov
This is my submission for the WBB code test. The program runs a local server on port 8080 using Node and Express. 
The server defines a GET route "/name-count/", which takes in a route parameter ":name".<br><br>
<b>For example:</b> <code>GET localhost:8080/name-count/Oliver</code> <br><br>
The route parameter is <b>NOT</b> case-sensitive.
# Setup
To set up the project, just run: <code>npm install</code>
# Run
To run the project, run <code>npm start</code><br>
The server will be initialized, and the results.txt file validated. If the file does not exist, it will be generated before the server
gets initialized. The file is quickly validated every time a request is made, and if it doesn't exist (due to an erroneous deletion)
it will get regenerated.<br><br>

The file can also be generated beforehand with the command <code>npm run generate-results-file</code>.
