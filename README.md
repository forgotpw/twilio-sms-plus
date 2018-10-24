# Twilio SMS Plus

A library to send SMS messages with Twilio *plus* some added functionality such as:

* Converting phone number to E164 format
* Logging all SMS messages to an AWS S3 bucket

## Installation

```shell
npm install --save twilio-ssm-plus
```

## Usage

Example usage:

```javascript
const TwilioSmsPlus = require('twilio-sms-plus')
const toPhoneNumber = '6095551212'
const params = {
  textMessage: 'hello world!',
  toPhoneNumber: toPhoneNumber,
  fromPhoneNumber: '2125551212',
  logS3bucket: 'twilio-logs-dev',
  logS3keyPrefix: `users/${toPhoneNumber}/transcript`
}

const twilioPlus = new TwilioSmsPlus({
  twilioAccountSide: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN
})
const result = await twilioPlus.sendTextMessage(params)
```

## Testing

The tests require the following SSM parameters to exist in the AWS account:

```
/fpw/TWILIO_ACCOUNT_SID
/fpw/TWILIO_AUTH_TOKEN
/fpw/TWILIO_FROM_NUMBER
/fpw/TWILIO_TEST_TO_NUMBER
```

Execute the test as follows:

```shell
# pip install iam-starter ssm-starter
export TWILIO_TRANSCRIPT_LOG_S3BUCKET='forgotpw-userdata-dev'
export AWS_REGION=us-east-1
unset AWS_ENV
iam-starter \
  --role my-iam-role-with-access \
  --profile profile-with-access-to-assume-role \
  --command ssm-starter \
  --ssm-name /fpw/ \
  --command mocha
```

## License

MIT
