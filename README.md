# Rubik's Cube API

This project implements a Rubik's Cube API that allows you to perform rotations and interact with the cube's state using an SQLite database. The API is built using Node.js and Express, and the cube state is stored in an SQLite database.

## Prerequisites

- Node.js: Install [Node.js](https://nodejs.org/) if you haven't already.

## Installation

1. Clone this repository:

   ```sh
   git clone https://github.com/your-username/your-rubiks-cube-project.git
   ```

## Dependencies

Navigate to the project directory:

cd cube

Install project dependencies:

npm install
npm install express sqlite3
npm install jest --save-dev

Start the API server:
node src/app.js

## API Endpoints

- **Get Cube State:**

  - URL: `http://localhost:3000/state`
  - Method: GET
  - Response: The current cube state as JSON.

- **Perform Rotation:**
  - URL: `http://localhost:3000/rotate/:face/:direction`
  - Method: PUT
  - URL Params:
    - `:face`: The face of the cube to rotate (e.g., `front`, `top`).
    - `:direction`: The direction of rotation (`clockwise` or `counterClockwise`).
  - Response: A message indicating the successful rotation.
 
  - All faces: front, back, left, right, top, bottom, horizontal (middle), verticalfront (middle), verticalside (middle)
  - All directions: clockwise, counterClockwise, double (clockwise)

## App Configuration

`app.js` file is the entry point of the application. It sets up the Express server, initializes the Rubik's Cube object, and defines the API endpoints. Here are some key details you might want to know:

- The server listens on the port specified in the `PORT` constant from the `config.js` file.

- The `GET /state` endpoint retrieves the current cube state from the Rubik's Cube object and responds with the JSON representation of the state.

- The `PUT /rotate/:face/:direction` endpoint allows you to perform rotations on the cube by specifying the face and direction in the URL parameters. It then updates the cube's state accordingly.

## Usage

Install the project dependencies as mentioned in the Installation section.

Start the API server by running the following command:

node src/app.js

Interact with the API endpoints to retrieve the cube's state and perform rotations.

## Testing with Postman

Get state:
URL: http://localhost:3000/state

Perform Rotation example:
URL: http://localhost:3000/rotate/front/clockwise

## Testing

To ensure the functionality of the API and the Rubik's Cube logic, unit tests are provided using Jest. You can run the tests using the following command:

npm test
