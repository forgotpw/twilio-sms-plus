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
        fromPhoneNumber: process.env.TWILIO_FROM_NUMBER || '609-438-8881',
        logS3bucket: null,
        logS3keyPrefix: null
      })
      expect(result.success).to.equal(true)
      expect(result.twilioMessageSid).to.be.a('string')
      expect(result.twilioMessageSid).to.have.length.within(1, 100) 
    });
  });

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
