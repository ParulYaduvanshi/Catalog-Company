const fs = require('fs');
const readline = require('readline');

// Function to decode values from various bases
function decodeValue(base, value) {
    return parseInt(value, base);
}

// Function to solve for constant term using Lagrange interpolation
function lagrangeInterpolation(points) {
    let c = 0;
    for (let i = 0; i < points.length; i++) {
        let xi = points[i][0], yi = points[i][1];
        let term = yi;
        for (let j = 0; j < points.length; j++) {
            if (i !== j) {
                let xj = points[j][0];
                term *= (0 - xj) / (xi - xj);  // Calculate L(0)
            }
        }
        c += term; // Add the result for each term
    }
    return c;
}

// Function to process JSON data
function processJsonData(data) {
    const keys = data.keys;
    const n = keys.n;
    const k = keys.k;

    const points = [];

    // Collect points (x, y) from the JSON
    for (let key in data) {
        if (key !== 'keys') {
            const base = parseInt(data[key].base);
            const value = data[key].value;
            const x = parseInt(key);  // x is the key of the object
            const y = decodeValue(base, value);  // y is decoded based on its base
            points.push([x, y]);
        }
    }

    if (points.length < k) {
        throw new Error("Not enough points to solve for the polynomial.");
    }

    // Solve for constant term using Lagrange interpolation
    const constantTerm = lagrangeInterpolation(points);
    return constantTerm;
}

// Function to read JSON from file and process it
function readJsonFile(filePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading file:", err);
            return;
        }
        try {
            const jsonData = JSON.parse(data);
            const constantTerm = processJsonData(jsonData);
            console.log("The constant term (c) is:", constantTerm);
        } catch (error) {
            console.error("Error processing JSON data:", error.message);
        }
    });
}

// Function to handle JSON string input
function processJsonString(jsonString) {
    try {
        const jsonData = JSON.parse(jsonString);
        const constantTerm = processJsonData(jsonData);
        console.log("The constant term (c) is:", constantTerm);
    } catch (error) {
        console.error("Error processing JSON string:", error.message);
    }
}

// Function to prompt user for input
function promptUser() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Choose input method:\n1. Enter JSON data directly\n2. Provide a JSON file path\n3. Exit\n', (choice) => {
        if (choice === '1') {
            console.log('Enter JSON data (end with an empty line):');
            let jsonString = '';
            rl.on('line', (line) => {
                if (line.trim() === '') {
                    rl.close();
                    processJsonString(jsonString);
                } else {
                    jsonString += line + '\n';
                }
            });
        } else if (choice === '2') {
            rl.question('Enter the path to the JSON file:\n', (filePath) => {
                readJsonFile(filePath);
                rl.close();
            });
        } else if (choice === '3') {
            console.log('Exiting...');
            rl.close();
        } else {
            console.log('Invalid choice. Exiting...');
            rl.close();
        }
    });
}

// Start the prompt
promptUser();
