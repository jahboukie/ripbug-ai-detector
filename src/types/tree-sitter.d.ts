// Type declarations for tree-sitter modules

declare module 'tree-sitter-javascript' {
  const JavaScript: any;
  export default JavaScript;
}

declare module 'tree-sitter-typescript' {
  const TypeScript: {
    typescript: any;
    tsx: any;
  };
  export default TypeScript;
}
