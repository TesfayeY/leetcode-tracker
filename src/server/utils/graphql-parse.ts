import { readFileSync, readdirSync } from "fs";
import { resolve, basename } from 'path';

export default function readGraphqlFiles(desiredFileName: string) {
  const graphqlDir = resolve(process.cwd(), 'src/graphql');
  let queryString: string = '';

  try {
    const graphqlFiles = readdirSync(graphqlDir);

    for (const file of graphqlFiles) {
      if (file.endsWith('.graphql')) {
        const filePath = resolve(graphqlDir, file);
        const fileName = basename(file, '.graphql');
        
        if (fileName === desiredFileName) {
          queryString = readFileSync(filePath, 'utf-8');
        }
      }
    }
    console.log("Parse graphql complete");
    return queryString;
  } catch (error: any) {
    console.log("Failed to parse graphql", error);
  }
}