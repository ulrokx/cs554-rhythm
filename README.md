# CS 554 Rhythm Game

To run locally, run `npm i` in both `./api` and `./web` folders, then run `npm run dev` from the root directory.

## Docker for Databases

To run the databases in docker, run `docker-compose up -d` (-d detaches it from your terminal) in the root directory. This will start a MongoDB database and a Redis database.

To stop the databases, run `docker-compose down` in the root directory.

## Clerk Setup

Go to [Clerk](https://clerk.com) and create an account (I signed in with GitHub). Follow the instructions to create a new project. Get the publishable key, make a copy of the file .env.sample in the web directory and name it .env.local. Put the key after VITE_CLERK_PUBLISHABLE_KEY=. Then put your secret key and publishable key in a .env file in the /api directory

## Clerk Webhook Setup

To test webhooks locally, follow the instructions [here](https://github.com/svix/svix-cli?tab=readme-ov-file#installation) to install the Svix CLI. I am on WSL2 so I downloaded the `svix_0.21.1_linux_amd64.deb` file from their [releases page](https://github.com/svix/svix-cli/releases), moved it into my WSL2 home directory, and ran `sudo dpkg -i svix_0.21.1_linux_amd64.deb` to install it.

Once it is installed, you can run `svix listen http://localhost:4000/webhook` and it will start listening, giving you a URL that you can put as the endpoint for webhooks in the Clerk dashboard. I only enabled the user events (includes user.create). It will redirect the webhook requests from that URL to your localhost server, so you can test the webhooks locally.
