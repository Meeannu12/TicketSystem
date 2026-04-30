const User = require("../model/user");

const getIdsFromDB = async (eventId) => {
    const data = await User.find({ checkIn: false, eventId }).select("_id");

    console.log('check what data come from DB', data)
    return data.map((item) => item._id);
};

module.exports = { getIdsFromDB };