# Twilio SMS Plus

A library to send SMS messages with Twilio plus some added functionality such as:

* Converting phone number to E164 format
* Logging all SMS messages to an AWS S3 bucket

## Usage

Example usage:

```javascript
const logS3keyPrefix = 'users/6095551212/transcript'
const params = {
  textMessage: 'hello world!',
  toPhoneNumber: '6095551212',
  fromPhoneNumber: '2125551212',
  logS3bucket: 'twilio-logs',
  logS3keyPrefix: logS3keyPrefix
}

const twilioPlus = new TwilioSmsPlus({
  twilioAccountSide: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN
})
const result = await twilioPlus.sendTextMessage(params)
```
