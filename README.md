# Relational Algebra v3.0

## Demo
[http://kevinkdo.com/ra3/index.html](http://kevinkdo.com/ra3/index.html)

## Acknowledgements
An early version of this project was written by Jordan Ly, Jennie Ju, Michael Han, and Kevin Do as the final project for Professor Jun Yang's databases course at Duke University.

## What is it?
- Relational algebra parser and compiler written in Javascript
- Browser-based terminal emulator
- Graphical relational algebra syntax tree editor

## Build
I've been using a home-grown Bash file as the build system.
`cd` to `src/frontend` and run `./m` to build the parsers and transform the JSX (requiries `peg.js` and `react-tools`).

## Deploy
I've been using a primitive manual procedure to deploy:

1. Minify all JS files.
2. `cat` all the minified JS files listed in `index.html`.
3. Edit `index.html` to include the new JS file.
4. Test.
5. Upload to S3.
