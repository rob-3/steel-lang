# Steel

Steel is an experimental compile-to-JavaScript programming language. Currently,
it is a prototype; bugs and missing features are expected.

## Installation

To install Steel, run the following commands.

```bash
git clone https://github.com/rob-3/steel-lang.git
cd steel-lang
npm install
chmod +x ./bin/steel
```

Then, build thr project with:

```bash
npm run build
```

## Getting Started

To start the REPL, use:

```bash
./bin/steel
```

To run a file, use:

```bash
./bin/steel file.steel
```

To compile a file to JavaScript (very experimental), use:

```bash
./bin/steel -c file.steel
```

## License

Copyright Robert Boyd III. Licensed under the Mozilla Public License 2.0.
