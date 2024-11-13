class ApplyFilter {
  constructor(userQuery, dataQuery) {
    this.userQuery = userQuery;
    this.dataQuery = dataQuery;
  }

  filter() {
    const queryObj = { ...this.userQuery };

    const optField = ["page", "limit", "sort", "field", "query"];
    // deleted the unwanted field for the method downbelow

    optField.forEach((item) => delete queryObj[item]);

    // checking for extra filter like less then and greater then
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\blt|lte|gt|gte/g, (matches) => `$${matches}`);

    this.dataQuery = this.dataQuery.find(JSON.parse(queryStr));
    return this;
  }
  query() {
    if (this.userQuery.query) {
      const searchQuery = this.userQuery?.query;
      console.log();

      let escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      this.dataQuery.find({
        title: { $regex: escapedQuery, $options: "i" },
      });
    }
    return this;
  }
  page() {
    // default page would be 10 item per page
    let perPage = this.userQuery?.limit || 12;
    let skip = this.userQuery.page * perPage - perPage;
    this.dataQuery.limit(perPage).skip(skip || 0);
    return this;
  }
  sort() {
    if (this.userQuery.sort) {
      const sortValue = this.userQuery.sort.split(",").join(" ");
      console.log(sortValue);
      this.dataQuery.sort(sortValue);
    }
    return this;
  }

  limitField() {
    if (this.userQuery.field) {
      const fieldData = this.userQuery.field.split(",").join(" ");
      this.dataQuery.select(fieldData);
    }
    return this;
  }
}

module.exports = ApplyFilter;
