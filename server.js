require("dotenv").config();
const express = require("express");
const { connectDB } = require("./connect");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/user");

// Routes
const userRouter = require("./routes/user");
const uploadRouter = require("./routes/upload");

const app = express();
const PORT = process.env.PORT || 8000;

// Connect to MongoDB
connectDB(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(() => console.log("Error connecting to MongoDB"));

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Session setup
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Root route
app.get("/", (req, res) => {
  res.send("Audora Backend is up and running");
});

// Passport Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${(
        process.env.BACKEND_URL || "http://localhost:8000"
      ).replace(/\/$/, "")}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;

        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            email,
            name,
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Serialize/Deserialize
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google Auth Routes
app.get("/auth/google", (req, res, next) => {
  // Save intended redirect in session
  if (req.query.redirect) {
    req.session.oauthRedirect = req.query.redirect;
  }
  passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next
  );
});

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${(
      process.env.FRONTEND_URL || "http://localhost:3000"
    ).replace(/\/$/, "")}/Authentication`,
  }),
  (req, res) => {
    // Use redirect from session, fallback to /HomePage
    const redirectPath = req.session.oauthRedirect || "/HomePage";
    delete req.session.oauthRedirect;
    res.redirect(
      `${(process.env.FRONTEND_URL || "http://localhost:3000").replace(
        /\/$/,
        ""
      )}${redirectPath}`
    );
  }
);

console.log("frontend URL:", process.env.FRONTEND_URL);
console.log("backend URL:", process.env.BACKEND_URL);
// Your APIs
app.use("/user", userRouter);
app.use("/upload", uploadRouter);

// Start server
app.listen(PORT, () => {
  console.log(
    `Server running on ${process.env.BACKEND_URL || `http://localhost:${PORT}`}`
  );
});
