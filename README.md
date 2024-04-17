# CS 554 Rhythm Game

To run locally, run `npm i` in both `./api` and `./web` folders, then run `npm run dev` from the root directory.

## Clerk Setup

Go to [Clerk](https://clerk.com) and create an account (I signed in with GitHub). Follow the instructions to create a new project. Get the publishable key, make a copy of the file .env.sample in the web directory and name it .env.local. Put the key after VITE_CLERK_PUBLISHABLE_KEY=.
