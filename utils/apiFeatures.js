const { Op } = require("sequelize");

class APIFeatures {
  constructor(queryString) {
    this.queryString = queryString;
    this.queryOptions = {};
    this.paginationResult = {};
  }

  filter() {
    const excluded = ["page", "sort", "limit", "fields", "keyword"];
    const queryObj = { ...this.queryString };
    excluded.forEach((el) => delete queryObj[el]);

    /*
    queryObj = {
      location: 'Miami',
      'starRating[gte]': '4'
    }
    */
    const allowedFields = [
      "location",
      "starRating",
      "price",
      "name",
      "description",
      "roomType",
      "availability",
      "pricePerNight",
      "capacity",
    ];

    const where = {};

    for (const key in queryObj) {
      const baseField = key.includes("[") ? key.split("[")[0] : key;
      if (!allowedFields.includes(baseField)) continue;

      if (key.includes("[")) {
        const [field, operator] = key.split("[");
        const cleanOperator = operator.replace("]", "");

        const opMap = {
          gte: Op.gte,
          gt: Op.gt,
          lte: Op.lte,
          lt: Op.lt,
        };

        if (!where[field]) where[field] = {}; // => where.starRating = {}
        where[field][opMap[cleanOperator]] = queryObj[key]; // => where.starRating[Op.gte] = 4
      } else {
        where[key] = queryObj[key];
      }
    }
    /*
    Final result:
    where = {
      location: 'Miami',
      starRating: {
      [Op.gte]: '4'
    }
  }
    */

    this.queryOptions.where = { ...this.queryOptions.where, ...where };
    return this;
  }

  search() {
    if (this.queryString.keyword) {
      const keyword = this.queryString.keyword;

      const searchConditions = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${keyword}%` } },
          { description: { [Op.iLike]: `%${keyword}%` } },
        ],
      };

      this.queryOptions.where = {
        ...this.queryOptions.where,
        ...searchConditions,
      };
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").map((el) => {
        if (el.startsWith("-")) {
          return [el.slice(1), "DESC"];
        }
        return [el, "ASC"];
      });
      this.queryOptions.order = sortBy;
    } else {
      this.queryOptions.order = [["createdAt", "DESC"]];
    }
    return this;
  }

  limitedFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",");
      this.queryOptions.attributes = fields;
    }
    return this;
  }

  paginate() {
    const maxLimit = 100;
    const page = +this.queryString.page || 1;
    const limit = Math.min(+this.queryString.limit || 10, maxLimit);
    const offset = (page - 1) * limit;

    this.queryOptions.limit = limit;
    this.queryOptions.offset = offset;

    this.paginationResult = { page, limit };
    return this;
  }

  async execute(Model) {
    const results = await Model.findAll(this.queryOptions);
    return results;
  }
}

module.exports = APIFeatures;

/*

e.g: 

GET /api/v1/hotels?location=Miami&starRating[gte]=4&keyword=deluxe&page=2&limit=5&sort=price&fields=name,location

this.queryOptions = {
  where: {
    location: "Miami",
    starRating: { [Op.gte]: 4 },
    [Op.or]: [
      { name: { [Op.iLike]: "%deluxe%" } },
      { description: { [Op.iLike]: "%deluxe%" } }
    ]
  },
  order: [["price", "ASC"]],
  attributes: ["name", "location"],
  limit: 5,
  offset: 5
}


*/
