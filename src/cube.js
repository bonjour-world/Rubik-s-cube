const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("rubiks_cube.db");

class RubiksCube {
  constructor() {
    this.cubeState = this.initializeCubeState();
  }

  async start() {
    try {
      // Create the "cube" table if it doesn't exist.
      await this.createCubeTable();

      const cubeState = await this.loadCubeState(); // Wait for the cubeState promise to resolve
      this.cubeState = cubeState; // Update the cube state
    } catch (error) {
      console.error("Failed to start the Rubik's Cube server:", error);
      process.exit(1);
    }
  }

  async rotateFace(face, direction) {
    const validDirections = ["clockwise", "counterClockwise"];

    if (!validDirections.includes(direction)) {
      throw new Error("Invalid direction.");
    }

    try {
      const cubeState = await this.getCubeState();

      if (
        !cubeState[face] &&
        face !== "horizontal" &&
        face !== "verticalfront" &&
        face !== "verticalside"
      ) {
        throw new Error("Invalid face.");
      }

      // Perform the rotation based on the direction.
      if (direction === "clockwise") {
        await this.performRotation(cubeState, face, direction);
      } else if (direction === "counterClockwise") {
        // Rotate three times clockwise to achieve counterclockwise rotation.
        for (let i = 0; i < 3; i++) {
          await this.performRotation(cubeState, face, direction);
        }
      }
    } catch (error) {
      throw new Error("Failed to rotate the face.");
    }
  }

  async getCubeState() {
    try {
      const query = "SELECT state FROM cube ORDER BY id DESC LIMIT 1";
      const row = await new Promise((resolve, reject) => {
        db.get(query, (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        });
      });

      if (row && row.state) {
        const cubeState = JSON.parse(row.state);
        console.log("Resolved state from the database:", cubeState);
        this.cubeState = cubeState; // Update the cube state
        return cubeState; // Return the resolved cube state
      } else {
        console.log("No state found in the database.");
        // Initialize the cube state with the default state if it is not yet defined.
        this.cubeState = this.initializeCubeState(); // Update the cube state with the initial state
        return this.cubeState; // Return the initial state
      }
    } catch (error) {
      console.error("Failed to get the cube's state:", error);
      throw new Error("Failed to get the cube's state.");
    }
  }

  async saveCubeState(cubeState) {
    const jsonString = JSON.stringify(cubeState);
    const query = "INSERT OR REPLACE INTO cube (id, state) VALUES (1, ?)";
    return new Promise((resolve, reject) => {
      db.run(query, [jsonString], (err) => {
        if (err) {
          console.error("Failed to save the cube state:", err);
          reject(new Error("Failed to save the cube state."));
        } else {
          console.log("Saved the cube state to the database:", cubeState);
          resolve();
        }
      });
    });
  }

