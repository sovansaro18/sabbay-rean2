import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import crypto from "crypto";
import { z } from "zod";
import { INITIAL_COURSES, INITIAL_ANNOUNCEMENTS } from "./server/seedData";

// MongoDB connection string checks
if (!process.env.MONGODB_URI) {
  throw new Error("CRITICAL ERROR: MONGODB_URI environment variable is not defined!");
}
const MONGODB_URI = process.env.MONGODB_URI;

// JWT secrets check
if (!process.env.JWT_SECRET) {
  throw new Error("CRITICAL ERROR: JWT_SECRET environment variable is not defined!");
}
const JWT_SECRET = process.env.JWT_SECRET;

if (!process.env.JWT_REFRESH_SECRET) {
  throw new Error("CRITICAL ERROR: JWT_REFRESH_SECRET environment variable is not defined!");
}
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const generateAccessToken = (userId: string, isAdmin: boolean) => {
  return jwt.sign({ userId, isAdmin }, JWT_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (userId: string, isAdmin: boolean) => {
  return jwt.sign({ userId, isAdmin }, JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

// Setup express
const app = express();
app.set('trust proxy', 1);
const PORT = 3000;

// CSRF protection middleware
const csrfProtection = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // If no csrf_token cookie exists, generate and set one
  if (!req.cookies["csrf_token"]) {
    const csrfToken = crypto.randomBytes(24).toString("hex");
    res.cookie("csrf_token", csrfToken, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 365 * 24 * 60 * 60 * 1000, // Long-lived
    });
    // Inject it so subsequent code in this request is aware of it
    req.cookies["csrf_token"] = csrfToken;
  }

  // Set the CSRF token in the response header so the client can read and store it
  res.setHeader("X-CSRF-Token", req.cookies["csrf_token"]);

  // Exempt safe methods
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Verify CSRF token
  const cookieToken = req.cookies["csrf_token"];
  const headerToken = req.headers["x-csrf-token"] || req.headers["X-CSRF-Token"];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    console.warn(`CSRF validation failed. Method: ${req.method}, Path: ${req.path}. Cookie: ${cookieToken}, Header: ${headerToken}`);
    return res.status(403).json({ error: "ការផ្ទៀងផ្ទាត់ CSRF បានបរាជ័យ (CSRF validation failed)!" });
  }

  next();
};

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://*.ytimg.com"],
      frameSrc: ["'self'", "https://www.youtube.com", "https://*.youtube.com"],
      connectSrc: ["'self'", "ws:", "wss:", "https://*"], // allow local/Vite web socket connections & remote APIs
      mediaSrc: ["'self'", "https://res.cloudinary.com", "https://*.googlevideo.com"],
      frameAncestors: process.env.NODE_ENV !== "production"
        ? ["'self'", "https://*.run.app", "https://*.google.com", "https://ai.studio", "https://*.aistudio.google", "https://*.googleusercontent.com"]
        : ["'self'"],
    },
  },
  xFrameOptions: process.env.NODE_ENV !== "production" ? false : { action: "sameorigin" },
}));
app.use(cookieParser());
app.use(express.json());
app.use(csrfProtection);

// Rate Limiting
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: { error: "ការស្នើសុំច្រើនដងពេកពី IP នេះ! សូមព្យាយាមម្តងទៀតបន្ទាប់ពី ១៥ នាទី។" },
  standardHeaders: true,
  legacyHeaders: false,
});

// User Schema & Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  avatarUrl: { type: String, default: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" },
  isAdmin: { type: Boolean, default: false },
  favorites: [{
    courseId: { type: String, required: true },
    lessonId: { type: String, required: true },
    savedAt: { type: String, required: true }
  }],
  progressList: [{
    courseId: { type: String, required: true },
    lessonId: { type: String, required: true },
    completed: { type: Boolean, default: false },
    lastWatchedPosition: { type: Number, default: 0 },
    updatedAt: { type: String, required: true }
  }]
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

// Course Schema & Model
const documentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, required: true, enum: ['PDF', 'Word', 'Slide', 'Link'] },
  fileSize: { type: String },
});

