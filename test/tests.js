const expect = require('chai').expect
const AWS = require('aws-sdk')
let TwilioSmsPlus = require('../index')

describe('twilioSmsPlus', function() {
  describe('sendTextMessage', function() {
    it('should return true when given valid params', async function() {
      let twilioPlus = new TwilioSmsPlus({
        twilioAccountSide: process.env.TWILIO_ACCOUNT_SID,
        twilioAuthToken: process.env.TWILIO_AUTH_TOKEN
      })
      let result = await twilioPlus.sendTextMessage({
        textMessage: 'unit test text message from mocha',
        toPhoneNumber: process.env.TWILIO_TEST_TO_NUMBER || '609-555-1212',
        fromPhoneNumber: process.env.TWILIO_FROM_NUMBER,
        logS3bucket: null,
        logS3keyPrefix: null
      })
      expect(result.success).to.equal(true)
      expect(result.twilioMessageSid).to.be.a('string')
      expect(result.twilioMessageSid).to.have.length.within(1, 100) 
      expect(result.logS3Key).to.be.null
    });

    it('should return an s3 key when s3 logging params are provided', async function() {
      let twilioPlus = new TwilioSmsPlus({
        twilioAccountSide: process.env.TWILIO_ACCOUNT_SID,
        twilioAuthToken: process.env.TWILIO_AUTH_TOKEN
      })
      const toPhoneNumber = process.env.TWILIO_TEST_TO_NUMBER || '609-555-1212'
      let result = await twilioPlus.sendTextMessage({
        textMessage: 'this test from mocha is logged',
        toPhoneNumber: toPhoneNumber,
        fromPhoneNumber: process.env.TWILIO_FROM_NUMBER,
        logS3bucket: process.env.TWILIO_TRANSCRIPT_LOG_S3BUCKET,
        logS3keyPrefix: `transcript/${toPhoneNumber}`
      })
      expect(result.success).to.equal(true)
      expect(result.twilioMessageSid).to.be.a('string')
      expect(result.twilioMessageSid).to.have.length.within(1, 100) 
      expect(result.logS3Key).to.be.a('string')
      expect(result.logS3Key).to.have.length.within(10, 200) 
    });
  });

  describe('isOptedOut', function() {
    // it('should return true when a number has opted out', async function() {
    //   let twilioPlus = new TwilioSmsPlus({
    //     twilioAccountSide: process.env.TWILIO_ACCOUNT_SID,
    //     twilioAuthToken: process.env.TWILIO_AUTH_TOKEN
    //   })
    //   let result = await twilioPlus.isOptedOut('we need an opted out number to test this')
    //   expect(result).to.equal(true)
    // })

    it('should return false when a number has not opted out', async function() {
      let twilioPlus = new TwilioSmsPlus({
        twilioAccountSide: process.env.TWILIO_ACCOUNT_SID,
        twilioAuthToken: process.env.TWILIO_AUTH_TOKEN
      })
      let result = await twilioPlus.isOptedOut('609-555-1234')
      expect(result).to.equal(false)
    })
  })

  // describe('getCountryCode', function() {
  //   it('should return US for a USA based number', async function() {
  //     let countryCode = await smsUtil.getCountryCode(
  //       '6095551212',
  //       ssmTwilioAccountSid.Parameter.Value,
  //       ssmTwilioAuthToken.Parameter.Value
  //     )
  //     assert.equal(countryCode, 'US');
  //   });
  // });

});
