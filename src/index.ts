import readline from 'readline';
import fileSystem, {ReadStream} from 'fs';
import express from "express";
import { NamesTableGenerator } from "./generate-names-table";

// Load in the express app
const app = express();
const port = 8080;

// Load in the names table generator
const namesTableGenerator: NamesTableGenerator = new NamesTableGenerator();

// Validate the file is created before starting the server
namesTableGenerator.validateFile().then(() => {

    // Define the route
    app.get<RequestQuerySignature, ResponseSignature, any>( "/name-count/:name", async ( req, res ) => {

        // Store the requested name
        const requestedName = req.params.name.toLowerCase();

        // Make sure we have the file available
        await namesTableGenerator.validateFile();

        // Load in the file
        const readStream = fileSystem.createReadStream("./public/results.txt", {
            encoding: "utf-8"
        });

        // Create the readline stream
        const readLineStream = readline.createInterface(readStream);

        // Create the default answer
        let answer = 0;

        // Search for the name provided
        for await (const line of readLineStream) {

            const result = line.split(":");

            if (result[0].toLowerCase() === requestedName) {
                answer = parseInt(result[1], 10);
                break;
            }
        }

        // Close the streams before sending the response
        readLineStream.close();
        readStream.close();

        res.send( {
            name: req.params.name,
            value: answer
        } );
    } );

    // Start the Express server
    app.listen( port, () => {
        console.log( `Server started at http://localhost:${ port }` );
    } );
});

// Response signature
interface ResponseSignature {
    name: string,
    value: number
}

// Request query signature
interface RequestQuerySignature {
    [index: string] : string | undefined,
    name: string
}