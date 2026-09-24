const paginate = (page = 1, limit = 10) => {
  const parsedPage = parseInt(page) || 1;
  const parsedLimit = parseInt(limit) || 10;
  const offset = (parsedPage - 1) * parsedLimit;
  
  return {
    limit: parsedLimit,
    offset,
    page: parsedPage
  };
};

const paginateResponse = (data, page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(total),
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
};

module.exports = { paginate, paginateResponse };
