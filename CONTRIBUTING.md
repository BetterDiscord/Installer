# Contributing to BetterDiscord's Installer

Thanks for taking the time to contribute!

The following is a set of guidelines for contributing to BetterDiscord's Installer. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request. These guidelines have been adapted from [Atom](https://github.com/atom/atom/blob/master/CONTRIBUTING.md).

#### Table Of Contents

[Code of Conduct](#code-of-conduct)

[What should I know before I get started?](#what-should-i-know-before-i-get-started)

[How Can I Contribute?](#how-can-i-contribute)
  * [Reporting Bugs](#reporting-bugs)
  * [Suggesting Enhancements](#suggesting-enhancements)
  * [Your First Code Contribution](#your-first-code-contribution)
  * [Pull Requests](#pull-requests)

[Styleguides](#styleguides)
  * [Git Commit Messages](#git-commit-messages)
  * [JavaScript Styleguide](#javascript-styleguide)

[Additional Notes](#additional-notes)
  * [Issue Labels](#issue-labels)

## Code of Conduct

This project and everyone participating in it is governed by the [Code of Conduct from the Contributor Covenant](https://www.contributor-covenant.org/version/1/4/code-of-conduct.html). By participating, you are expected to uphold this code. Please report unacceptable behavior.

## What should I know before I get started?

<!-- TODO: -->

## How Can I Contribute?

### Reporting Bugs

<!-- TODO: -->

#### Before Submitting A Bug Report

<!-- TODO: -->

#### How Do I Submit A (Good) Bug Report?

<!-- TODO: -->

### Suggesting Enhancements

<!-- TODO: -->

#### Before Submitting An Enhancement Suggestion

<!-- TODO: -->

#### How Do I Submit A (Good) Enhancement Suggestion?

<!-- TODO: -->

### Your First Code Contribution

Unsure where to begin contributing? You can start by looking through `help-wanted` issues or any issues labelled `can't reproduce`.

### Pull Requests

Please follow these steps to have your contribution considered by the maintainers:

1. Use a pull request template, if one exists.
2. Follow the [styleguides](#styleguides)
3. After you submit your pull request, verify that all [status checks](https://help.github.com/articles/about-status-checks/) are passing <details><summary>What if the status checks are failing?</summary>If a status check is failing, and you believe that the failure is unrelated to your change, please leave a comment on the pull request explaining why you believe the failure is unrelated. A maintainer will re-run the status check for you. If we conclude that the failure was a false positive, then we will open an issue to track that problem with our status check suite.</details>

While the prerequisites above must be satisfied prior to having your pull request reviewed, the reviewer(s) may ask you to complete additional design work, tests, or other changes before your pull request can be ultimately accepted.

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line
* When only changing documentation, include `[ci skip]` in the commit title

### JavaScript Styleguide

All JavaScript must adhere to the [ESLint rules](https://github.com/BetterDiscord/Installer/blob/main/.eslintrc) of the repo.

Some other style related points not covered by ESLint:

* Use verbose variable names
* Inline `export`s with expressions whenever possible
  ```js
  // Use this:
  export default class ClassName {
  
  }

  // Instead of:
  class ClassName {

  }
  export default ClassName
  ```
* Place class properties in the following order:
    * Class methods and properties (methods starting with `static`)
    * Instance methods and properties
* Place requires in the following order:
    * Built in Node Modules (such as `path`)
    * Repo level global imports (such as `modules`, `builtins`)
    * Local Modules (using relative paths)
* Prefer to import whole modules instead of singular functions
    * Keep modules namespaced and organized
    * This includes Node Modules (such as `fs`)
```js
const fs = require("fs"); // Use this
const {readFile, writeFile} = require("fs"); // Avoid this

import Utilities from "./utilities"; // Use this
import {deepclone, isEmpty} from "./utilties"; // Avoid this
```

## Additional Notes

### Issue Labels

<!-- TODO: -->

#### Type of Issue and Issue State

<!-- TODO: -->
