export const standardLibrary =
`const stlEqual = (a, b) =>
	a.stlValue.top === b.stlValue.top && a.stlValue.bottom === b.stlValue.bottom;
const stlAdd = (a, b) => ({
	stlValue: {
		top: a.stlValue.top + b.stlValue.top,
		bottom: a.stlValue.bottom,
	},
});
const stlSubtract = (a, b) => ({
	stlValue: {
		top: a.stlValue.top - b.stlValue.top,
		bottom: a.stlValue.bottom,
	},
});
const stlLess = (a, b) => ({
	stlValue: a.stlValue.top * b.stlValue.bottom < b.stlValue.top * a.stlValue.bottom,
});
const stlLessEqual = (a, b) => ({
	stlValue: a.stlValue.top * b.stlValue.bottom <= b.stlValue.top * a.stlValue.bottom,
});
const stlGreater = (a, b) => ({
	stlValue: a.stlValue.top * b.stlValue.bottom > b.stlValue.top * a.stlValue.bottom,
});
const stlGreaterEqual = (a, b) => ({
	stlValue: a.stlValue.top * b.stlValue.bottom >= b.stlValue.top * a.stlValue.bottom,
});
const print = (arg) => {
  const { stlValue } = arg;
  if (typeof arg === "function") {
    console.log("<lambda>");
  } else if (typeof stlValue === "string" || typeof stlValue === "boolean") {
    console.log(stlValue);
  } else if ('top' in stlValue) {
    if (stlValue.bottom === 1n) {
      console.log(stlValue.top.toString());
    } else {
      console.log(\`\${stlValue.top}/\${stlValue.bottom}\`);
    }
  } else {
    console.log(stlValue);
  }
};`;
