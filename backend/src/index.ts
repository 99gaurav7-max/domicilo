import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import authRoutes from './routes/auth';
import propertyRoutes from './routes/properties';
import ownerRoutes from './routes/owner';
import tenantRoutes from './routes/tenant';
import adminRoutes from './routes/admin';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (_, res) => {
  res.json({ success: true, message: 'Domicilo API is running', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error.' });
});

app.listen(config.port, () => {
  console.log(`🏠 Domicilo API running on port ${config.port} in ${config.nodeEnv} mode`);
});

export default app;
