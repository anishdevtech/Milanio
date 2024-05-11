const { model, Schema } = require("mongoose");

module.exports = model(
    "warningSchema",
    new Schema({
        guild: {
            type: String,
            required: true,
        },
        userId: {
            type: String,
            required: true
        },
        warnings: {
            type: Array,
            default: []
        }
    })
);
