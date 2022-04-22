# Note: This project is still under active alpha development at this time. 

## About 

### This utility is an Dev Dependency add-on to your javascript project. Running this tool will output a html report with all the projects' dependencies and whether they are up to date or out of date. 

## This checks the project dependencies against the npm registry. 

### Add this package to your project with 

`yarn add  @prodigytech/js-dependency-check -D`
<br />
`npm install  @prodigytech/js-dependency-check  --save-dev`

### One of your packages isn't hosted in the npm registry? no problem, add an environment variable called `DEP_CHECK_WHITELIST` and enter the dependencies separated by comma (,). This will skip the registry lookup for that file. 


### To run this utility 
- make sure you've added it as a dependency to your project
- run `npx @prodigytech/js-dependency-check`


### Todo
- Better Error Handling around NPM Registry lookup
- Better package whitelist system
- Add more detail to the report about outdated dependencies (MAJOR/MINOR/PATCH updates)
- CI pipeline for better deploys 
- GH Tags for releases  
- Release v1.0.0
- Tests 