const lessonSchema = new mongoose.Schema({
  id: { type: String, required: true },
  courseId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  videoUrl: { type: String, required: true },
  duration: { type: String, required: true },
  order: { type: Number, required: true },
  documents: [documentSchema],
  notes: { type: String },
  resources: [String]
});

const courseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  thumbnail: { type: String, required: true },
  level: { type: String, required: true, enum: ['មូលដ្ឋាន', 'មធ្យម', 'កម្រិតខ្ពស់'] },
  author: { type: String, required: true },
  lessons: [lessonSchema],
  studentCount: { type: Number, default: 0 },
  rating: { type: Number, default: 5.0 },
  requirements: [String],
  learningOutcomes: [String],
  lastUpdated: { type: String }
}, { timestamps: true });

const CourseModel = mongoose.model("Course", courseSchema);

// Announcement Schema & Model
const announcementSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: String, required: true },
  category: { type: String, required: true, enum: ['system', 'new_course', 'maintenance'] }
}, { timestamps: true });

const AnnouncementModel = mongoose.model("Announcement", announcementSchema);

// Comment Schema & Model
const commentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  courseId: { type: String, required: true },
  lessonId: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userAvatar: { type: String },
  content: { type: String, required: true }
}, { timestamps: true });

const CommentModel = mongoose.model("Comment", commentSchema);

// Category Schema & Model
const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  labelEn: { type: String, required: true },
  color: { type: String, required: true }
}, { timestamps: true });

