import express from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

const swaggerFilePath = path.resolve('docs', 'swagger.json');
const swaggerDocument = JSON.parse(fs.readFileSync(swaggerFilePath, 'utf-8'));

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default router;
