# AWS ECS Details
Simple node app to return details about ECS containers and tasks

## Dependencies
`npm`

aws local credentials setup - https://docs.aws.amazon.com/sdkref/latest/guide/creds-config-files.html

## Getting started
run `npm install`

run `npm run cli`

### Options
`--profile` - This will use a different profile from your credentials file | default = `default`

`--region`  - Set the region for the ecs resources | default = `us-east-1`

`--service` - Return a specific service from your clusters | default = `undefined`

### Run with Options
`npm run cli --  --profile=production --region=us-west-2 --service=my-cool-service`