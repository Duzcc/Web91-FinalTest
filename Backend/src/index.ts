import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import * as dotenv from 'dotenv';
import teacherRoutes from './routes/teacher.route';
import positionRoutes from './routes/teacherPosition.route';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/school'; // Dùng giá trị mặc định nếu không tìm thấy
const PORT = process.env.PORT || 3001;

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Đăng ký các route
app.use('/api/teachers', teacherRoutes);
app.use('/api/teacher-positions', positionRoutes);

// Route mặc định (Health Check)
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ message: 'API Server is running!' });
});

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('[MongoDB] Đã kết nối thành công!');
    app.listen(PORT, () => {
      console.log(`[API Server] Server đang chạy tại http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('[MongoDB] Lỗi kết nối:', error);
    process.exit(1); 
  });