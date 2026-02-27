import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import type { Note, NoteSummary } from "@naute/shared";

type Item = Record<string, unknown>;

const PARTITION_KEY = "NOTES";
const TABLE_NAME = process.env.TABLE_NAME as string;

const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient(), {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

const getKey = (
  id: string,
): {
  PK: string;
  SK: string;
} => ({ PK: PARTITION_KEY, SK: id });

const getItemFromNote = (note: Note): Item => ({
  ...getKey(note.id),
  ...note,
});

const getNoteFromItem = (item: Item): Note => ({
  id: item.id as string,
  title: item.title as string,
  content: item.content as string,
  tags: item.tags as string[],
  createdAt: item.createdAt as string,
  updatedAt: item.updatedAt as string,
});

const getNoteSummaryFromItem = (item: Item): NoteSummary => ({
  id: item.id as string,
  title: item.title as string,
  tags: item.tags as string[],
  createdAt: item.createdAt as string,
  updatedAt: item.updatedAt as string,
});

export const getNote = async (id: string): Promise<Note | null> => {
  const result = await documentClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: getKey(id),
    }),
  );

  return result.Item ? getNoteFromItem(result.Item) : null;
};

export const putNote = async (note: Note): Promise<void> => {
  await documentClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: getItemFromNote(note),
    }),
  );
};

export const removeNote = async (id: string): Promise<void> => {
  await documentClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: getKey(id),
    }),
  );
};

export const getAllNotes = async (): Promise<NoteSummary[]> => {
  const notes: NoteSummary[] = [];
  let lastEvaluatedKey: Item | undefined;

  do {
    const result = await documentClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: { ":pk": PARTITION_KEY },
        ProjectionExpression: "id, title, tags, createdAt, updatedAt",
        ExclusiveStartKey: lastEvaluatedKey,
      }),
    );

    for (const item of result.Items || []) {
      notes.push(getNoteSummaryFromItem(item));
    }

    lastEvaluatedKey = result.LastEvaluatedKey as Item | undefined;
  } while (lastEvaluatedKey);

  return notes;
};
