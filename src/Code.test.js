const fs = require("fs");
const path = require("path");

const appCode = require('./Code.js')
let sampleFormSubmission = null;


describe('Form2Slack', () => {

  beforeEach(function () {
    sampleFormSubmission = JSON.parse(
      fs.readFileSync(
        path.resolve(__dirname, "sample-form-submission.json"),
        "utf8"
      )
    );
  })

  describe('google form submission', () => {
    it('create jobRecord from form submission', () => {

      // make a JobRecord from it
      const job = appCode.JobRecord.init(sampleFormSubmission)

      // check that we have the correct properties
      expect(job.link).toBe(sampleFormSubmission['Link to Job Description'][0])
      expect(job.description).toBe(sampleFormSubmission['Short description'][0])
      expect(job.company).toBe(sampleFormSubmission["Company"][0])
      expect(job.role).toBe(sampleFormSubmission["Role"][0])
      expect(job.location).toBe(sampleFormSubmission["Location"][0])
      expect(job.salaryRange).toBe(sampleFormSubmission["Salary Range"][0])
      expect(job.contact).toBe(sampleFormSubmission["Contact"][0])
      expect(job.contractType).toBe(sampleFormSubmission["Contract Type"][0])
      expect(job.inOfficeExpectations).toBe(sampleFormSubmission["In-office expectations"][0])

    })
  })
  describe('google sheet row', () => {
    let sampleRange;
    beforeEach(function () {
      sampleRange = JSON.parse(
        fs.readFileSync(
          path.resolve(__dirname, "sample-row.json"),
          "utf8"
        )
      );

    })

    it('create a job Record from a row in google sheets', () => {
      const job = appCode.JobRecord.fromSheetRange(sampleRange)
      expect(appCode.JobRecord.isPrototypeOf(job))
      expect(job.company).toEqual(sampleRange[0][1])
      expect(job.role).toEqual(sampleRange[0][2])
      expect(job.contractType).toEqual(sampleRange[0][3])
      expect(job.location).toEqual(sampleRange[0][4])
      expect(job.description).toEqual(sampleRange[0][5])
      expect(job.salaryRange).toEqual(sampleRange[0][6])
      expect(job.link).toEqual(sampleRange[0][7])
      expect(job.contact).toEqual(sampleRange[0][8])
      expect(job.inOfficeExpectations).toEqual(sampleRange[0][9])
    })
  })
  describe('jobRecord', () => {
    it('render jobRecord for sending to slack', () => {
      const job = appCode.JobRecord.init(sampleFormSubmission)
      const renderedJobAd = appCode.formatJobForSlack(job)

      expect(renderedJobAd).toMatch(job.link)
      expect(renderedJobAd).toMatch(job.description)
      expect(renderedJobAd).toMatch(job.company)
      expect(renderedJobAd).toMatch(job.role)
      expect(renderedJobAd).toMatch(job.location)
      expect(renderedJobAd).toMatch(job.salaryRange)
      expect(renderedJobAd).toMatch(job.contact)
      expect(renderedJobAd).toMatch(job.contractType)
      expect(renderedJobAd).toMatch(job.inOfficeExpectations)

      // console.log(renderedJobAd)
    })
    it('prepare payload to send slack', () => {

      const job = appCode.JobRecord.init(sampleFormSubmission)
      // check that we have the necessary payload to send to
      // Google's Fetch service
      const postRequest = appCode.createSlackMessageHTTPRequest(job)

      // do we have a bearer token?
      expect(postRequest.headers["Authorization"]).toMatch("xox")

      // console.log(postRequest)
      // do we have our rendered template?
      expect(JSON.parse(postRequest.payload).text).toMatch(appCode.formatJobForSlack(job))


    })
  })
})
