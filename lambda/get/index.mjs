// Import the low-level DynamoDB client from AWS SDK v3
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"; // Import DynamoDBClient for direct DynamoDB access
// Import the DocumentClient for working with native JS objects and GetCommand for fetching items
import {
    DynamoDBDocumentClient,
    GetCommand,
    ScanCommand,
} from "@aws-sdk/lib-dynamodb"; // Import DocumentClient and GetCommand for easier DynamoDB operations

const client = new DynamoDBClient({}); // Create a new DynamoDB client instance (uses default AWS config)
const docClient = DynamoDBDocumentClient.from(client); // Create a DocumentClient from the low-level client for easier data handling

const tableName = process.env.tableName || "CoffeeShop"; // Define the name of the DynamoDB table, use env var or default

const createResponse = (statusCode, body) => {
    // Helper function to format HTTP responses
    const responseBody = JSON.stringify(body); // Convert body to JSON string
    return {
        statusCode, // Set HTTP status code
        headers: {
            "Content-Type": "application/json", // Set response content type
        },
        body: responseBody, // Set response body
    };
};

export const getCoffee = async (event) => {
    // Lambda handler function
    const { pathParameters } = event; // Extract path parameters from event
    const { id } = pathParameters || {}; // Extract id from path parameters

    try {
        let command; // Will hold the DynamoDB command to execute

        if (id) {
            // If an id is provided in the path
            command = new GetCommand({
                // Create a GetCommand to fetch a single item
                TableName: tableName, // Set the table name
                Key: {
                    // Set the key
                    coffeeId: id, // Set the key to fetch by id
                },
            });
        } else {
            // If no id is provided
            command = new ScanCommand({
                // Create a ScanCommand to fetch all items
                TableName: tableName, // Set the table name
            });
        }
        const response = await docClient.send(command); // Send the command to DynamoDB and await the response
        return createResponse(200, response); // Return a 200 response with the DynamoDB result
    } catch (err) {
        console.error("Error fetching data from DynamoDB:", err); // Log any errors
        return createResponse(500, { error: err.message }); // Return a 500 response with the error message
    }
};
