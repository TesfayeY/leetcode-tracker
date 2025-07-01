declare module "*.graphql?raw" {
    const content: string;
    export default content;
}

declare module '#app' {
  interface NuxtApp {
    $graphqlString: {
      [key: string]: string
    }
  }
}