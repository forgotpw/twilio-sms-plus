const AWS = require('aws-sdk')
const logger = require('./logger')
const path = require('path');

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

    let s3key = null
    if (params.logS3bucket && params.logS3keyPrefix) {
      try {
        s3key = await logToS3(params)
      }
      catch (err) {
        logger.error(`Error updating s3://${params.logS3bucket}/${s3key}:`, err)
      }
    } else {
      logger.debug('Skipping transcript logging to S3.')
    }

    return { success: true, twilioMessageSid: message.sid, logS3Key: s3key }
  }

  /*
  async getCountryCode(phoneNumber) {
    const {promisify} = require("es6-promisify");

    const LookupsClient = require('twilio').LookupsClient(this.twilioAccountSid, this.twilioAuthToken);
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

async function logToS3(params) {
  const epoch = (new Date).getTime();
  const s3key = path.join(params.logS3keyPrefix, `${epoch}.json`)

  const message = {
    textMessage: params.textMessage,
    fromPhoneNumber: params.fromPhoneNumber
  }

  logger.debug(`Writing text transcript to ${s3key}`)

  const s3 = new AWS.S3();
  let resp = await s3.putObject({
    Bucket: params.logS3bucket,
    Key: s3key,
    ServerSideEncryption: 'AES256',
    Body: JSON.stringify(message),
    ContentType: 'application/json'
  }).promise()
  logger.trace(`S3 PutObject response for s3://${params.logS3bucket}/${s3key}:`, resp)

  return s3key
}

module.exports = TwilioSmsPlus
