import {
  closeConnection,
  dbConnection,
} from "../data/config/mongoConnection.js";
import { createLevel } from "../data/levels.js";
import { createUser } from "../data/users.js";

await dbConnection();

const newUser = await createUser({
  id: "FAKE",
  email_addresses: [{ email_address: "fake@gmail.com" }],
  first_name: "Tom L.",
  last_name: "Notreal",
  image: "",
});

const newUser2 = await createUser({
  id: "FAKE2",
  email_addresses: [{ email_address: "fake2@gmail.com" }],
  first_name: "Cereal",
  last_name: "Lover",
  image: "",
});

const firstLevel = await createLevel(
  {
    userId: newUser.clerkId,
    name: "Abandon Ship",
    data: [
      [0, 11.11, "l", 0],
      [1, 11.54, "l", 2],
      [2, 11.96, "p", 0],
      [3, 12.41, "j", 1],
      [5, 12.82, "a", 0],
      [6, 13.25, "n", 2],
      [8, 13.67, "i", 0],
      [10, 14.13, "e", 1],
      [12, 14.68, "f", 2],
      [13, 15.21, "n", 1],
      [14, 15.59, "c", 0],
      [15, 15.77, "j", 2],
      [216, 16.32, "h", 0],
      [217, 16.76, "j", 1],
      [218, 17.18, "l", 0],
      [219, 17.59, "k", 2],
      [220, 18.07, "m", 0],
      [221, 18.46, "n", 2],
      [222, 19.75, "p", 0],
      [223, 20.17, "o", 2],
      [224, 21.47, "l", 0],
      [225, 21.89, "k", 1],
      [226, 23.19, "t", 2],
      [227, 23.59, "g", 0],
      [228, 24.92, "v", 2],
      [229, 25.33, "h", 1],
      [230, 26.64, "o", 0],
      [232, 27.09, "u", 2],
      [233, 27.49, "y", 1],
      [234, 27.9, "t", 0],
      [235, 28.37, "f", 2],
      [236, 30.03, "l", 1],
      [237, 30.46, "k", 2],
      [238, 31.8, "f", 1],
      [239, 32.22, "n", 0],
      [240, 33.42, "w", 1],
      [241, 33.86, "e", 2],
      [242, 35.16, "c", 1],
      [243, 35.58, "v", 0],
      [244, 36.88, "l", 1],
      [245, 37.31, "a", 2],
      [246, 38.52, "r", 1],
      [247, 39.03, "y", 0],
      [248, 40.25, "i", 0],
      [249, 40.72, "h", 1],
      [250, 41.16, "v", 2],
      [251, 41.56, "c", 1],
      [252, 42.87, "e", 1],
      [253, 43.28, "q", 0],
      [254, 44.57, "4", 1],
      [255, 45.06, "2", 2],
      [257, 46.3, "s", 1],
      [258, 46.77, "d", 0],
      [261, 47.18, "l", 1],
      [262, 47.59, "k", 2],
      [263, 48.91, "r", 1],
      [264, 49.4, "t", 2],
      [265, 50.58, "d", 1],
      [266, 51.05, "n", 0],
      [267, 52.22, "l", 1],
      [268, 52.7, "a", 2],
      [269, 53.99, "x", 2],
      [270, 54.46, "z", 1],
      [271, 54.91, "d", 0],
      [274, 57.62, "k", 0],
      [275, 57.82, "j", 1],
      [277, 60.87, "m", 0],
      [278, 61.08, "n", 1],
      [279, 61.31, "s", 2],
      [280, 61.58, "a", 1],
      [281, 64.34, "e", 2],
      [282, 64.72, "r", 1],
      [283, 65.12, "j", 2],
      [284, 65.56, "k", 1],
      [285, 66, "l", 0],
      [286, 66.85, "m", 1],
      [287, 67.75, "v", 2],
      [288, 68.14, "l", 1],
      [289, 68.59, "p", 0],
      [290, 69.44, "a", 1],
      [291, 70.29, "z", 1],
      [292, 71.13, "w", 1],
      [293, 71.57, "e", 2],
      [294, 72.86, "m", 1],
      [295, 73.74, "p", 0],
      [296, 74.64, "2", 1],
      [299, 77.93, "j", 1],
      [300, 78.36, "k", 0],
      [301, 79.64, "e", 1],
      [302, 80.5, "d", 1],
      [303, 81.36, "x", 2],
      [304, 81.78, "l", 1],
      [305, 83.04, "i", 1],
      [306, 83.9, "o", 1],
      [307, 84.8, "p", 2],
      [308, 85.25, "l", 1],
      [309, 85.6, "a", 0],
      [310, 86.05, "w", 1],
      [311, 86.54, "c", 2],
      [312, 86.92, "m", 1],
      [313, 88.22, ",", 1],
      [314, 88.68, "j", 0],
      [315, 89.89, "l", 2],
      [316, 90.77, ";", 0],
      [317, 91.63, "w", 0],
      [318, 92.07, "k", 1],
      [319, 92.49, "d", 2],
      [320, 92.93, ";", 1],
      [321, 93.36, "a", 2],
      [322, 94.22, "u", 1],
      [323, 95.08, "i", 0],
      [324, 95.5, "i", 1],
      [325, 95.93, "o", 2],
      [126, 98.51, "q", 0],
      [127, 98.81, "w", 1],
      [130, 99.24, "e", 2],
      [129, 99.62, "r", 1],
      [131, 100.39, "enter", 1],
    ],
  },
  "./src/tasks/abandon_ship.mp3",
);

