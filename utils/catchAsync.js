module.exports = catchAsync = function (fn) {
  // the reason this return function get's access to the req,res,next is this is the middleware function
  // that return a functtion with this object that being called when client hit it's targeted route
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};
