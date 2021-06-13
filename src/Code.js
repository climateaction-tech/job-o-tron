
/**
 * Check if we are in a Google AppScript Environment
 * by feature detecing for `UrlFetchApp`, an
 */
function isGoogleAppscript() {
  return (typeof UrlFetchApp !== 'undefined')
}
const runningInAppscript = isGoogleAppscript()

/**
 * Fetch the bearer token either from a local environment or
 * from Google's PropertiesService, designed to store litle bits
 * of config, so we don't leave it in source control
 * @returns the bearer token for using when sending requests to slack
 */
function getBearerToken() {
  if (runningInAppscript) {
    const scriptProperties = PropertiesService.getScriptProperties();
    const settings = scriptProperties.getProperties() || {};
    return settings['BEARER_TOKEN']
  }
  // fallback to node
  return process.env.BEARER_TOKEN

}
/**
 * Fetch the public slack channel to post any messages to
 * @returns the public slack channel name, including the '#' signal,
 * like #my-preferred-channel
 */
function getSlackChannel() {
  if (runningInAppscript) {
    const scriptProperties = PropertiesService.getScriptProperties();
    const settings = scriptProperties.getProperties() || {};
    return settings['SLACK_CHANNEL']
  }
  // fallback to assuming we are in nodejs for testing
  return process.env.BEARER_TOKEN
}


/**
 * Create a message suitable for sending to slack to post a message
 * to a public channel
 * @param {JobRecord} jobRecord
 * @returns {object} An object containing a payload suitable for
 * use with google's UrlFetchApp HTTP client
 */
function createSlackMessageHTTPRequest(jobRecord) {
  const data = {
    channel: getSlackChannel(),
    text: formatJobForSlack(jobRecord),
  }
  const headers = {
    "Authorization": `Bearer ${getBearerToken()}`
  }
  var options = {
    'method': 'post',
    'contentType': 'application/json',
    // Convert the JavaScript object to a JSON string.
    'payload': JSON.stringify(data),
    "headers": headers,
    // we need this to make sure that slack renders new lines in the channel
    "escaping": false
  };
  return options
}

/**
 * Send a slack message to slack's API, using Google's UrlFetchApp
 * HTTP service
 * @param {eventObject} submissionObject an eventObject of the form
 * https://developers.google.com/apps-script/guides/triggers/events#form-submit
 *
 */
function sendViaGoogleFetch(submissionObject) {
  const job = JobRecord.init(submissionObject.namedValues)
  const range = submissionObject.range
  const endpoint = "https://slack.com/api/chat.postMessage"

  const response = UrlFetchApp.fetch(
    endpoint,
    createSlackMessageHTTPRequest(job)
  );
  console.log(response.getContentText());
  Logger.log(response.getContentText());

  // TODO: log the link for the message, using the
  // addLinkToMessage function. Do to this we need to
  // find a way go from the submissionObject

  // to the range containing it in the sheet
  addLinkToMessage(range, response)
}

function LogSubmission(submissionObject) {
  Logger.log(submissionObject.namedValues)
}

/**
 * Accept a JobRecord, and return a string containing the relevant details to add
 * to a message for slack
 * @param {JobRecord} jobRecord
 * @returns a templated string containing the slack message to render in slack
 */
function formatJobForSlack(jobRecord) {
  return `
  *Company*: ${jobRecord.company}
  *Role*: ${jobRecord.role}
  *Contract type*: ${jobRecord.contractType}
  *Location*: ${jobRecord.location}
  *Remote/Onsite*: ${jobRecord.inOfficeExpectations}
  *Salary Range*: ${jobRecord.salaryRange}
  *Link*: ${jobRecord.link}
  *Description*: ${jobRecord.description}
  *For questions, ask*: ${jobRecord.contact}
`
}



// a Record object to represent a submitted job
const JobRecord = {

  // factory style methods
  /**
   * create an instance of a Job Record
   * convert from the array to the value contained inside each one.
   * If we need to convert or substitute values, we do so here
   *
   * @param {eventObject} submission a google spreadsheet form submission object, outlined at
   * https://developers.google.com/apps-script/guides/triggers/events#form-submit
   * @param {object} options a configuration object
   * @returns {JobRecord} a jobRecord ready for rendering
   */
  init: function (submission, options) {

    this.link = submission['Link to Job Description'][0]
    this.inOfficeExpectations = submission['In-office expectations'][0]
    this.location = submission["Location"][0]
    this.description = submission['Short description'][0]
    this.company = submission['Company'][0]
    this.role = submission['Role'][0]
    this.salaryRange = submission['Salary Range'][0]
    this.contact = submission['Contact'][0]
    this.contractType = submission['Contract Type'][0]
    return this
  },
  /**
   * 
   * @param {[Object]} rangeValues  - two dimensional array of values, as outlined in
   * https://developers.google.com/apps-script/reference/spreadsheet/range#getvalues
   *
   * @param {Object} options configuration object
   * @returns {JobRecord} a JobRecord
   */
  fromSheetRange(rangeValues, options) {
    [timestamp,
      this.company,
      this.role,
      this.contractType,
      this.location,
      this.description,
      this.salaryRange,
      this.link,
      this.contact,
      this.inOfficeExpectations
    ] = rangeValues[0]
    return this
  },
  /**
   * TODO
   *
   * Format this job for posting into a slack channel
   * ideally this would replace formatJobForSlack, so we have
   * fewer objects, with a smaller API that deals with the
   * idiosyncracies of the AppScript environment and
   * Google spreadsheets
   * TODO
   */
  asSlackMessage() {

  },
  /**
   * TODO
   *
   * Format the job as we would present it in our newsletter
   * Ideally we use a simialr approach as outlined in console,
   * to avoid fighting with the mailchimp rich text editor
   * https://blog.console.dev/using-apps-script-to-streamline-our-editorial-process/
   *
   *
   */
  asNewsletterItem() {

  }
}


