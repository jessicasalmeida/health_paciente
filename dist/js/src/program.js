"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_json_1 = __importDefault(require("../public/swagger.json"));
const server_1 = __importDefault(require("./server"));
const routers_1 = require("./external/api/routers");
const db_connect_1 = require("./external/data-sources/mongodb/db-connect");
const port = 3000;
(0, db_connect_1.connectToDataBase)()
    .then(() => {
    server_1.default.use('/', routers_1.routes);
    server_1.default.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_json_1.default));
    server_1.default.listen(port, () => {
        console.log(`Server is listening on port: ${port}`);
    });
})
    .catch((error) => {
    console.error("Database connection failed", error);
    process.exit();
});
