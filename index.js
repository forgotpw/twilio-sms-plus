const AWS = require('aws-sdk')
const logger = require('./logger')

class TwilioSmsPlus {
  constructor(config) {
    this.twilioAccountSid = config.twilioAccountSid
    this.twilioAuthToken = config.twilioAuthToken
  }

  async sendTextMessage(params) {
    logger.info(`Texting ${params.textMessage.length} chars message to ${params.toPhoneNumber} ...`)

    const twilio = require('twilio')(this.twilioAccountSid, this.twilioAuthToken);
    const PNF = require('google-libphonenumber').PhoneNumberFormat;
    const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

    const fromNumber = phoneUtil.parseAndKeepRawInput(params.fromPhoneNumber, 'US');
    const fromNumberE164 = phoneUtil.format(fromNumber, PNF.E164)
    logger.trace(`Converted source phone number ${params.fromPhoneNumber} to E164 format: ${fromNumberE164}`)

    const toNumber = phoneUtil.parseAndKeepRawInput(params.toPhoneNumber, 'US');
    const toNumberE164 = phoneUtil.format(toNumber, PNF.E164)
    logger.debug(`Converted target phone number ${params.toPhoneNumber} to E164 format: ${toNumberE164}`)

    let message
    try {
      message = await twilio.messages
      .create({
         body: params.textMessage,
         from: fromNumberE164,
         to: toNumberE164
       })
    }
    catch (err) {
      // https://www.twilio.com/docs/api/errors
      if (err.code == 21211) {
        logger.warn(`Invalid target phone number given (${params.toPhoneNumber}). `, err)
        return { success: false }
      } else {
        logger.error(`Error sending Twilio message to ${toNumberE164}.`, err)
        throw err
      }
    }
    logger.info(`Twilio message sid: ${message.sid}`)

    // // TODO: also log out each message sent to
    // // s3://forgotpw-userdata-${env}/users/${normalizedPhone}/log/timestamp.json
    // await logTextMessage(application, normalizedPhone, textMessage)

    return { success: true, twilioMessageSid: message.sid }
  }

  /*
  async getCountryCode(phoneNumber, twilioAccountSid, twilioAuthToken) {
    const {promisify} = require("es6-promisify");

    const LookupsClient = require('twilio').LookupsClient(twilioAccountSid, twilioAuthToken);
    const client = new LookupsClient(accountSid, authToken);

    try {
      const phoneNumbers = promisify(client.phoneNumbers(phoneNumber).get)
      let countryCode
      let number = await phoneNumbers()
      logger.debug(`Twilio lookup service produced country code ${number.country_code} for ${toPhoneNumber}`);
      return number.country_code
    }
    catch (err) {
      logger.error('Error using Twilio phone number lookup: ' + err)
    }
  }
  */

}

module.exports = TwilioSmsPlus