const secondLevel = await createLevel(
  {
    userId: newUser2.clerkId,
    name: "Reeses Puffs",
    data: [
      [0, 2.56, "r", 1],
      [1, 3.09, "p", 1],
      [2, 3.36, "r", 0],
      [3, 3.86, "p", 0],
      [4, 4.67, "u", 0],
      [5, 5.17, "u", 1],
      [6, 5.68, "u", 2],
      [8, 6.75, "r", 2],
      [9, 7.25, "p", 2],
      [10, 7.53, "r", 0],
      [11, 8.07, "p", 0],
      [12, 8.89, "u", 2],
      [13, 9.45, "u", 1],
      [14, 10, "u", 0],
      [15, 10.5, "u", 1],
      [16, 12.26, "i", 0],
      [17, 12.39, "m", 1],
      [18, 12.65, "b", 2],
      [19, 14.2, "c", 1],
      [20, 14.94, "l", 1],
      [21, 16.04, "r", 1],
      [22, 16.92, "b", 1],
      [23, 18.4, "o", 0],
      [24, 18.8, "a", 1],
      [25, 19.14, "r", 2],
      [26, 21.84, "p", 0],
      [27, 22.29, "c", 2],
      [29, 23.79, "r", 1],
      [30, 24.31, "p", 1],
      [31, 24.71, "r", 0],
      [32, 25.27, "p", 0],
      [33, 27.29, "f", 2],
      [35, 27.41, "i", 1],
      [36, 27.7, "s", 0],
      [38, 28.43, "p", 1],
      [39, 28.97, "n", 1],
      [40, 29.38, "c", 0],
      [41, 29.81, "2", 2],
      [42, 31.64, "w", 1],
      [43, 32.02, "u", 0],
      [44, 34.53, "1", 1],
      [45, 35.07, "2", 1],
      [46, 35.69, "3", 1],
      [47, 36.25, "4", 1],
      [48, 38.55, "e", 0],
      [49, 39.15, "a", 0],
      [50, 39.67, "t", 0],
      [51, 40.25, "e", 1],
      [52, 40.83, "m", 1],
      [53, 41.41, "u", 2],
      [54, 41.95, "p", 2],
      [61, 46.66, "i", 1],
      [62, 47.32, "l", 1],
      [63, 47.97, "u", 1],
    ],
  },
  "./src/tasks/reeses.mp3",
);

console.log(newUser);
console.log(newUser2);

await closeConnection();
console.log("Seed file complete! Press Ctrl+C to exit");
