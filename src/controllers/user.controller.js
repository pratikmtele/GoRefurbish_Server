import User from "../models/user.model.js";
import Response from "../utils/Response.js";
import asyncHandler from "../utils/asyncHandler.js";

const signup = asyncHandler(async (req, res)=> {
    const { fullName, username, email, phone, password, role } = req.body;

    if ([fullName, username, email, phone, password].some(field => field.trim() === "")) 
        return res.status(400).json({ message: "All fields are required" });

    // Validate role if provided
    const validRoles = ["user", "admin", "superadmin", "employee"];
    if (role && !validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role specified" });
    }

    const isUserExisting = await User.findOne({ $or: [{ email }, { username }] }).select("_id");

    if (isUserExisting) 
        return res.status(400).json({ message: "User already exists" });
    

    try {
        // Create a new user instance
        const newUser = new User({
            fullName,
            username,
            email,
            phone,
            password,
            role: role || "user" // Default to "user" if no role specified
        });
        
        const savedUser = await newUser.save();

        const isSaved = await User.findById(savedUser._id).select("-password -__v");

        if (!isSaved) {
            return res.status(500).json({ message: "Error saving user" });
        }

        const response = new Response(200, "User created successfully", isSaved);
        return res.status(response.statusCode).json(response);
    } catch (error) {
        return res.status(500).json({ message: "Error creating user" });
    }
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if ([email, password].some(field => field.trim() === ""))
        return res.status(400).json({ message: "Email and password are required" });

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordCorrect = await user.comparePassword(password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = await user.generateAuthToken();

        const response = new Response(200, "Login successful", {
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

        return res.status(response.statusCode).cookie("authToken", token).json(response);
    } catch (error) {
        console.log(error);
        
        return res.status(500).json({ message: "Error logging in" });
    }
});


export {signup, login};