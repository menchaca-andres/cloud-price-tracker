import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const isLocal = !!process.env.DYNAMO_ENDPOINT;

const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    ...(isLocal && {
        endpoint: process.env.DYNAMO_ENDPOINT,
        credencials: {
            accessKeyId: process.env.ACCESS_KEY,
            secretAccessKey: process.env.SECRET_ACCESS_KEY,
        },
    }),
});

export const docClient = DynamoDBDocumentClient.from(client);
export { client };