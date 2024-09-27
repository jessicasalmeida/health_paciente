"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cognito = void 0;
const dotenv = __importStar(require("dotenv"));
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
dotenv.config();
class Cognito {
    constructor() {
        this.REGION = process.env.AWS_REGION;
        this.USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
        // Inicialize o cliente Cognito
        this.cognitoClient = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({
            region: this.REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                sessionToken: process.env.TOKEN
            },
        });
    }
    /**
     * Função para criar um novo usuário no Cognito
     * @param username - Nome de usuário
     * @param email - Email do usuário
     * @param temporaryPassword - Senha temporária
     */
    createUser(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                UserPoolId: this.USER_POOL_ID,
                Username: username,
                MessageAction: 'SUPPRESS', // Supprime o e-mail de boas-vindas automático
            };
            try {
                const command = new client_cognito_identity_provider_1.AdminCreateUserCommand(params);
                const response = yield this.cognitoClient.send(command);
                console.log('Usuário criado com sucesso:', response);
                if (response.User && response.User.Attributes) {
                    // Encontre o atributo que você deseja, como o email, por exemplo
                    const emailAttribute = response.User.Attributes.find(attr => attr.Name === 'email');
                    if (emailAttribute) {
                        return emailAttribute.Value;
                    }
                }
            }
            catch (error) {
                console.error('Erro ao criar usuário');
            }
            return "null";
        });
    }
    setUserPassword(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                UserPoolId: this.USER_POOL_ID,
                Username: username,
                Password: password,
                Permanent: true, // Define como uma senha permanente (não temporária)
            };
            try {
                const command = new client_cognito_identity_provider_1.AdminSetUserPasswordCommand(params);
                const response = yield this.cognitoClient.send(command);
                console.log('Senha fixa definida com sucesso:', response);
            }
            catch (ConflictError) {
                throw new Error('Erro ao definir senha');
            }
        });
    }
}
exports.Cognito = Cognito;
