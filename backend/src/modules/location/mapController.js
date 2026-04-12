// GET /api/map — serves EJS map with injected JWT token
const getMap = (req, res) => {
  res.render("map", {
    token:  req.query.token || "",
    userId: req.user ? String(req.user._id) : "",
  });
};

module.exports = { getMap };