const CategoryModel = mongoose.model("Category", categorySchema);

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log("Successfully connected to MongoDB.");
    
    // Auto-seed/Ensure Admin account exists in DB
    try {
      const adminEmail = "admin@sabbayrean.com";
      const existingAdmin = await User.findOne({ email: adminEmail });
      
      if (!existingAdmin) {
        // Generate random 16-character password
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let randomPassword = "";
        for (let i = 0; i < 16; i++) {
          randomPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        const hashedPassword = await bcrypt.hash(randomPassword, 10);
        await User.create({
          name: "អ្នកគ្រប់គ្រងប្រព័ន្ធ SABBAY REAN",
          email: adminEmail,
          password: hashedPassword,
          avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
          isAdmin: true
        });
        
        console.log("==========================================================");
        console.log("[SEED] CREATED DEFAULT ADMIN USER IN DATABASE.");
        console.log(`Email:    ${adminEmail}`);
        console.log(`Password: ${randomPassword}`);
        console.log("PLEASE RECORD AND SECURE THESE CREDENTIALS FOR ADMIN LOGINS!");
        console.log("==========================================================");
      }
    } catch (err) {
      console.error("Error checking/seeding admin user:", err);
    }

    // Auto-seed courses if database collection is empty
    try {
      const courseCount = await CourseModel.countDocuments();
      if (courseCount === 0) {
        console.log("Course collection is empty. Seeding default courses...");
        await CourseModel.insertMany(INITIAL_COURSES);
        console.log("Successfully seeded default courses into MongoDB.");
      }
    } catch (err) {
      console.error("Error auto-seeding courses:", err);
    }

    // Auto-seed announcements if empty
    try {
      const announcementCount = await AnnouncementModel.countDocuments();
      if (announcementCount === 0) {
        console.log("Announcement collection is empty. Seeding default announcements...");
        await AnnouncementModel.insertMany(INITIAL_ANNOUNCEMENTS);
        console.log("Successfully seeded default announcements into MongoDB.");
      }
    } catch (err) {
      console.error("Error auto-seeding announcements:", err);
    }

    // Auto-seed comments if empty
    try {
      const commentCount = await CommentModel.countDocuments();
      if (commentCount === 0) {
        console.log("Comment collection is empty. Seeding default comments...");
        await CommentModel.insertMany([
          {
            id: "comment-1",
            courseId: "course-prog-1",
            lessonId: "lesson-py-1",
            userId: "seed-user-1",
            userName: "សួង សុភ័ក្រ",
            userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
            content: "វីដេអូបង្រៀនបានល្អណាស់បាទ! ងាយយល់សម្រាប់អ្នកទើបតែរៀនដំបូង។"
          },
          {
            id: "comment-2",
            courseId: "course-prog-1",
            lessonId: "lesson-py-1",
            userId: "seed-user-2",
            userName: "គឹម ស្រីនីន",
            userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
            content: "សូមអរគុណលោកគ្រូសម្រាប់ការចែករំលែកមេរៀនដ៏មានតម្លៃនេះ!"
          }
        ]);
        console.log("Successfully seeded default comments.");
      }
    } catch (err) {
      console.error("Error auto-seeding comments:", err);
    }

    // Auto-seed categories if empty
    try {
      const categoryCount = await CategoryModel.countDocuments();
      if (categoryCount === 0) {
        console.log("Category collection is empty. Seeding default categories...");
        await CategoryModel.insertMany([
          { id: 'chinese', label: 'ភាសាចិន', labelEn: 'Chinese Language', color: 'bg-red-500/10 text-red-600 border-red-500/20' },
          { id: 'english', label: 'ភាសាអង់គ្លេស', labelEn: 'English Language', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
          { id: 'computer', label: 'កុំព្យូទ័រ និងបច្ចេកវិទ្យា', labelEn: 'Computer & IT', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
          { id: 'general', label: 'ចំណេះដឹងទូទៅ', labelEn: 'General Knowledge', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' }
        ]);
        console.log("Successfully seeded default categories.");
      }
    } catch (err) {
      console.error("Error auto-seeding categories:", err);
    }
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// API Routes - Auth
// Validation Schemas
const registerSchema = z.object({
  name: z.string().min(2, "ឈ្មោះត្រូវតែមានយ៉ាងតិច ២ តួអក្សរ"),
  email: z.string().email("អាសយដ្ឋានអ៊ីមែលមិនត្រឹមត្រូវ"),
  password: z.string().min(3, "លេខសម្ងាត់ត្រូវតែមានយ៉ាងតិច ៣ តួអក្សរ"),
  avatarUrl: z.string().url().optional().or(z.literal('')),
});

const loginSchema = z.object({
  email: z.string().min(1, "សូមបញ្ចូលអ៊ីមែល"),
  password: z.string().min(1, "សូមបញ្ចូលលេខសម្ងាត់"),
});

const syncSchema = z.object({
  favorites: z.array(z.object({
    courseId: z.string(),
    lessonId: z.string(),
    savedAt: z.string(),
  })).optional(),
  progressList: z.array(z.object({
    courseId: z.string(),
    lessonId: z.string(),
    completed: z.boolean(),
    lastWatchedPosition: z.number().optional().default(0),
    updatedAt: z.string(),
  })).optional(),
});

const docZodSchema = z.object({
  id: z.string(),
  title: z.string(),
  fileUrl: z.string(),
  fileType: z.enum(['PDF', 'Word', 'Slide', 'Link']),
  fileSize: z.string().optional(),
});

const lessonZodSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  title: z.string(),
  description: z.string(),
  videoUrl: z.string(),
  duration: z.string(),
  order: z.number(),
  documents: z.array(docZodSchema).optional().default([]),
  notes: z.string().optional(),
  resources: z.array(z.string()).optional().default([]),
});

const courseZodSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, "ចំណងជើងវគ្គសិក្សាត្រូវតែមានយ៉ាងតិច ២ តួអក្សរ"),
  description: z.string().min(5, "ការពិពណ៌នាត្រូវតែមានយ៉ាងតិច ៥ តួអក្សរ"),
  category: z.string().min(1, "សូមបញ្ជាក់ប្រភេទវគ្គសិក្សា"),
  thumbnail: z.string().url("លីងរូបតំណាងមិនត្រឹមត្រូវ"),
  level: z.enum(['មូលដ្ឋាន', 'មធ្យម', 'កម្រិតខ្ពស់']),
  author: z.string().min(2, "ឈ្មោះអ្នកបង្រៀនត្រូវតែមានយ៉ាងតិច ២ តួអក្សរ"),
  lessons: z.array(lessonZodSchema).optional().default([]),
  studentCount: z.number().optional().default(0),
  rating: z.number().optional().default(5.0),
  requirements: z.array(z.string()).optional().default([]),
  learningOutcomes: z.array(z.string()).optional().default([]),
  lastUpdated: z.string().optional(),
});

