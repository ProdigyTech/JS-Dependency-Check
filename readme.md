## Project Dependency Checker

The Project Dependency Checker is a powerful utility tool that serves as a Dev Dependency add-on for your JavaScript projects. Its primary function is to provide you with a comprehensive and insightful report on your project's dependencies, giving you a clear indication of their update status. By comparing your project dependencies against the npm registry, this tool ensures that you are aware of any outdated dependencies that may impact your project's stability and security.

### Installation

To integrate this package into your project, simply execute one of the following commands:

```bash
yarn add @prodigytech/js-dependency-check -D
```

or

```bash
npm install @prodigytech/js-dependency-check --save-dev
```

### Setup

Setting up the utility is a breeze, and you have multiple options to choose from:

1. **package.json Configuration:** You can conveniently configure the utility by adding a `dependencyCheckConfig` object to your project's `package.json` file. This configuration allows you to customize the report type, specify the fail-on criteria, and even define specific packages to ignore.

```json
"dependencyCheckConfig": {
    "reportType": "CI|HTML|JSON",
    "failOn": "MAJOR|MINOR|NONE",
    "ignorePackages": [
        "@babel/preset-env",
        "..."
    ]
}
```

2. **Standalone JSON Configuration:** Alternatively, you can create a separate JSON configuration file named `dependencyCheckConfig.json`. This file provides a clean and dedicated space to configure the utility with the desired report type, fail-on criteria, and any packages you wish to exclude.

```json
{
    "reportType": "CI|HTML|JSON",
    "failOn": "MAJOR|MINOR|NONE",
    "ignorePackages": [
        "@babel/preset-env",
        "..."
    ]
}
```

3. **Command-Line Arguments:** For those who prefer flexibility and quick setup, the utility also supports configuration through convenient command-line arguments. Simply pass the desired options when running the utility command.

```bash
npx @prodigytech/js-dependency-check --reportType="CI|HTML|JSON" --failOn=MAJOR|MINOR|NONE
```

### Usage

Using the Project Dependency Checker is straightforward and user-friendly:

1. Ensure that you have successfully added the utility as a dependency in your project.
2. Configure the utility according to your preferences, utilizing any of the available configuration methods: `package.json`, standalone JSON file, or command-line arguments.
3. Execute the following command to run the utility:

```bash
npx @prodigytech/js-dependency-check
```

The generated report will be saved to the root directory of your project for JSON and HTML report types. If you choose the `CI` report type, it will be directly displayed on your screen. Additionally, if you have configured the fail-on option with packages that meet the specified criteria, the process will gracefully exit with a non-zero exit code.
