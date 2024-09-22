import swaggerUi from "swagger-ui-express";
import swaggerOutput from "../public/swagger.json";
import app from "./server";
import { routes } from "./external/api/routers";
import { connectToDataBase } from "./external/data-sources/mongodb/db-connect";

const port = 3000;

connectToDataBase()
    .then(()=> {
        app.use('/', routes);
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerOutput));
        app.listen(port, () => {
            console.log(`Server is listening on port: ${port}`)
        });
    })
    
.catch((error: Error) => {
    console.error("Database connection failed", error);
    process.exit();
});