const commentZodSchema = z.object({
  id: z.string().optional(),
  courseId: z.string().min(1, "សូមបញ្ជាក់វគ្គសិក្សា"),
  lessonId: z.string().min(1, "សូមបញ្ជាក់មេរៀន"),
  content: z.string().min(1, "មតិយោបល់មិនអាចទទេបានទេ"),
});

const announcementZodSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, "ចំណងជើងសេចក្តីប្រកាសត្រូវតែមានយ៉ាងតិច ២ តួអក្សរ"),
  content: z.string().min(5, "ខ្លឹមសារសេចក្តីប្រកាសត្រូវតែមានយ៉ាងតិច ៥ តួអក្សរ"),
  date: z.string().optional(),
  category: z.enum(['system', 'new_course', 'maintenance']),
});

// Middleware for input validation
const validateBody = (schema: z.ZodSchema) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errorMsg = result.error.issues.map(err => err.message).join(", ");
      return res.status(400).json({ error: errorMsg });
    }
    req.body = result.data;
    next();
  };
};

// Express authentication context interface
interface AuthRequest extends express.Request {
  user?: {
    userId: string;
    isAdmin: boolean;
  };
}

// Authentication Middlewares
const authenticateUser = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  const { access_token, refresh_token } = req.cookies;

  if (!access_token) {
    if (refresh_token) {
      try {
        const decoded = jwt.verify(refresh_token, JWT_REFRESH_SECRET) as { userId: string; isAdmin: boolean };
        const newAccessToken = generateAccessToken(decoded.userId, decoded.isAdmin);
        const newRefreshToken = generateRefreshToken(decoded.userId, decoded.isAdmin);

        res.cookie("access_token", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 15 * 60 * 1000,
        });

        res.cookie("refresh_token", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        req.user = { userId: decoded.userId, isAdmin: decoded.isAdmin };
        return next();
      } catch (err) {
        res.clearCookie("access_token");
        res.clearCookie("refresh_token");
        return res.status(401).json({ error: "សញ្ញាសម្គាល់ការចូលបានហួសកំណត់! សូមចូលប្រព័ន្ធឡើងវិញ។" });
      }
    }
    return res.status(401).json({ error: "សូមចូលប្រព័ន្ធដើម្បីបន្ត!" });
  }

  try {
    const decoded = jwt.verify(access_token, JWT_SECRET) as { userId: string; isAdmin: boolean };
    req.user = { userId: decoded.userId, isAdmin: decoded.isAdmin };
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError" && refresh_token) {
      try {
        const decoded = jwt.verify(refresh_token, JWT_REFRESH_SECRET) as { userId: string; isAdmin: boolean };
        const newAccessToken = generateAccessToken(decoded.userId, decoded.isAdmin);
        const newRefreshToken = generateRefreshToken(decoded.userId, decoded.isAdmin);

        res.cookie("access_token", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 15 * 60 * 1000,
        });

        res.cookie("refresh_token", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        req.user = { userId: decoded.userId, isAdmin: decoded.isAdmin };
        return next();
      } catch (refreshErr) {
        res.clearCookie("access_token");
        res.clearCookie("refresh_token");
        return res.status(401).json({ error: "សញ្ញាសម្គាល់ការចូលបានហួសកំណត់! សូមចូលប្រព័ន្ធឡើងវិញ។" });
      }
    }
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    return res.status(401).json({ error: "សញ្ញាសម្គាល់ការចូលមិនត្រឹមត្រូវឡើយ!" });
  }
};

const requireAdmin = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: "សកម្មភាពនេះត្រូវបានរឹតត្បិត សម្រាប់តែអ្នកគ្រប់គ្រងប៉ុណ្ណោះ!" });
  }
  next();
};

