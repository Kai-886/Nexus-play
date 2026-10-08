class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    search() {
        // console.log("Keyword:", this.queryString.keyword);
        const keyword = this.queryString.keyword
            ? {
                $or: [
                    {
                        title: {
                            $regex: this.queryString.keyword,
                            $options: "i"
                        }
                    },
                    {
                        description: {
                            $regex: this.queryString.keyword,
                            $options: "i"
                        }
                    },
                    {
                        game: {
                            $regex: this.queryString.keyword,
                            $options: "i"
                        }
                    }
                ]
            }
            : {};

        this.query = this.query.find(keyword);

        return this;
    }

    filter() {
        const { game, venue } = this.queryString;

        const filters = {};

        if (game) {
            filters.game = {
                $regex: game,
                $options: "i"
            };
        }

        if (venue) {
            filters.venue = {
                $regex: venue,
                $options: "i"
            };
        }

        this.query = this.query.find(filters);

        return this;
    }

    dateFilter() {
        const { startDate, endDate } = this.queryString;

        if (startDate || endDate) {
            const dateFilter = {};

            if (startDate) {
                dateFilter.$gte = new Date(startDate);
            }

            if (endDate) {
                dateFilter.$lte = new Date(endDate);
            }

            this.query = this.query.find({
                startDate: dateFilter
            });
        }

        return this;
    }

    sort() {
        if (this.queryString.sort) {
            this.query = this.query.sort(
                this.queryString.sort.split(",").join(" ")
            );
        } else {
            this.query = this.query.sort("startDate");
        }

        return this;
    }

    pagination(resPerPage) {
        const currentPage = Number(this.queryString.page) || 1;

        const skip = resPerPage * (currentPage - 1);

        this.query = this.query
            .skip(skip)
            .limit(resPerPage);

        return this;
    }
}

export default APIFeatures;