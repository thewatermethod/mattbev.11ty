---
title: Setting AWS environmental variables in Netlify
date: 2021-03-18
tags: [dev, aws, serverless, netlify]
type: post
---

Recently I had occasion to access the AWS API within a serverless function that I was deploying within a Next site on Netlify

[Amazon's documentation on the subject](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials.html) indicated that you could authenticate via setting your environmental variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) which made sense to me because of the really cool interaction between the netlify dev command line tool and the Netlify console.

![AWS_ACCESS_KEY_ID is a reserved environment variable](/assets/aws_access_key_id-reserved-environmental-variable.png)

However AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are reserved by Netlify. There are other ways to authenticate, but if you want to use environmental variables, here is one way. You can set your id and key to whatever you like in the Netlify console and pass them to the client in the configuration object. I had to poke around in the Typescript definitions to get the exact syntax, so here it is.

```js
const client = new LightsailClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.YOUR_ACCESS_KEY_ID,
    secretAccessKey: process.env.YOUR_SECRET_ACCESS_KEY,
  },
});
```

Obviously, you can sub out Lightsail client for S3 or whatever AWS service you need.

Also big props to Amazon for putting that API in Typescript, made my day considerably easier.
