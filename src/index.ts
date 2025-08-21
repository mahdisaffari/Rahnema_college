import express from 'express';
import { PORT } from './config/env';
import authRoutes from './routes/routes';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use('/', authRoutes);

app.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`));