app.post("/api/auth/register", authRateLimiter, validateBody(registerSchema), async (req, res) => {
  try {
    const { name, email, password, avatarUrl } = req.body;

    const emailLower = email.toLowerCase();
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(400).json({ error: "អ៊ីមែលនេះត្រូវបានប្រើប្រាស់រួចហើយ!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const isAdmin = emailLower === "admin@sabbayrean.com";

    const newUser = await User.create({
      name,
      email: emailLower,
      password: hashedPassword,
      avatarUrl: avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      isAdmin,
    });

    const accessToken = generateAccessToken(newUser._id.toString(), newUser.isAdmin);
    const refreshToken = generateRefreshToken(newUser._id.toString(), newUser.isAdmin);

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      avatarUrl: newUser.avatarUrl,
      isAdmin: newUser.isAdmin,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "មានបញ្ហាពេលចុះឈ្មោះគណនីថ្មី!" });
  }
});

app.post("/api/auth/login", authRateLimiter, validateBody(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailInput = email.toLowerCase();
    
    const user = await User.findOne({ email: emailInput });
    if (!user) {
      return res.status(401).json({ error: "រកមិនឃើញគណនី ឬលេខសម្ងាត់មិនត្រឹមត្រូវ!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "លេខសម្ងាត់មិនត្រឹមត្រូវ!" });
    }

    const accessToken = generateAccessToken(user._id.toString(), user.isAdmin);
    const refreshToken = generateRefreshToken(user._id.toString(), user.isAdmin);

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      isAdmin: user.isAdmin,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: "មានបញ្ហាបច្ចេកទេសក្នុងដំណើរការចូលប្រព័ន្ធ!" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.json({ success: true, message: "បានចាកចេញពីប្រព័ន្ធដោយជោគជ័យ!" });
});

app.get("/api/auth/me", authenticateUser, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "មិនទាន់ចូលប្រព័ន្ធ" });
    }
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "រកមិនឃើញគណនីអ្នកប្រើប្រាស់" });
    }
    res.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    res.status(500).json({ error: "មានបញ្ហាបច្ចេកទេស" });
  }
});

// API Routes - Categories Management
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await CategoryModel.find().sort({ createdAt: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "មិនអាចទាញយកប្រភេទបានទេ" });
  }
});

app.post("/api/categories", authenticateUser, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id, label, labelEn, color } = req.body;
    if (!id || !label || !labelEn || !color) {
      return res.status(400).json({ error: "ព័ត៌មានមិនគ្រប់គ្រាន់" });
    }
    const exists = await CategoryModel.findOne({ id });
    if (exists) {
      return res.status(400).json({ error: "ប្រភេទនេះមានរួចហើយ" });
    }
    const newCat = new CategoryModel({ id, label, labelEn, color });
    await newCat.save();
    res.status(201).json(newCat);
  } catch (error) {
    res.status(500).json({ error: "មិនអាចបង្កើតប្រភេទបានទេ" });
  }
});

app.put("/api/categories/:id", authenticateUser, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { label, labelEn, color } = req.body;
    const cat = await CategoryModel.findOne({ id });
    if (!cat) {
      return res.status(404).json({ error: "រកមិនឃើញប្រភេទឡើយ" });
    }
    if (label) cat.label = label;
    if (labelEn) cat.labelEn = labelEn;
    if (color) cat.color = color;
    await cat.save();
    res.json(cat);
  } catch (error) {
    res.status(500).json({ error: "មិនអាចកែសម្រួលប្រភេទបានទេ" });
  }
});

app.delete("/api/categories/:id", authenticateUser, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const cat = await CategoryModel.findOne({ id });
    if (!cat) {
      return res.status(404).json({ error: "រកមិនឃើញប្រភេទឡើយ" });
    }
    await CategoryModel.deleteOne({ id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "មិនអាចលុបប្រភេទបានទេ" });
  }
});

// API Routes - Courses Management
app.get("/api/courses", async (req, res) => {
  try {
    const courses = await CourseModel.find().sort({ createdAt: 1 });
    res.json(courses);
  } catch (error) {
    console.error("Error fetching courses from MongoDB:", error);
    res.status(500).json({ error: "មិនអាចទាញយកទិន្នន័យវគ្គសិក្សាបានទេ!" });
  }
});

