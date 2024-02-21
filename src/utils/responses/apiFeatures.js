class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  filterTable(...allowedFields) {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    let fieldsFilter = [];
    if (queryObj.filter) {
      if (allowedFields) {
        allowedFields.forEach(field => {
          let fieldFilter = {};
          fieldFilter[field] = {
            $regex: queryObj.filter.toLowerCase(),
            $options: 'i'
          };
          fieldsFilter.push(fieldFilter);
        });
        this.query = this.query.find({
          $or: fieldsFilter
        });
      }
    }
    return this;
  }

  filterTableAdvancedFilterDate(field, startDate, endDate) {
    if (startDate && endDate) {
      this.query = this.query.find({
        [field]: { $gte: new Date(startDate), $lte: new Date(endDate) }
      });
    } else {
      if (!endDate && startDate) {
        this.query = this.query.find({
          [field]: { $eq: new Date(startDate) }
        });
      } else {
        if (endDate && !startDate) {
          this.query = this.query.find({
            [field]: { $eq: new Date(startDate) }
          });
        }
      }
    }
    return this;
  }

  findByExact(field, searchValue) {
    if (field && searchValue) {
      this.query = this.query.find({
        [field]: {
          $regex: searchValue.toLowerCase(),
          $options: 'i'
        }
      });
    }
    return this;
  }

  findByExactNoLike(field, searchValue) {
    if (field && searchValue) {
      this.query = this.query.find({
        [field]: searchValue.toLowerCase()
      });
    }
    return this;
  }
  // TODO
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    }
    // else {
    //   this.query = this.query.sort('-createdAt');
    // }

    return this;
  }

  sortCustom(sorts) {
    if (sorts) {
      const sortBy = sorts.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate(pageIn, limitIn) {
    if (!pageIn && !limitIn) {
      const page = this.queryString.page * 1 || 1;
      const limit = this.queryString.limit * 1 || 100;
      const skip = (page - 1) * limit;
      this.query = this.query.skip(skip).limit(limit);
    } else {
      const page = pageIn * 1 || 1;
      const limit = limitIn * 1 || 100;
      const skip = (page - 1) * limit;
      this.query = this.query.skip(skip).limit(limit);
    }
    return this;
  }
}
module.exports = APIFeatures;
