To run demo locally:
1- before running make sure to remove package.json from root and from app folder and client folder
2- run 'npm run setup' and follow instructions in the readme.
3- prepare .env file in app folder based on .env.example
4- in app folder run 'npm run start' to start the server
5- in client folder run 'npm start -- --uri ws://localhost:3000/api/v1/audiohook/ws --api-key APP_API_KEY --client-secret APP_SECRET --wavfile cold-call-software-sale.wav
where APP_API_KEY and APP_SECRET are values from your .env file.
6- run demo in public/index.html in your local and start listening to the session id found in logs either from client or server app terminals.
