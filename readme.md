## About 

#### This utility is an Dev Dependency add-on to your javascript project. Running this tool will output a html report with all the projects' dependencies and whether they are up to date or out of date. 
<br/>

#### This checks the project dependencies against the npm registry. 
<br />

#### Add this package to your project with 

`yarn add  @prodigytech/js-dependency-check -D`
<br />
`npm install  @prodigytech/js-dependency-check  --save-dev`

#### Do you have a package that you don't want to be included in the report?  Add an environment variable called `DEP_CHECK_WHITELIST` and enter the dependencies separated by comma (,). This will skip the registry lookup for that dependency. Example: `DEP_CHECK_WHITELIST="axios,react-scripts"`
<br />

#### To run this utility 
- make sure you've added it as a dependency to your project
- run `npx @prodigytech/js-dependency-check`


### Todo
- Better Error Handling around NPM Registry lookup
- Better package whitelist system
- Add more detail to the report about outdated dependencies (MAJOR/MINOR/PATCH updates)
- Automatically add script to package.json for project
- Tests 