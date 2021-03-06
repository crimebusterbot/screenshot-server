# Screenshot service

A service that creates screenshots and uploads them to Backblaze.

## .env
Create a .env file that looks like:

```
BB_ACCOUNT_ID=ACCOUNT-ID
BB_APPLICATION_KEY=APP-KEY
BB_UPLOAD_URL=UPLOAD-URL
SH_SERVER_ENDPOINT=URL
```

## Setting up browserless image

Puppeteer can use an external instance of Chrome to start making screenshots. In this project we use a Browserless.io Docker image to enable this. Start the following image https://hub.docker.com/r/browserless/chrome with the following params:

docker run \
  -d \
  -p 80:3000 \
  --shm-size 4gb \
  --name browserless \
  --restart always \
  -e "DEBUG=browserless/chrome" \
  -e "PREBOOT_CHROME=true" \
  -e "TOKEN=yourtoken" \
  -e "MAX_CONCURRENT_SESSIONS=5" \
  -e "MAX_QUEUE_LENGTH=10"
  browserless/chrome:latest

## Starting service

To start the serve use `node server.js`
The current port the service will respond on is 3456.

## Creating a screenshot

Do a GET request to localhost:3456, make sure that the 'u' param is filled.
An example of this: localhost:3456/?u=http://example.com.
You will get something like this back:

```
{
    "success": true,
    "headerInformation": {},
    "statusCode": 200,
    "imageName": "speelgoed-telefoon-6f40.png",
    "imageLocation": "https://backblaze-url/speelgoed-telefoon-6f40.png"
}
```

If you want to be sure that your URL does not break you can encode it. The python way to do this is apparently [docs](https://docs.python.org/3/library/urllib.parse.html#urllib.parse.quote)

Encoded the URL above looks like: http%3A%2F%2Fwww.speelgoed-telefoon.nl
