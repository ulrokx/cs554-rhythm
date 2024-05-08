import levelRoutes from "./level.js";
import userRoutes from "./users.js";

function configRoutes(app) {
  app.use("/levels", levelRoutes);
  app.use("/users", userRoutes);
}

export default configRoutes;
