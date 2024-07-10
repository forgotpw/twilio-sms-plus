const AWS = require('aws-sdk')
const logger = require('./logger')
const path = require('path');

class TwilioSmsPlus {
  constructor(config) {
    this.twilioAccountSid = config.twilioAccountSid;
    this.twilioClient = require('twilio')(config.twilioAccountSid, config.twilioAuthToken);
  }

  async sendTextMessage(params) {
    logger.info(`Texting ${params.textMessage.length} chars message to ${params.toPhoneNumber} ...`)

    
    const PNF = require('google-libphonenumber').PhoneNumberFormat;
    const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

    let fromNumber = null
    let fromNumberE164 = null
    try {
      fromNumber = phoneUtil.parseAndKeepRawInput(params.fromPhoneNumber, 'US');
      fromNumberE164 = phoneUtil.format(fromNumber, PNF.E164)
    }
    catch (err) {
      logger.error(`Error converting fromPhoneNumber ${params.fromPhoneNumber} to E164 format:`, err)
      return { success: false }
    }
    logger.trace(`Converted source phone number ${params.fromPhoneNumber} to E164 format: ${fromNumberE164}`)

    let toNumber = null
    let toNumberE164 = null
    try {
      toNumber = phoneUtil.parseAndKeepRawInput(params.toPhoneNumber, 'US');
      toNumberE164 = phoneUtil.format(toNumber, PNF.E164)
    }
    catch (err) {
      logger.error(`Error converting toPhoneNumber ${params.toPhoneNumber} to E164 format:`, err)
      return { success: false }
    }
    logger.debug(`Converted target phone number ${params.toPhoneNumber} to E164 format: ${toNumberE164}`)

    let message
    try {
      const messageParams = {
        body: params.textMessage,
        to: toNumberE164,
      };
      
      // Use messaging_service_sid if provided, else use fromNumberE164
      if (params.messagingServiceSid) {
        messageParams.messagingServiceSid = params.messagingServiceSid;
      } else {
        messageParams.from = fromNumberE164;
      }
      
      message = await this.twilioClient.messages.create(messageParams);
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
      s3key = await logToS3(params)
    } else {
      logger.debug('Skipping transcript logging to S3.')
    }

    return { success: true, twilioMessageSid: message.sid, logS3Key: s3key }
  }

  // Check if a phone number is opted out of receiving SMS messages, such
  // as if the user has replied "STOP" to a previous message.
  async isOptedOut(phoneNumber) {
    try {
      const response = await this.twilioClient.messaging
        .services(this.twilioAccountSid)
        .phoneNumbers(phoneNumber)
        .fetch();
      return response ? !response.capabilities['SMS'] : false;
    } catch (error) {
      if (error.code === 20404) {
        // Number not found in the list, meaning not opted out
        return false;
      } else {
        console.error('Error checking opt-out status:', error);
        return true; // Consider unknown status as opted out
      }
    }
  }

}

async function logToS3(params) {
  const epoch = (new Date).getTime();
  const s3key = path.join(params.logS3keyPrefix, `${epoch}.json`)

  const message = {
    textMessage: params.textMessage,
    fromPhoneNumber: params.fromPhoneNumber
  }

  logger.debug(`Writing text transcript to s3://${params.logS3bucket}/${s3key}`)

  try {
    const s3 = new AWS.S3();
    let resp = await s3.putObject({
      Bucket: params.logS3bucket,
      Key: s3key,
      ServerSideEncryption: 'AES256',
      Body: JSON.stringify(message),
      ContentType: 'application/json'
    }).promise()
    logger.trace(`S3 PutObject response for s3://${params.logS3bucket}/${s3key}:`, resp)
  }
  catch (err) {
    logger.error(`Error updating s3://${params.logS3bucket}/${s3key}:`, err)
  }
  return s3key
}

module.exports = TwilioSmsPlus
