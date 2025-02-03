export interface Hierarchy {
  [key: string]: string | Hierarchy | (string | Hierarchy)[];
}

/**
 * Read a string and return a corresponding structure
 * - Example: "A + B + C" => [A, B, C]
 * - Example: "A => (B + C)" => [{ A: [B, C] }]
 */
export function parseTrackHierarchy(input: string): (string | Hierarchy)[] {
  const text = input.trim();

  // Space out the input string for easier tokenization
  const spaced = text.replace(/((=>)|[+]|[(]|[)])/g, "_$1_");
  const tokens = spaced
    .split(/\_/)
    .filter(Boolean)
    .map((s) => s.trim());

  // Recursive function to parse tokens into a nested structure
  function parseExpression(index: number): [(string | Hierarchy)[], number] {
    const children: (string | Hierarchy)[] = [];

    // Iterate through all the matching tokens
    while (index < tokens.length) {
      const token = tokens[index++];

      // If nesting a group, try to merge the nodes
      if (token === "=>") {
        const parent = children.pop();
        if (!parent) break;
        const [child, newIndex] = parseExpression(index);

        // Make sure the parent is a single node
        if (typeof parent !== "string") break;

        children.push({ [parent]: child });
        index = newIndex;
      }

      // If starting a group, parse recursively
      else if (token === "(") {
        const [group, newIndex] = parseExpression(index);
        children.push(...group);
        index = newIndex;
      }

      // If ending a group, return the current nodes
      else if (token === ")") {
        return [children, index--];
      }

      // Otherwise, add the node to the current level
      else if (token === "+") continue;
      else children.push(token);
    }
    return [children, index];
  }

  // Begin parsing from index 0
  const [parsedTree] = parseExpression(0);
  return parsedTree;
}
