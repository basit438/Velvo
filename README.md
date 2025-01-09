# Velvo

Velvo is a YouTube-inspired video streaming platform currently under development. Built using the MERN stack (MongoDB, Express.js, React.js, Node.js), it aims to replicate core YouTube features such as video uploads, playback, user authentication, and community engagement functionalities.

## Project Status

🚧 **Under Development**: This project is actively being built, and features are being added iteratively. Contributions and suggestions are welcome!

## Planned Features

- **User Authentication**: Secure login and registration functionality using JWT.
- **Video Management**: Upload videos with metadata like title, description, and tags.
- **Video Playback**: Smooth streaming with an embedded video player.
- **Engagement Tools**: Enable likes, dislikes, and comments on videos.
- **Search and Filter**: Search for videos and apply filters based on tags or categories.
- **Responsive Design**: Fully optimized for desktop and mobile devices.

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Authentication**: JSON Web Tokens (JWT)
- **File Storage**: AWS S3 or similar service for storing video files (planned)

## Installation

### Prerequisites

Ensure you have the following installed:

- Node.js (v14 or above)
- npm or yarn
- MongoDB (local or cloud instance)
- AWS S3 (optional, for future video uploads)

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/basit438/Velvo.git
   ```

2. Navigate to the project directory:
   ```bash
   cd Velvo
   ```

3. Install dependencies for both frontend and backend:
   ```bash
   cd client
   npm install
   cd ../server
   npm install
   ```

4. Configure environment variables:
   Create a `.env` file in the `server` directory and add placeholders for the following:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_BUCKET_NAME=your_s3_bucket_name
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd server
   npm start
   ```

2. Start the frontend development server:
   ```bash
   cd client
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`.

## Contribution

As the project is in its early stages, contributors are welcome to join and help build Velvo! To contribute:

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature description"
   ```
4. Push your branch and create a pull request:
   ```bash
   git push origin feature-name
   ```

## Roadmap

- [ ] User Authentication
- [ ] Video Upload and Playback
- [ ] Search and Filter Functionality
- [ ] Like, Dislike, and Comment System
- [ ] Responsive UI
- [ ] Deployment to Production

## Contact

For any queries or suggestions, feel free to reach out:

- **Author**: Basit Manzoor  
- **Email**: [basitmanzoor@example.com](mailto:basitmanzoor438@gmail.com)

---

Stay tuned for updates as Velvo progresses toward becoming a fully functional video platform! 🚀