  async performRotation(cubeState, face, direction) {
    // Adjacent stickers based on the rotation direction.
    const adjacentSides = {
      front: ["top", "right", "bottom", "left"],
      right: ["top", "back", "bottom", "front"],
      back: ["top", "left", "bottom", "right"],
      left: ["top", "front", "bottom", "back"],
      top: ["back", "right", "front", "left"],
      bottom: ["front", "right", "back", "left"],
      horizontal: ["back", "right", "front", "left"],
      verticalfront: ["top", "right", "bottom", "left"],
      verticalside: ["top", "front", "bottom", "back"],
    };

    if (
      face !== "horizontal" &&
      face !== "verticalfront" &&
      face !== "verticalside"
    ) {
      // Clone the face stickers to be rotated.
      const cloneFaceStickers = (faceStickers) =>
        faceStickers.map((row) => row.slice());

      // Rotate the face stickers clockwise or counterclockwise.
      if (face in adjacentSides) {
        const faceStickers = cloneFaceStickers(cubeState[face]);
        const newFaceStickers = [];
        for (let c = 0; c < 3; c++) {
          newFaceStickers.push([]);
          for (let r = 2; r >= 0; r--) {
            newFaceStickers[c].push(faceStickers[r][c]);
          }
        }
        faceStickers.splice(0, faceStickers.length, ...newFaceStickers);

        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            cubeState[face][i][j] = faceStickers[i][j];
          }
        }
      }
    }

    const tempStickers = adjacentSides[face].map((side) => {
      switch (face) {
        case "top":
          return cubeState[side][0].slice();
        case "bottom":
          return cubeState[side][2].slice();
        case "front":
          if (side === "top") {
            return cubeState[side][2].slice().reverse();
          } else if (side === "right") {
            return [
              cubeState[side][0][0],
              cubeState[side][1][0],
              cubeState[side][2][0],
            ];
          } else if (side === "bottom") {
            return cubeState[side][0].slice().reverse();
          } else if (side === "left") {
            return [
              cubeState[side][0][2],
              cubeState[side][1][2],
              cubeState[side][2][2],
            ];
          }
        case "back":
          if (side === "top") {
            return cubeState[side][0].slice().reverse();
          } else if (side === "right") {
            return [
              cubeState[side][0][2],
              cubeState[side][1][2],
              cubeState[side][2][2],
            ];
          } else if (side === "bottom") {
            return cubeState[side][2].slice().reverse();
          } else if (side === "left") {
            return [
              cubeState[side][0][0],
              cubeState[side][1][0],
              cubeState[side][2][0],
            ];
          }
        case "left":
          if (side === "back") {
            return cubeState[side].map((row) => row[2]);
          } else {
            return cubeState[side].map((row) => row[0]).reverse();
          }
        case "right":
          if (side === "back") {
            return cubeState[side].map((row) => row[0]).reverse();
          } else if (side === "top") {
            return cubeState[side].map((row) => row[2]).reverse();
          } else {
            return cubeState[side].map((row) => row[2]);
          }
        case "horizontal":
          return cubeState[side][1].slice();
        case "verticalfront":
          if (side === "top" || side === "bottom") {
            return cubeState[side][1].slice().reverse();
          } else if (side === "right" || side === "left") {
            return cubeState[side].map((row) => row[1]);
          }
        case "verticalside":
          const middleStickers = cubeState[side].map((row) => row[1]);
          return side === "bottom" || side === "back"
            ? middleStickers.reverse()
            : middleStickers;
        default:
          return [];
      }
    });

    console.log(tempStickers);

    // Update adjacent stickers
    for (let i = 0; i < 4; i++) {
      const nextSide = i === 3 ? 0 : i + 1;
      if (face === "top") {
        cubeState[adjacentSides[face][nextSide]][0] = tempStickers[i];
      } else if (face === "bottom") {
        cubeState[adjacentSides[face][nextSide]][2] = tempStickers[i];
      } else if (face === "front") {
        if (i === 3) {
          cubeState[adjacentSides[face][nextSide]][2] =
            direction === "clockwise"
              ? tempStickers[i].slice().reverse()
              : tempStickers[i];
        } else if (i === 0) {
          cubeState[adjacentSides[face][nextSide]][0][0] =
            direction === "clockwise" ? tempStickers[0][2] : tempStickers[0][0];
          cubeState[adjacentSides[face][nextSide]][1][0] = tempStickers[0][1];
          cubeState[adjacentSides[face][nextSide]][2][0] =
            direction === "clockwise" ? tempStickers[0][0] : tempStickers[0][2];
        } else if (i === 1) {
          cubeState[adjacentSides[face][nextSide]][0] =
            direction === "clockwise"
              ? tempStickers[i].slice().reverse()
              : tempStickers[i];
        } else if (i === 2) {
          cubeState[adjacentSides[face][nextSide]][0][2] =
            direction === "clockwise" ? tempStickers[2][2] : tempStickers[2][0];
          cubeState[adjacentSides[face][nextSide]][1][2] = tempStickers[2][1];
          cubeState[adjacentSides[face][nextSide]][2][2] =
            direction === "clockwise" ? tempStickers[2][0] : tempStickers[2][2];
        }
      } else if (face === "back") {
        if (i === 3) {
          cubeState[adjacentSides[face][nextSide]][0] = tempStickers[i];
        } else if (i === 0) {
          cubeState[adjacentSides[face][nextSide]][0][0] = tempStickers[0][0];
          cubeState[adjacentSides[face][nextSide]][1][0] = tempStickers[0][1];
          cubeState[adjacentSides[face][nextSide]][2][0] = tempStickers[0][2];
        } else if (i === 1) {
          cubeState[adjacentSides[face][nextSide]][2] = tempStickers[i];
        } else if (i === 2) {
          cubeState[adjacentSides[face][nextSide]][0][2] = tempStickers[2][0];
          cubeState[adjacentSides[face][nextSide]][1][2] = tempStickers[2][1];
          cubeState[adjacentSides[face][nextSide]][2][2] = tempStickers[2][2];
        }
      } else if (face === "left" || face === "right") {
        const isLeft = face === "left";
        if (i === 2) {
          cubeState[adjacentSides[face][nextSide]][0][2] = tempStickers[i][0];
          cubeState[adjacentSides[face][nextSide]][1][2] = tempStickers[i][1];
          cubeState[adjacentSides[face][nextSide]][2][2] = tempStickers[i][2];
        } else if ((i == 3 || i == 1) && !isLeft) {
          cubeState[adjacentSides[face][nextSide]][0][2] = tempStickers[i][0];
          cubeState[adjacentSides[face][nextSide]][1][2] = tempStickers[i][1];
          cubeState[adjacentSides[face][nextSide]][2][2] = tempStickers[i][2];
        } else {
          cubeState[adjacentSides[face][nextSide]][0][0] =
            tempStickers[i][isLeft ? 2 : 0];
          cubeState[adjacentSides[face][nextSide]][1][0] = tempStickers[i][1];
          cubeState[adjacentSides[face][nextSide]][2][0] =
            tempStickers[i][isLeft ? 0 : 2];
        }
      } else if (face === "horizontal") {
        cubeState[adjacentSides[face][nextSide]][1] = tempStickers[i];
      } else if (face === "verticalfront") {
        if (i === 3) {
          cubeState[adjacentSides[face][nextSide]][1] =
            direction === "clockwise"
              ? tempStickers[i].slice().reverse()
              : tempStickers[i];
        } else if (i === 0) {
          cubeState[adjacentSides[face][nextSide]][0][1] =
            direction === "clockwise" ? tempStickers[0][2] : tempStickers[0][0];
          cubeState[adjacentSides[face][nextSide]][1][1] = tempStickers[0][1];
          cubeState[adjacentSides[face][nextSide]][2][1] =
            direction === "clockwise" ? tempStickers[0][0] : tempStickers[0][2];
        } else if (i === 1) {
          cubeState[adjacentSides[face][nextSide]][1] =
            direction === "clockwise"
              ? tempStickers[i].slice().reverse()
              : tempStickers[i];
        } else if (i === 2) {
          cubeState[adjacentSides[face][nextSide]][0][1] =
            direction === "clockwise" ? tempStickers[2][2] : tempStickers[2][0];
          cubeState[adjacentSides[face][nextSide]][1][1] = tempStickers[2][1];
          cubeState[adjacentSides[face][nextSide]][2][1] =
            direction === "clockwise" ? tempStickers[2][0] : tempStickers[2][2];
        }
      } else if (face === "verticalside") {
        const middleStickers = tempStickers[i];
        cubeState[adjacentSides[face][nextSide]][0][1] = middleStickers[0];
        cubeState[adjacentSides[face][nextSide]][1][1] = middleStickers[1];
        cubeState[adjacentSides[face][nextSide]][2][1] = middleStickers[2];
      }
    }

    console.log("Before saving to database:", JSON.stringify(cubeState));
    await this.saveCubeState(cubeState);
    console.log("After saving to database:", JSON.stringify(cubeState));
  }

  rotateFaceStickers(faceStickers, direction) {
    const newFaceStickers = [];
    for (let c = 0; c < 3; c++) {
      newFaceStickers.push([]);
      for (let r = 2; r >= 0; r--) {
        if (direction === clockwise) {
          newFaceStickers[c].push(faceStickers[r][c]);
        } else if (direction === counterClockwise) {
          newFaceStickers[c].push(faceStickers[c][r]);
        }
      }
    }
    return newFaceStickers;
  }

  async createCubeTable() {
    return new Promise((resolve, reject) => {
      const query = `
        CREATE TABLE IF NOT EXISTS cube (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          state TEXT
        )
      `;
      db.run(query, (err) => {
        if (err) {
          console.error("Failed to create the cube table:", err);
          reject(new Error("Failed to create the cube table."));
        } else {
          console.log("Cube table created.");
          resolve();
        }
      });
    });
  }

  loadCubeState() {
    return new Promise((resolve, reject) => {
      const query = "SELECT state FROM cube ORDER BY id DESC LIMIT 1";
      db.get(query, (err, row) => {
        if (err) {
          console.error(
            "Failed to load the cube state from the database:",
            err
          );
          reject(new Error("Failed to load the cube state."));
        } else if (row && row.state) {
          const cubeState = JSON.parse(row.state);
          console.log("Found state in the database:", cubeState);
          this.cubeState = cubeState;
          resolve(cubeState);
        } else {
          console.log("No state found in the database.");
          const initialState = this.initializeCubeState();
          this.saveCubeState(initialState)
            .then(() => resolve(initialState))
            .catch((error) => reject(error));
        }
      });
    });
  }

  initializeCubeState() {
    // Directly initialize the cube state without querying the database.
    console.log("Initializing the cube state...");
    const cubeState = {
      front: [
        ["r1", "r2", "r3"],
        ["r4", "r5", "r6"],
        ["r7", "r8", "r9"],
      ],
      back: [
        ["o1", "o2", "o3"],
        ["o4", "o5", "o6"],
        ["o7", "o8", "o9"],
      ],
      left: [
        ["g1", "g2", "g3"],
        ["g4", "g5", "g6"],
        ["g7", "g8", "g9"],
      ],
      right: [
        ["b1", "b2", "b3"],
        ["b4", "b5", "b6"],
        ["b7", "b8", "b9"],
      ],
      top: [
        ["w1", "w2", "w3"],
        ["w4", "w5", "w6"],
        ["w7", "w8", "w9"],
      ],
      bottom: [
        ["y1", "y2", "y3"],
        ["y4", "y5", "y6"],
        ["y7", "y8", "y9"],
      ],
    };
    return cubeState;
  }
}

module.exports = RubiksCube;
