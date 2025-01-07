import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

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
    },

    views: {
        type: Number, 
        required: true,
        default: 0
    },
    isPublished: {
        type: Boolean, 
        required: true,
        default: true
    },

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

},
{
    timestamps: true
}
);

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);