import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import express from 'express';

const router = express.Router();

const swaggerDocument = YAML.load('./docs/swagger.yaml');

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default router;
