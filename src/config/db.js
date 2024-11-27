const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected!');
        });

        mongoose.connection.on('error', (err) => {
            console.log('MongoDB connection error:', err);
        });

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = {connectDB};