function logRow() {

  // get the active spreadsheet
  const sheet = SpreadsheetApp.getActiveSheet()

  // get the active selection
  const selection = sheet.getSelection();

  // log it
  Logger.log("Logging selection in spreadsheet")
  Logger.log(JSON.stringify(selection.getActiveRange()))
  Logger.log(selection.getActiveRange().getValues())
  Logger.log(selection.getActiveRange().getA1Notation())

  // fetch the coords in a form you can sensibly manipulate
  Logger.log("Logging last column in spreadsheet")
  const lastColumn = selection.getActiveRange().getLastColumn()
  const lastRow = selection.getActiveRange().getLastRow()

  // log the coords
  Logger.log("Logging last coords in spreadsheet, numerically")
  Logger.log({ lastColumn })
  Logger.log({ lastRow })

  // make a selection based on these new coords
  // const activeRange = sheet.getRange(
  //   lastRow,
  //   lastColumn + 1
  // );

  // and then update the spreadsheet
  // const newActiveRange = sheet.setActiveRange(activeRange)
  // newActiveRange.setValue("My scripted value here.")
}

/**
 *
 */
function sendToChannelViaGoogleFetch() {
  // get the active spreadsheet
  const sheet = SpreadsheetApp.getActiveSheet()

  // get the active selection
  const selection = sheet.getSelection();

  // and our now range, so we can pass it to other functions
  // and access the values within
  const range = selection.getActiveRange()
  const rangeValues = range.getValues();

  // convert selection to jobRecord
  const job = JobRecord.fromSheetRange(rangeValues)

  // send record to slack
  const endpoint = "https://slack.com/api/chat.postMessage"
  const response = UrlFetchApp.fetch(
    endpoint,
    createSlackMessageHTTPRequest(job)
  );

  Logger.log(response.getContentText());
  // Add reply link to spreadsheet, so we can refer to it later
  addLinkToMessage(range, response)
}

/**
 * A accept an HTTP response from slack API, make a link
 * to the slack message in the response, and then add it
 * to next row in the selected row in google sheets
 * @param {Selection} selection a Selection of the spreadsheet
 * that we can access A1 notation and values from
 * https://developers.google.com/apps-script/reference/spreadsheet/selection
 * @param {HTTPResponse} response an HTTP response from
 * UrlFetchApp.fetch'ing a url.
 * https://developers.google.com/apps-script/reference/url-fetch/http-response
 */
function addLinkToMessage(range, response) {

  const responseData = JSON.parse(response.getContentText())

  const sheet = range.getSheet()
  const lastColumn = range.getLastColumn()
  const lastRow = range.getLastRow()

  // make a selection based on these new coords
  const activeRange = sheet.getRange(
    lastRow,
    lastColumn + 1
  );

  // and then update the spreadsheet
  const newActiveRange = sheet.setActiveRange(activeRange)

  // ts is the timestamp of the message - these, combined with the channel id give us sharable links to messages
  const formatted_ts = `p${responseData.ts.replace('.', '')}`
  const messageLink = `https://climate-tech.slack.com/archives/${responseData.channel}/${formatted_ts}`

  newActiveRange.setValue(messageLink)
}

/**
 * Set the proprties for sending requests to the slack API, specifically
 * the channel to post to, and the API token to use
 */
function updateSlackIntegrationSettings() {

  const scriptProperties = PropertiesService.getScriptProperties();
  const settings = scriptProperties.getProperties() || {};

  Logger.log({ settings })

  let tmpl = HtmlService
    .createTemplateFromFile('Modal')

  tmpl.keys = ["BEARER_TOKEN", "SLACK_CHANNEL"];
  tmpl.settings = settings;

  const htmlOutput = tmpl.evaluate();
  SpreadsheetApp.getUi().showModelessDialog(htmlOutput, 'Slack Settings');


}
/**
 * Accept a form object from a templated html form when inside a
 * google spreadsheet
 * for more, see:
 * https://developers.google.com/apps-script/guides/html/communication#forms
 * @param {formObject} formObject a object from an HTML
 * form submission
 * @returns {Object} An object containing the values saved
 */
function processForm(formObject) {

  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty("SLACK_CHANNEL", formObject.SLACK_CHANNEL)
  scriptProperties.setProperty("BEARER_TOKEN", formObject.BEARER_TOKEN)

  return {
    BEARER_TOKEN: formObject.BEARER_TOKEN,
    SLACK_CHANNEL: formObject.SLACK_CHANNEL
  }
}

/**
 * Add the dropdown menu to the google spreadsheet this script runs in
 * For more, see:
 * https://developers.google.com/apps-script/guides/menus
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Slack Job-O-Tron')
    .addItem('Log Row Contents', 'logRow')
    .addItem('Update Settings', 'updateSlackIntegrationSettings')
    .addItem('Send Row to channel', 'sendToChannelViaGoogleFetch')
    .addToUi();
}



if (!runningInAppscript) {
  // this is a small shim. If we want to have tests, we need
  // to be able to call require locally. The Google App Environent
  // doesn't support `module` so we feature-detect to see which
  // environment we're running in.
  module.exports = {
    JobRecord,
    formatJobForSlack,
    createSlackMessageHTTPRequest
  }
}
