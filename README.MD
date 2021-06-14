# Job-O-Tron

A [Google Apps Script](https://developers.google.com/apps-script/overview)
[script](https://developers.google.com/apps-script/guides/libraries) to take a google form submission, and post a slightly modified version into a named slack channel.

Used to post job adverts into a #jobs channel, but also persist the data to spreadsheet, where it can be dropped into a regular newsletter.

# Usage

When you post a job using a linked climate Action.tech job form, your submission be shared into a #jobs channel, and also stored in a google spreadsheet, to be included in the next weekly ClimateAction.tech newsletter.

In both cases, there is a link back to the original slack message to allow for comments and questions.



## Local development

_Note: working with appscript is NOT the same as working on a normal node apps, or a web app. The runtime might be v8 like you have in node or a chrome, but the APIs available are different, as is the process for importing/requiring code._

This script is [bound](https://developers.google.com/apps-script/guides/bound)
to a corresponding Google Sheet container.

You can access it from Tools > Script Editor
within the sheet to see the code and make changes there - but please don't.

This repo exists to keep the code in source control, and as much as you can you should use clasp to manage the lifecycle. You can use clasp to manage deployments,to pull down a versions, make changes, run tests, commit to source control, and deploy new versions into a live environment.

### Workflow


1. Clone this repo.
2. Install dependencies for testing and the like with `npm install`
3. Check that tests run ok.
4. Fetch necessary id from google script
5. Pull latest version from live, with `clasp pull LONG_SCRIPT_ID`
6. Make changes, in a new branch, and tag a moderator.
7. Check that tests work locally.
8. Push changes to github
9. Changes will be merged.


## Debugging

You can check the live [Apps Script dashboard](https://script.google.com/home/all) for invocations of the functions, and visit the logs.

## Publishing a new version

Merging into main should trigger a new deploy of the code to the Appscript environment.

### Manually deploying

You should also be able to push changes with a manual deployment too.

You will need a clasp.json file containing information telling clasp what to deploy though. Add this to your project root.

```
# clasp.json
{
  "scriptId": "LONG_SCRIPT_ID",
  "rootDir": "dest/"
}
```

Once you have this you can then trigger a deploy with the following commands.

#### Build a distributable version of the file

Appscript doesn't support `require` like nodejs, or even `import` like some modern browsers.

You need to either have all the files you intend to use in a directory  (appscript loads them all into the same context, so all functions and variables are in a 'global' scope)

Or you need a single concatenated file.

#### Deploying the distributable version of the script

This project currently uses gulp to move the relevant files into a `dest` directory, before pushing them into the google apps environment. Any third party libraries need to expose objects or functions into the global scope for them to visible to Appscript. This makes importing libraries somewhat complex. See [console.dev](https://github.com/consoledotdev/lib-mailchimphtml) mailchimp library as an example of using a third party library, URL.js in a project.


```shell
# make a build of all the files you want to
# push to the appscript environment
npx gulp build

### push the contents of the dest dir to appscript -
npx clasp push
```


## Credits and contributions

This is very much inspired by the [console.dev](https://blog.console.dev/using-apps-script-to-streamline-our-editorial-process/) approach for running a newsletter, and relying on Appscript to automate tedious tasks.



