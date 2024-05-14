require("dotenv").config()
const express = require("express")
const session = require("express-session")
const mongoose = require("mongoose")
const mStore = require("connect-mongodb-session")(session)
const Shayari = require("./models/ShayariModel")
const imgbbUploader = require("imgbb-uploader")
const path = require("path")
const multer = require("multer")
const cors = require("cors")
const app = express()
const port = 2001

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("Connected to MongoDB")
  } catch (error) {
    console.log("Error connecting to MongoDB", error.message)
  }
}

connectDB()

let store = new mStore({
  uri: process.env.MONGO_URI,
  collection: "sessions",
})

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
)

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const authenticate = (req, res, next) => {
  if (req.session.user && req.session) {
    next()
  } else {
    res.render("message", { message: "Unauthorized!" })
  }
}

app.get("/", authenticate, (req, res) => {
  res
    .status(200)
    .json({ status: "success", message: "Welcome to the Shayari API" })
})

app.get("/login", (req, res) => {
  res.render("login")
})

app.get("/addnew", (req, res) => {
  res.render("add")
})

app.post("/login", (req, res) => {
  const { username, password } = req.body
  if (!username || !password)
    return res
      .status(400)
      .json({ status: "error", message: "Username and password are required" })
  if (
    username === process.env.APP_USERNAME &&
    password === process.env.APP_PASSWORD
  ) {
    req.session.user = username
    res.status(200).json({ status: "ok", message: "Logged in successfully!" })
  } else {
    res.status(401).json({ status: "error", message: "Invalid credentials" })
  }
})

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ status: "error", message: "Error logging out" })
    } else {
      res
        .status(200)
        .json({ status: "success", message: "Logged out successfully" })
    }
  })
})

app.get("/dashboard", authenticate, (req, res) => {
  res.render("dashboard")
})

app.get("/shayaris", authenticate, async (req, res) => {
  try {
    const shayaris = await Shayari.find()
    res.render("shayaris", { shayaris })
  } catch (error) {
    res.render("message", { message: error.message })
  }
})

app.post(
  "/shayaris",
  authenticate,
  upload.single("image"),
  async (req, res) => {
    const { title, content, author } = req.body
    const image = req.file ? req.file.buffer : null
    if (!title || !content)
      return res
        .status(400)
        .json({ status: "error", message: "Please provide all contents" })
    try {
      let imageLink
      if (image != null) {
        const response = await imgbbUploader({
          apiKey: process.env.IMGBB_API_KEY,
          base64string: image.toString("base64"),
          name: req.file.originalname,
        })
        imageLink = response.url
      }
      const newShayari = new Shayari({
        title,
        content,
        image: imageLink,
        author,
      })
      await newShayari.save()
      res
        .status(201)
        .json({ status: "ok", message: "Shayari added successfully" })
    } catch (error) {
      res.render("message", { message: error.message })
    }
  }
)

app.get("/shayari/:id", authenticate, async (req, res) => {
  try {
    const shayari = await Shayari.findById(req.params.id)
    if (!shayari)
      return res.render("message", { message: "Shayari not found" })
    const date = shayari.date.toDateString()
    res.render("shayari", { shayari, date })
  } catch (error) {
    res.render("message", { message: error.message })
  }
})

app.get("/shayari/edit/:id", authenticate, async (req, res) => {
  try {
    const shayari = await Shayari.findById(req.params.id)
    if (!shayari)
      return res
        .status(404)
        .json({ status: "error", message: "Shayari not found" })
    res.render("edit", { shayari })
  } catch (error) {
    res.render("message", { message: error.message })
  }
})

app.put(
  "/shayari/:id",
  authenticate,
  upload.single("image"),
  async (req, res) => {
    const { title, content, author } = req.body
    const image = req.file ? req.file.buffer : null
    try {
      let newImage
      const existingShayari = await Shayari.findById(req.params.id)
      if (!existingShayari)
        return res
          .status(404)
          .json({ status: "error", message: "Shayari not found" })
      if (image != null) {
        const response = await imgbbUploader({
          apiKey: process.env.IMGBB_API_KEY,
          base64string: image.toString("base64"),
          name: req.file.originalname,
        })
        newImage = response.url
      }
      let updatedShayari = {}
      updatedShayari.title = title ? title : existingShayari.title
      updatedShayari.content = content ? content : existingShayari.content
      updatedShayari.author = author ? author : existingShayari.author
      updatedShayari.image = newImage ? newImage : existingShayari.image
      const shayari = await Shayari.findByIdAndUpdate(
        req.params.id,
        updatedShayari
      )
      res.status(200).json({
        status: "ok",
        message: "Shayari updated successfully",
        shayari,
      })
    } catch (error) {
      res.render("message", { message: error.message })
    }
  }
)

app.delete("/shayari/:id", authenticate, async (req, res) => {
  try {
    const shayari = await Shayari.findByIdAndDelete(req.params.id)
    if (!shayari)
      return res
        .status(404)
        .json({ status: "error", message: "Shayari not found" })
    res
      .status(200)
      .json({ status: "success", message: "Shayari deleted successfully" })
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message })
  }
})

app.get("/api", async (req, res) => {
  try {
    const shayaris = await Shayari.find()
    res.status(200).json({ status: "ok", shayaris })
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message })
  }
})

app.get("/api/:id", async (req, res) => {
  try {
    const shayari = await Shayari.findById(req.params.id)
    if (!shayari)
      return res
        .status(404)
        .json({ status: "error", message: "Shayari not found" })
    res.status(200).json({ status: "ok", shayari })
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message })
  }
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
