![Netlify Examples](./docs/netlify-examples.png)

# Send emails with Astro using Resend

An example on using [Resend](https://resend.com/) to send emails within an Astro project.

## Deploy to Netlify

This project follows best practices and only uses Resend in production. Locally, it uses Ethereal to catch and preview emails.

The best way to see this in action with your Resend account is to deploy it to Netlify.

After creating a Resend account, you can deploy this project to Netlify and connect it to your Resend account by doing the following:

1. [Create an API key](https://resend.com/docs/dashboard/api-keys/introduction)
1. [Verify your domain](https://resend.com/docs/dashboard/domains/introduction)
1. [Follow this link to deploy the project to Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/netlify/email-astro-resend-example/)

## Work locally

To use this project locally, first clone the repository:

    git clone git@github.com:netlify/email-astro-resend-example.git
    cd email-astro-resend-example

Install the dependencies:

    yarn

Create a `.env` file in the root of the project and add your Resend environment variables:

```bash
RESEND_API_KEY="..."
SEND_EMAIL_FROM="..."
```

Install the Netlify CLI:

    npm install -g netlify-cli

Start the development server:

    ntl dev --command "yarn dev" --target-port 4321

This will open a browser window at `http://localhost:8888` with the example site.
