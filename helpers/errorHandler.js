const errorHandler = (error, req, res, next) => {
        return res.status(error.status).json(error);
}

module.exports = errorHandler;