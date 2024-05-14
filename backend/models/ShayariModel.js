const mongoose = require("mongoose")

const shayariSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    default: "Anshhh",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  image : {
    type : String,
    default : "https://i.ibb.co/CnPPxKc/794-2560x1440-jpg.jpg"
  }
})

const Shayari = mongoose.model("Shayari", shayariSchema)

module.exports = Shayari
