import { readFileSync, readdirSync } from "node:fs";
import { resolve, basename } from 'node:path';

export default function graphqlParse(desiredFileName: string): string { 
  const graphqlDir = resolve(process.cwd(), 'src/graphql');
  try {
    const graphqlFiles = readdirSync(graphqlDir);

    for (const file of graphqlFiles) {
      if (file.endsWith('.graphql')) {
        const fileName = basename(file, '.graphql');
        
        if (fileName === desiredFileName) {
          const filePath = resolve(graphqlDir, file);
          console.log(`[graphqlParse] Found and read: ${file}`);
          return readFileSync(filePath, 'utf-8');
        }
      }
    }
    console.warn(`[graphqlParse] GraphQL file '${desiredFileName}.graphql' not found in ${graphqlDir}.`);
    return '';

  } catch (error: any) {
    console.error(`[graphqlParse] Failed to read GraphQL files from ${graphqlDir}:`, error);
    return '';
  }
}