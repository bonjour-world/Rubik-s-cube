const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const { PORT } = require("./config");

app.use(bodyParser.json());

const RubiksCube = require("./cube");
const rubiksCube = new RubiksCube();

// Start the Rubik's Cube server and listen on the specified port
rubiksCube.start().then(() => {
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
});

app.get("/state", async (req, res) => {
  try {
    // Get the current state of the Rubik's Cube
    const cubeState = await rubiksCube.getCubeState();

    // Respond with the cube state as JSON
    res.json(cubeState);
  } catch (error) {
    // If an error occurs, send an error response
    res.status(500).json({ error: "Failed to get the cube's state." });
  }
});

app.put("/rotate/:face/:direction", async (req, res) => {
  const { face, direction } = req.params;
  try {
    await rubiksCube.rotateFace(face, direction);
    res.json({ message: `Rotated ${face} face by 90 degrees ${direction}.` });
  } catch (error) {
    res.status(500).json({ error: "Failed to rotate the face." });
  }
});
