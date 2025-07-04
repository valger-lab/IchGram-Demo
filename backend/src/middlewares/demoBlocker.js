import "dotenv/config";

const IS_DEMO = process.env.IS_DEMO === "true";

const demoBlocker = (req, res, next) => {
  if (IS_DEMO) {
    return res
      .status(403)
      .json({ message: "Diese Funktion ist in der Demo-Version deaktiviert." });
  }
  next();
};

export default demoBlocker;
