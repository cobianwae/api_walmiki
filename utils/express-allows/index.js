module.exports = function(parent, allows){
  return function(req, res, next){
    var url  = req.url;
    for(var i in allows){
      if(allows[i].path instanceof RegExp){
        if(url.match(allows[i].path) !== null && req.method.toLowerCase() === allows[i].method.toLowerCase()){
          return next();
        }
      }
      if(url === allows[i].path && req.method.toLowerCase() === allows[i].method.toLowerCase()){
        return next();
      }
    }
    parent(req, res, next);
  }
};
