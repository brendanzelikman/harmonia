const input = process.argv.at(2);
console.log(input);
if (!input) return;

function parseTrackHierarchy(input) {
  const text = input.trim();

  // Space out the input string for easier tokenization
  const spaced = text.replace(/((=>|->)|[+]|[(]|[)])/g, "_$1_");
  const tokens = spaced
    .split(/\_/)
    .filter(Boolean)
    .map((s) => s.trim());

  // Recursive function to parse tokens into a nested structure
  function parseExpression(index) {
    const children = [];

    // Iterate through all the matching tokens
    while (index < tokens.length) {
      const token = tokens[index++];

      // If nesting a group, try to merge the nodes
      if (token === "=>" || token === "->" || token === "→") {
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
      else if (token !== "") children.push(token);
    }
    return [children, index];
  }

  // Begin parsing from index 0
  const [parsedTree] = parseExpression(0);

  const numberToUpper = (number) =>
    String.fromCharCode(number.toString().charCodeAt(0) + 17);

  // Print out the hierarchy line by line
  function printTree(tree, level = 0, label = [0]) {
    for (const node of tree) {
      if (typeof node === "string") {
        console.log("Node", node);
        console.log("Depth:", level);
        console.log("Label:", `${label.map(numberToUpper).join("")}\n`);
      } else {
        let j = 0;
        for (const key in node) {
          console.log("Node", key);
          console.log("Depth:", level);
          console.log("Label:", `${label.map(numberToUpper).join("")}\n`);
          printTree(node[key], level + 1, [...label, j]);
          label[level]++;
        }
      }
    }
  }
  printTree(parsedTree);
}

parseTrackHierarchy(input);
