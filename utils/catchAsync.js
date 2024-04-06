module.exports = catchAsync = function (fn) {
  return (req) => {
    console.log(req);
  };
};
