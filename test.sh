#!/bin/bash
awsprofile="${1}dev"
echo "Exporting environment variables using AWS profile $1..."
export TWILIO_ACCOUNT_SID=$( \
  aws ssm get-parameter \
    --name /$1/TWILIO_ACCOUNT_SID \
    --with-decryption \
    --query Parameter.Value \
    --output text \
    --profile $awsprofile)
echo "TWILIO_ACCOUNT_SID: $TWILIO_ACCOUNT_SID"

export TWILIO_AUTH_TOKEN=$( \
  aws ssm get-parameter \
    --name /$1/TWILIO_AUTH_TOKEN \
    --with-decryption \
    --query Parameter.Value \
    --output text \
    --profile $awsprofile)
echo "TWILIO_AUTH_TOKEN: $TWILIO_AUTH_TOKEN"

export TWILIO_FROM_NUMBER=$( \
  aws ssm get-parameter \
    --name /$1/TWILIO_FROM_NUMBER \
    --query Parameter.Value \
    --output text \
    --profile $awsprofile)
echo "TWILIO_FROM_NUMBER: $TWILIO_FROM_NUMBER"

export TWILIO_TEST_TO_NUMBER=$( \
  aws ssm get-parameter \
    --name /$1/TWILIO_TEST_TO_NUMBER \
    --query Parameter.Value \
    --output text \
    --profile $awsprofile)
echo "TWILIO_TEST_TO_NUMBER: $TWILIO_TEST_TO_NUMBER"

export TWILIO_TRANSCRIPT_LOG_S3BUCKET='forgotpw-userdata-dev'

echo "Running mocha"
mocha
