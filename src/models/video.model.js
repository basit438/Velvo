import mongoose, { Schema } from "mongoose";

const videoSchema = new Schema({
    videoFile: {
        type: String, // store cloudinary url
        required: true
    },
    thumbnail: {
        type: String, // store cloudinary url
        required: true
    },

    title: {
        type: String, 
        required: true,
         trim: true,
    },
    description: {
        type: String, 
        required: true,   
    },

    duration: {
        type: Number,  // from cloudinary metadata
        required: true,
    }

},
{
    timestamps: true
}
);

export const Video = mongoose.model("Video", videoSchema);