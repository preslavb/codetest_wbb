import fileSystem, { ReadStream, promises } from "fs";
import readline from "readline";

export class NamesTableGenerator {

    // The first character lookup table
    private _firstCharLookupTable: FirstCharIndexTable = {
        'a': 0,
        'b': 0,
        'c': 0,
        'd': 0,
        'e': 0,
        'f': 0,
        'g': 0,
        'h': 0,
        'i': 0,
        'j': 0,
        'k': 0,
        'l': 0,
        'm': 0,
        'n': 0,
        'o': 0,
        'p': 0,
        'q': 0,
        'r': 0,
        's': 0,
        't': 0,
        'u': 0,
        'v': 0,
        'w': 0,
        'x': 0,
        'y': 0,
        'z': 0
    };

    // Generate the names file
    public async generateNamesFile() {

        // Populate the array with first names
        const namesOccurrences = await this.createArrayOfOccurrences();

        // Count the occurances in the file
        const sortedFilteredOccurrences = await this.countOccurrences(namesOccurrences);

        // Store the result in a new file
        await this.storeResults(sortedFilteredOccurrences);
    }

    // Validate that the file is present, and if not, regenerate it
    public async validateFile() {

        // Check if the file exists
        try {
            fileSystem.accessSync("./public/results.txt", fileSystem.constants.F_OK);

            return;

        } catch(error){

            // The file doesn't exist, so regenerate it
            await this.generateNamesFile();
        }
    }

    // Create the array of names occurrences
    private async createArrayOfOccurrences() {

        // Create the new array
        const newArray: NamesOccurrence[] = [];

        // Populate the array with the names
        await this.processNames(newArray);

        return newArray;
    }

    // Process the names into an array
    private async processNames(occurrenceArray: NamesOccurrence[]) {

        // Create our file stream
        const fileStream = fileSystem.createReadStream("./public/first-names.txt", {
            encoding: "utf-8"
        });

        // Create our readline interface
        const readLineInterface = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        // Character index counter
        let counter = 0;

        // The last char encountered
        let lastChar = 'a';

        // Iterate over the lines
        for await (const line of readLineInterface) {

            const firstChar = line[0].toLowerCase();

            // If the line starts with a different character, store the name index as the first for that character
            if (firstChar !== lastChar) {
                this._firstCharLookupTable[firstChar] = counter;

                lastChar = firstChar;
            }

            counter++;

            // Populate the occurrence array
            occurrenceArray.push({
                name: line,
                count: 0
            });
        }

        // Close the read line interface
        readLineInterface.close();

        // Close the file stream
        fileStream.close();
    }

    /**
     * This method loads in the oliver-twist.txt file and parses it line by line, word by word.
     * For each word, a sanity check is done to see if it starts with a capital letter. If it does, the algorithm will
     * find the occurrence array index, at which names of the same first character begin, and iterate only through those names to check for matches.
     * If a match is found, the occurrence count will be incremented.
     * @param occurrenceArray
     */
    private async countOccurrences(occurrenceArray: NamesOccurrence[]) {

        // Create our file stream
        const fileStream = fileSystem.createReadStream("./public/oliver-twist.txt", {
            encoding: "utf-8"
        });

        // Create our readline interface
        const readLineInterface = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        // Read the lines
        for await (const line of readLineInterface) {

            // Split the line into words (no symbols)
            const words = line.match(/(\b[^\s]+\b)/g);

            // If the line is blank, abort line
            if (words === null) continue;

            // Iterate over the words
            words.forEach(word => {

                // Check if the words is a name
                const isAPotentialName = this.checkIfWordIsPotentialName(word);
                const firstChar = word[0].toLowerCase();

                if (isAPotentialName) {

                    // Look the word up in the occurrence array
                    for (let i = this.getNamesIndexWithFirstChar(firstChar); i < this.getNamesIndexWithNextChar(firstChar, occurrenceArray); i++) {
                        if (word === occurrenceArray[i].name) {
                            occurrenceArray[i].count++;
                            break;
                        }
                    }
                }
            });
        };

        // Close the read line interface
        readLineInterface.close();

        // Close the file stream
        fileStream.close();

        // Filter out the names without a match and sort in descending order
        const filteredSortedOccurrenceArray = occurrenceArray.filter(value => value.count > 0).sort((a, b) => b.count - a.count);

        return filteredSortedOccurrenceArray;
    }

    // Create the resulting file and store it in public/
    private async storeResults(occurrenceArray: NamesOccurrence[]) {

        // Declare the result string
        let resultString = "";

        // Write out the names and occurrences
        occurrenceArray.forEach(occurrence => {
            resultString += `${occurrence.name}: ${occurrence.count}\n`;
        });

        fileSystem.writeFileSync("./public/results.txt", resultString, {
            encoding: "utf-8"
        });
    }

    // Macro. Checks if the first character of the word is uppercase
    private checkIfWordIsPotentialName(word: string) {
        return word[0] === word[0].toUpperCase();
    }

    // Get the index at which the names with a specified first character start
    private getNamesIndexWithFirstChar(firstChar: string) {
        return this._firstCharLookupTable[firstChar[0]];
    }

    // Get the index at which the names with the next character start
    private getNamesIndexWithNextChar(firstChar: string, occurrenceArray: NamesOccurrence[]) {

        // Get the next char
        const firstCharLowerCase = firstChar.toLowerCase()[0];
        const nextChar = String.fromCharCode(firstCharLowerCase.charCodeAt(0) + 1);

        // If the character is within the bounds, return the index
        if (firstCharLowerCase.charCodeAt(0) < "z".charCodeAt(0)) {
            return this._firstCharLookupTable[nextChar];
        }

        // Otherwise, return the end of the the occurrence array
        else {
            return occurrenceArray.length;
        }
    }
};

interface NamesOccurrence {
    name: string,
    count: number
}

// A table to look up the index of the specified character's first occurance
interface FirstCharIndexTable {
    [index: string]: number;
    'a': number,
    'b': number,
    'c': number,
    'd': number,
    'e': number,
    'f': number,
    'g': number,
    'h': number,
    'i': number,
    'j': number,
    'k': number,
    'l': number,
    'm': number,
    'n': number,
    'o': number,
    'p': number,
    'q': number,
    'r': number,
    's': number,
    't': number,
    'u': number,
    'v': number,
    'w': number,
    'x': number,
    'y': number,
    'z': number
}

export default NamesTableGenerator;