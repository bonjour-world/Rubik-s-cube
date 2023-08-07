const RubiksCube = require("../src/cube"); // Update the path to your RubiksCube class

describe("RubiksCube", () => {
  let rubiksCube;

  beforeAll(async () => {
    rubiksCube = new RubiksCube();
    await rubiksCube.start(); // Ensure the database table is created and cube state is loaded
  });

  beforeEach(() => {
    rubiksCube = new RubiksCube();
  });

  afterEach(() => {
    // Clean up any database changes after each test if necessary
  });

  it("should initialize cube state correctly", () => {
    const initialState = rubiksCube.initializeCubeState();
    expect(initialState).toEqual({
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
    });
  });

  it("should perform clockwise rotation correctly", async () => {
    await rubiksCube.performRotation(
      rubiksCube.cubeState,
      "front",
      "clockwise"
    );
    // Add assertions here to check if the cube state after rotation is as expected
  });

  it("should perform counterclockwise rotation correctly", async () => {
    await rubiksCube.performRotation(
      rubiksCube.cubeState,
      "top",
      "counterClockwise"
    );
    // Add assertions here to check if the cube state after rotation is as expected
  });

  it("should update cube state after rotation", async () => {
    const initialCubeState = JSON.parse(JSON.stringify(rubiksCube.cubeState)); // Make a copy of the initial cube state

    // Call the rotateFace method and then check if the cube state is updated correctly
    await rubiksCube.rotateFace("right", "clockwise");

    // Assert that the cube state has been updated as expected
    expect(rubiksCube.cubeState).not.toEqual(initialCubeState); // The cube state should have changed
    // Add more specific assertions here if needed
  });
});
