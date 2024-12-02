const paginate = async (model, page = 1, limit = 10, filter = {}) => {
    try {
      // Convert page and limit to numbers
      const pageNum = parseInt(page) || 1;
      const pageLimit = parseInt(limit) || 10;
  
      // Calculate the skip value based on the page number and limit
      const skip = (pageNum - 1) * pageLimit;
  
      // Build the search query (filters)
      const query = {};
  
      if (filter.title) {
        query.title = { $regex: filter.title, $options: 'i' }; // Case-insensitive search
      }
      if (filter.category) {
        query.category = { $regex: filter.category, $options: 'i' }; // Case-insensitive search
      }
      if (filter.location) {
        query.location = { $regex: filter.location, $options: 'i' }; // Case-insensitive search
      }
  
      // Get total count of items in the collection with filters
      const totalCount = await model.countDocuments(query);
  
      // Get the paginated results with filters
      const results = await model.find(query).skip(skip).limit(pageLimit);
  
      // Calculate total number of pages
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
      throw new Error('Error during pagination');
    }
  };
  
  module.exports = { paginate };
  