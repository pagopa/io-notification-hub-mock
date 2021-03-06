# IO Notification Hub mock

It's a simple Express server that mocks the endpoints of
[Azure Notification Hub](https://docs.microsoft.com/en-us/rest/api/notificationhubs/rest-api-methods)
used by [io-backend](https://github.com/pagopa/io-backend).<br/>
It logs the information of the incoming requests, validates their payload, and send an email instead of a notification.

_Note: the mocked implementation is based on the api-version `2015-01` of Azure Notification Hubs REST API,
hence the behaviour of the endpoints could differ from the expected if they are invoked with another api-version._

## Setup

1. clone this repository
2. install all packages needed:<br/>
   `yarn install`
3. build the app:<br/>
   `yarn build`
4. set the required environment variables described in the related section
5. start the server:<br/>
   `yarn start`

### Environment variables

The table lists the environment variables needed by the application, they must be customized as needed.
For your convenience a `env.example` is provided: you can copy it to an `.env` file and then change the variables with your values,
the app will load them on start.

| Variable name     | Description                                      | type    |
| ----------------- | ------------------------------------------------ | ------- |
| BACKEND_PORT      | Port of Express server                           | number  |
| DB_SOURCE         | The path of the JSON file used to store the data | number  |
| EMAIL_PASSWORD    | The password used to connect to the email server | string  |
| EMAIL_USER        | The user to connect to the email server          | string  |
| EMAIL_SMTP_HOST   | The hostname or IP address of the SMTP server    | string  |
| EMAIL_SMTP_PORT   | The port of the SMTP server                      | int     |
| EMAIL_SMTP_SECURE | If set to true, uses TLS in SMTP connection      | boolean |
| EMAIL_SENDER      | The email address of the sender                  | string  |
| EMAIL_RECIPIENT   | The email address of the recipient               | string  |

## Postman Collection Tests

A file name `test.postman_collection.json` contains a simple set of tests.
To run this collection you can either open it into Postman or run it using [newman](https://support.postman.com/hc/en-us/articles/115003710329-What-is-Newman-)

**NOTE: It's necessary that the application has been started using `yarn start` to run the test.**

To run it using newman, just call:

```
newman run test.postman_collection.json --insecure
```
