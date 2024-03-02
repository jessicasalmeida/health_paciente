import swaggerAutogen from 'swagger-autogen';

const doc = {
    info: {
        version: 'v1.0.0',
        title: 'Swagger Restaurante Project',
        description: 'Pos Tech FIAP'
    },
    servers: [
        {
            url: 'http://localhost:8000',
            description: ''
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
            }
        }
    }
};

const outputFile = '../../../public/swagger.json';
const endpointsFiles = ['./src/presentation/routers/index.ts'];

swaggerAutogen({openapi: '3.0.0'})(outputFile, endpointsFiles, doc);