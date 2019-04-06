const homeRoutes = require("./home");
const searchRoutes = require("./search");
const detailsRoutes = require("./details");
//const path = require("path");

const constructorMethod = app =>
{

  app.use("/", homeRoutes);
  app.use("/search", searchRoutes);
  app.use("/details", detailsRoutes);

  app.use("*", (req, res) =>
  {
    res.status(500).json();
    return;
  });
};

module.exports = constructorMethod;