app.post("/api/courses", authenticateUser, requireAdmin, validateBody(courseZodSchema), async (req, res) => {
  try {
    const courseData = req.body;
    if (!courseData.id) {
      courseData.id = `course-${Date.now()}`;
    }
    
    if (courseData.lessons) {
      courseData.lessons = courseData.lessons.map((lesson: any, index: number) => ({
        ...lesson,
        id: lesson.id || `lesson-${Date.now()}-${index}`,
        courseId: courseData.id,
      }));
    }

    const newCourse = await CourseModel.create(courseData);
    res.status(201).json(newCourse);
  } catch (error: any) {
    console.error("Error creating course in MongoDB:", error);
    res.status(500).json({ error: error.message || "មិនអាចបង្កើតវគ្គសិក្សាថ្មីបានទេ!" });
  }
});

app.put("/api/courses/:id", authenticateUser, requireAdmin, validateBody(courseZodSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const courseData = req.body;
    
    const updatedCourse = await CourseModel.findOneAndUpdate(
      { id },
      { $set: courseData },
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ error: "រកមិនឃើញវគ្គសិក្សាដើម្បីធ្វើបច្ចុប្បន្នភាព!" });
    }

    res.json(updatedCourse);
  } catch (error: any) {
    console.error("Error updating course in MongoDB:", error);
    res.status(500).json({ error: error.message || "មិនអាចធ្វើបច្ចុប្បន្នភាពវាក្យស័ព្ទសិក្សាបានទេ!" });
  }
});

app.delete("/api/courses/:id", authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCourse = await CourseModel.findOneAndDelete({ id });

    if (!deletedCourse) {
      return res.status(404).json({ error: "រកមិនឃើញវគ្គសិក្សាដើម្បីលុប!" });
    }

    res.json({ message: "បានលុបវគ្គសិក្សាដោយជោគជ័យ!", id });
  } catch (error) {
    console.error("Error deleting course from MongoDB:", error);
    res.status(500).json({ error: "មិនអាចលុបវគ្គសិក្សានេះបានទេ!" });
  }
});

// API Routes - User Progress & Favorites Sync
app.get("/api/users/:userId/sync", authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: "សូមចូលប្រព័ន្ធ!" });
    }

    // Verify authorized user
    if (req.user.userId !== userId && !req.user.isAdmin) {
      return res.status(403).json({ error: "សកម្មភាពត្រូវបានបដិសេធ!" });
    }
    
    // Guard in case it's a temp/mock format from oauth login
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.json({ favorites: [], progressList: [] });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "រកមិនឃើញគណនីអ្នកប្រើប្រាស់!" });
    }
    res.json({
      favorites: user.favorites || [],
      progressList: user.progressList || []
    });
  } catch (error) {
    console.error("Error syncing user data:", error);
    res.status(500).json({ error: "មានបញ្ហាក្នុងការទាញយកទិន្នន័យគណនី!" });
  }
});

app.post("/api/users/:userId/sync", authenticateUser, validateBody(syncSchema), async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;
    const { favorites, progressList } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: "សូមចូលប្រព័ន្ធ!" });
    }

    // Verify authorized user
    if (req.user.userId !== userId && !req.user.isAdmin) {
      return res.status(403).json({ error: "សកម្មភាពត្រូវបានបដិសេធ!" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.json({ success: true });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "រកមិនឃើញគណនីអ្នកប្រើប្រាស់!" });
    }

    if (favorites) user.favorites = favorites;
    if (progressList) user.progressList = progressList;

    await user.save();
    res.json({
      success: true,
      favorites: user.favorites,
      progressList: user.progressList
    });
  } catch (error) {
    console.error("Error updating user sync data:", error);
    res.status(500).json({ error: "មានបញ្ហាក្នុងការរក្សាទុកទិន្នន័យគណនី!" });
  }
});

// API Routes - Announcements
app.get("/api/announcements", async (req, res) => {
  try {
    const anns = await AnnouncementModel.find().sort({ createdAt: -1 });
    res.json(anns);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ error: "មិនអាចទាញយកសេចក្តីប្រកាសបានទេ" });
  }
});

