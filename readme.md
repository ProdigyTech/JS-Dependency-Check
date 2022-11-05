## About 

#### This utility is an Dev Dependency add-on to your javascript project. Running this tool will output a report with all the projects' dependencies and whether they are up to date or out of date. 

#### This checks the project dependencies against the npm registry. 

#### Add this package to your project with 

```
yarn add  @prodigytech/js-dependency-check -D
npm install  @prodigytech/js-dependency-check  --save-dev

```

#### In order to set up this utility, you have the option to either, create a dependencyCheckConfig.json file or add a new object to your package.json or you can pass cli arguments. 

package.json

```
dependencyCheckConfig: {
    "reportType" : "CI" | "HTML" | "JSON"
    "failOn" : "MAJOR" | "MINOR" 
}

```
standalone json config file (dependencyCheckConfig.json) 

```
{
    "reportType" : "CI" | "HTML" | "JSON"
    "failOn" : "MAJOR" | "MINOR" 
}
```

cli arguments 

```
npx @prodigytech/js-dependency-check --reportType="CI|HTML|JSON" --failOn=MAJOR|MINOR`

```
#### To run this utility 
- make sure you've added it as a dependency to your project
- configure the utility with either the cli args, package.json or standalone config file.
- run `npx @prodigytech/js-dependency-check`
- The report will be saved to the root directory of the project for JSON & HTML report types. reportType CI will be printed to the screen. 