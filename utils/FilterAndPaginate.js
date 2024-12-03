/**
 * Filter and paginate need some argument
 * @param {object} DataModel the model of resource
 * @param {object} query the user query coming from request
 * @param {string} query field to apply search
 * @param {number} query limit for data count
 */

const AppError = require("./AppError");
const ApplyFilter = require("./ApplyFilter");

const FilterAndPaginate = async function (
  findQuery,
  request,
  searchField,
  limit = 12,
  next,
  resourceName = "data"
) {
  const userQuery = request.query;
  const dataQuery = findQuery;

  const filteredQuery = new ApplyFilter(userQuery, dataQuery)
    .query(searchField)
    .filter()
    .sort()
    .limitField();

  const totalItem = await filteredQuery.dataQuery.clone().countDocuments();

  const totalPage =
    totalItem / (request.query?.limit ? +request.query?.limit : limit);

  const pagination = {
    currentPage: +request.query?.page || 1,
    totalItem,
    totalPage: Math.ceil(totalPage),
  };

  const dataList = await filteredQuery.page(limit).dataQuery;
  if (!dataList) return next(new AppError(`No ${resourceName} found`, 404));

  // return pagination object and allResource
  return {
    dataList,
    pagination,
  };
};

module.exports = FilterAndPaginate;
