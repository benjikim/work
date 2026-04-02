# :us: InsureMyTrip.com Frontend Applications


## :information_source: Overview
Repository to contain all frontend applications/modules used on the InsureMyTrip.com website.

## :desktop_computer: Applications

### Purchase
Application to support the purchase/checkout process for website. Follow the [README](/purchase/README.md) file for application specific information.

### Quote Results
Application to display Quote Results to users on website. Follow the [README](/quote-results/README.md) file for application specific information.

### Quote Form
Application to display Quote Form to users on website.
Follow the [README](/quote-form/README.md) file for application specific information.

## :1234: Versioning
When making code changes to any application, update the version of the application according semantic versioning (major, minor, patch) as follows:

```bash
npm version major | minor | patch --git-tag-version false
```

## :rocket: Deployment
All frontend applications get deployed to the same location in AWS S3. Each environment has it's own bucket, and each application has it's own "directory" in each respective bucket. Please refer to the [GitLab continuous integration configuration](gitlab-ci.yml) file in this repository and each individual application for more information.

### Cloudfront Domains
##### QA
`https://d2ygcqi42rilxg.cloudfront.net`
##### Staging
`https://d15341146fxoe9.cloudfront.net`
##### Production
`https://d1doq7xq4s4t2o.cloudfront.net`
#### Module Base URL Structure
`https://[base-url]/[module]/[version]/[entrypoint.html]`


### How to Set Up Debugger on VSCode
** Note: Before running debugger, you will need to force quit any instances of Google Chrome as it is not possible to put a running Chrome user profile into debug mode. ** 
Add the following `.vscode/launch.json` file:

```json
{
  "version": "0.2.0",
  "configurations": [
      {
          "type": "chrome",
          "request": "launch",
          "name": "Launch Chrome with Profile",
          "url": "http://localhost:5173",
          "webRoot": "{workspace directory}/src",
          "userDataDir": false,
      }
  ]
}
```