app.post("/api/announcements", authenticateUser, requireAdmin, validateBody(announcementZodSchema), async (req, res) => {
  try {
    const annData = req.body;
    if (!annData.id) {
      annData.id = `ann-${Date.now()}`;
    }
    if (!annData.date) {
      annData.date = new Date().toISOString().split("T")[0];
    }
    const newAnn = await AnnouncementModel.create(annData);
    res.status(201).json(newAnn);
  } catch (error: any) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ error: error.message || "មិនអាចបង្កើតសេចក្តីប្រកាសបានទេ" });
  }
});

app.delete("/api/announcements/:id", authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await AnnouncementModel.findOneAndDelete({ id }) || await AnnouncementModel.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "រកមិនឃើញសេចក្តីប្រកាសដើម្បីលុប" });
    }
    res.json({ message: "បានលុបសេចក្តីប្រកាសដោយជោគជ័យ!", id });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    res.status(500).json({ error: "មិនអាចលុបសេចក្តីប្រកាសនេះបានទេ" });
  }
});

// API Routes - Comments
app.get("/api/comments", authenticateUser, requireAdmin, async (req, res) => {
  try {
    const comments = await CommentModel.find().sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "មិនអាចទាញយកមតិយោបល់បានទេ" });
  }
});

app.get("/api/comments/course/:courseId/lesson/:lessonId", async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const comments = await CommentModel.find({ courseId, lessonId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    console.error("Error fetching lesson comments:", error);
    res.status(500).json({ error: "មិនអាចទាញយកមតិយោបល់បានទេ" });
  }
});

app.post("/api/comments", authenticateUser, validateBody(commentZodSchema), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "សូមចូលប្រព័ន្ធដើម្បីផ្ដើមតិ!" });
    }
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "រកមិនឃើញគណនីអ្នកប្រើប្រាស់" });
    }
    const commentData = req.body;
    const newComment = await CommentModel.create({
      id: `comment-${Date.now()}`,
      courseId: commentData.courseId,
      lessonId: commentData.lessonId,
      userId: user._id.toString(),
      userName: user.name,
      userAvatar: user.avatarUrl,
      content: commentData.content,
    });
    res.status(201).json(newComment);
  } catch (error: any) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: error.message || "មិនអាចផ្ញើមតិយោបល់បានទេ" });
  }
});

app.delete("/api/comments/:id", authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    if (!req.user) {
      return res.status(401).json({ error: "សូមចូលប្រព័ន្ធ" });
    }
    const comment = await CommentModel.findOne({ id }) || await CommentModel.findById(id);
    if (!comment) {
      return res.status(404).json({ error: "រកមិនឃើញមតិយោបល់" });
    }

    if (comment.userId !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ error: "សកម្មភាពត្រូវបានបដិសេធ! អ្នកមិនមែនជាម្ចាស់មតិយោបល់នេះទេ។" });
    }

    await CommentModel.deleteOne({ _id: comment._id });
    res.json({ message: "បានលុបមតិយោបល់ដោយជោគជ័យ!", id });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "មិនអាចលុបមតិយោបល់នេះបានទេ" });
  }
});

// API Routes - Users (Admin Panel Support)
app.get("/api/users", authenticateUser, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users list:", error);
    res.status(500).json({ error: "មិនអាចទាញយកបញ្ជីអ្នកប្រើប្រាស់បានទេ" });
  }
});

app.put("/api/users/:id", authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isAdmin, name, email, avatarUrl } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: { isAdmin, name, email, avatarUrl } },
      { new: true, select: "-password" }
    );
    if (!updatedUser) {
      return res.status(404).json({ error: "រកមិនឃើញគណនីអ្នកប្រើប្រាស់" });
    }
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "មិនអាចធ្វើបច្ចុប្បន្នភាពគណនីបានទេ" });
  }
});

app.delete("/api/users/:id", authenticateUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ error: "រកមិនឃើញគណនីអ្នកប្រើប្រាស់ដើម្បីលុប" });
    }
    res.json({ message: "បានលុបគណនីអ្នកប្រើប្រាស់ដោយជោគជ័យ!", id });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "មិនអាចលុបគណនីអ្នកប្រើប្រាស់នេះបានទេ" });
  }
});

// Vite middleware setup
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupVite();
