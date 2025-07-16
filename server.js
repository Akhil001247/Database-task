const express = require('express');
const mongoose = require('mongoose');
const app = express();
require('dotenv').config();


app.use(express.json());



mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  console.log('Current environment variables:', process.env);
  process.exit(1);
}

// Modern connection without deprecated options
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// Enhanced connection events
mongoose.connection.on('connected', () => {
  console.log(`🔗 Mongoose connected to: ${mongoose.connection.host}`);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});


const postSchema = new mongoose.Schema({
    title: String,
    content: String
});


const Post = mongoose.model('Post', postSchema);


app.get('/getPosts', async (req, res) => {
    try {
        const posts = await Post.find();
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


app.post('/addPosts', async (req, res) => {
    const post = new Post({
        title: req.body.title,
        content: req.body.content
    });

    try {
        const newPost = await post.save();
        res.status(201).json(newPost);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


app.delete('/delPosts/:id', async (req, res) => {
    try {
        const deletedPost = await Post.findByIdAndDelete(req.params.id);
        if (!deletedPost) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json({ message: 'Post deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


app.patch('/post/:id', async (req, res) => {
    try {
        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true } 
        );
        if (!updatedPost) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(updatedPost);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port is ${PORT}`);
});