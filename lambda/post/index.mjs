import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.tableName || "CoffeeShop";

const createResponse = (statusCode, body) => {
    const responseBody = JSON.stringify(body);
    return {
        statusCode,
        headers: {
            "Content-Type": "application/json",
        },
        body: responseBody,
    };
};

export const createCoffee = async (event) => {
    const { body } = event;
    const { coffeeid, name, price, available } = JSON.parse(body);

    console.log("valiues", coffeeid, name, price, available);

    // Check if all required attributes are present
    const required = { coffeeid, name, price, available };
    for (const [key, value] of Object.entries(required)) {
        if (value === undefined || value === "") {
            return createResponse(400, {
                error: `Missing required attribute for the item ${key}.`,
            });
        }
    }

    const command = new PutCommand({
        TableName: tableName,
        Item: {
            coffeeid,
            name,
            price,
            available,
        },
        ConditionExpression: "attribute_not_exists(coffeeid)", // Ensure coffeeid is unique
    });

    try {
        const response = await docClient.send(command);
        return createResponse(201, {
            message: "Coffee created successfully",
            response,
        });
    } catch (err) {
        if ((err.message = "The conditional request failed")) {
            return createResponse(400, {
                error: "Coffee with this ID already exists.",
            });
        } else {
            return createResponse(500, {
                error: "Internal server error",
                message: err.message,
            });
        }
    }
};
