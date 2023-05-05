module.exports = (req, res, next) => {
    if(req.body.sauce){
      const sauce = JSON.parse(req.body.sauce)
      req.body = sauce
    }
    next()
}