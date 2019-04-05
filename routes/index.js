const patientsRoutes = require("./patients");
// const postsRoutes = require("./posts");
// const likeRouts = require("./likes");

const constructorMethod = app => {
  app.use("/patients", patientsRoutes);
//   app.use("/posts", postsRoutes);
//   app.use("/likes", likeRouts);

  app.use("*", (req, res) => {
    res.status(404).json({ error: "Not found(in routes/index)" });
  });
};

module.exports = constructorMethod;