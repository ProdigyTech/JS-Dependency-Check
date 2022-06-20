## About 

#### This utility is an Dev Dependency add-on to your javascript project. Running this tool will output a html report with all the projects' dependencies and whether they are up to date or out of date. 
<br/>

#### This checks the project dependencies against the npm registry. 
<br />

#### Add this package to your project with 

`yarn add  @prodigytech/js-dependency-check -D`
<br />
`npm install  @prodigytech/js-dependency-check  --save-dev`

### Setting up the dependency checker's config file. You add these config options to your projects' package.json

<br />

#### To run this utility 
- make sure you've added it as a dependency to your project
- run `npx @prodigytech/js-dependency-check`
- The report will be saved to the root directory of the project - dependency-status-report

#### Note: the default report type is HTML, however if you would like a JSON report, pass --report-type=json as a argument to the npx command
`npx @prodigytech/js-dependency-check --report-type=json`


### Todo
- accept custom registry endpoint 
- Better package whitelist system
- Tests 