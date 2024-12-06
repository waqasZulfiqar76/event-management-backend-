const paginate = async (
  model,
  page = 1,
  limit = 10,
  filter = {},

  populate = ""
) => {
  try {
    const pageNum = parseInt(page) || 1;
    const pageLimit = parseInt(limit) || 10;
    const skip = (pageNum - 1) * pageLimit;

    const query = {};

    if (filter.title) {
      query.title = { $regex: filter.title, $options: "i" };
    }
    if (filter.category) {
      query.category = { $regex: filter.category, $options: "i" };
    }
    if (filter.location) {
      query.location = { $regex: filter.location, $options: "i" };
    }
    if (filter.approvalStatus) {
      query.approvalStatus = filter.approvalStatus;
    }

    console.log(filter, "filters here ");
    const totalCount = await model.countDocuments(query);

    const results = await model
      .find(query)
      .skip(skip)
      .limit(pageLimit)
      .populate(populate); // Populate the specified field(s)

    const totalPages = Math.ceil(totalCount / pageLimit);

    return {
      results,
      pagination: {
        totalCount,
        totalPages,
        currentPage: pageNum,
        pageSize: pageLimit,
      },
    };
  } catch (err) {
    console.error(err);
    throw new Error("Error during pagination");
  }
};

module.exports = { paginate };
