import { Request, Response } from "express";
import { Post } from "../models/Post";
import cloudinary from "../config/cloudinary";
import { AuthRequest } from "../middleware/auth";

export const savePost = async (req: AuthRequest, res: Response) => {
    try {
        const { title, content, tags } = req.body;

        if (!req.user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        let imageURL = "";

        if (req.file) {
            const result: any = await new Promise((resolve, reject) => {
                const upload_stream = cloudinary.uploader.upload_stream(
                    { folder: "posts" },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                upload_stream.end(req.file?.buffer);
            });

            imageURL = result.secure_url;
        }

        const newPost = new Post({
            title,
            content,
            tags: tags.split(","),
            imageURL,
            author: req.user.sub
        });

        await newPost.save();

        return res.status(201).json({
            message: "Post Created",
            data: newPost
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to save post" });
    }
};

export const getAllPost = async(req:Request, res:Response) =>{
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10

        const skip  = (page - 1) * limit
        const posts = await Post.find()
            .populate("author", "email")
            .sort({createdAt: -1})
            .skip(skip)
            .limit(limit)
        const total = await Post.countDocuments()

        res.status(200).json({
            message: "Posts data",
            data: posts,
            totalPages: Math.ceil(total/limit),
            totalCount: total,
            page
        })
    }catch(err){
        console.error(err)
        res.status(500).json({
            message: "Faild to fetch post"
        })
    }
}
export const getMyPost = async(req:Request, res:Response) =>{}