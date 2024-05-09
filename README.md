# CS 554 Rhythm Game

## Setup
(Sorry there's a lot)
### Docker
1. Download and Install [Docker](https://www.docker.com/)
2. Download the Mongo and Redis docker containers.
   - Mongo Instructions can be found [here](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-community-with-docker/).
   - Redis Instructions can be found [here](https://hub.docker.com/_/redis).
3. Run the container by navigating to the root directory of our project and run:
   ```
   docker compose up -d
   ```
4. To close the containers (when you're done), run:
   ```
   docker compose down
   ```

### NodeJS
1. In the root directory of the project, run:
   ```
   npm run setup
   ```
   followed by:
   ```
   npm run seed
   ```
   This will populate the database with some starting values and install all of the neseccary dependencies.
2. Run the server and the client with (in the root directory as well):
   ```
   npm start
   ```
    You can also go into each directory individually if you want.

### Clerk

Go to [Clerk](https://clerk.com) and create an account (I signed in with GitHub). Follow the instructions to create a new project. Get the publishable key, make a copy of the file .env.sample in the web directory and name it .env.local. Put the key after VITE_CLERK_PUBLISHABLE_KEY=. Then put your secret key and publishable key in a .env file in the /api directory. Keep the Clerk dashboard open, because you'll need it for the last step.

### Clerk Webhook

To test webhooks locally, follow the instructions [here](https://github.com/svix/svix-cli?tab=readme-ov-file#installation) to install the Svix CLI. I am on WSL2 so I downloaded the `svix_0.21.1_linux_amd64.deb` file from their [releases page](https://github.com/svix/svix-cli/releases), moved it into my WSL2 home directory, and ran `sudo dpkg -i svix_0.21.1_linux_amd64.deb` to install it.

Once it is installed, you can run `svix listen http://localhost:4000/webhook` and it will start listening, giving you a URL that you can put as the endpoint for webhooks in the Clerk dashboard (See submission video for a demonstration). I only enabled the user events (includes user.create). It will redirect the webhook requests from that URL to your localhost server, so you can test the webhooks locally. Note: The server must be running for this to work. You can verify the webhook is working by creating an account on the client and seeing `-> Recieved "200 OK" response, forwarding to webhook sender`. This means the server has successfully received the webhook request.
