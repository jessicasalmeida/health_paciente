import * as dotenv from "dotenv";
import { ConflictError } from '../../common/errors/conflict-error';
import {
    CognitoIdentityProviderClient,
    AdminCreateUserCommand,
    AdminCreateUserCommandInput,
    AdminSetUserPasswordCommandInput,
    AdminSetUserPasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider';

dotenv.config();


export class Cognito {
    constructor() { }

    private REGION = process.env.AWS_REGION as string;
    private USER_POOL_ID = process.env.COGNITO_USER_POOL_ID as string;

    // Inicialize o cliente Cognito
    private cognitoClient = new CognitoIdentityProviderClient({
        region: this.REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            sessionToken: process.env.TOKEN!
        },
    });

    /**
     * Função para criar um novo usuário no Cognito
     * @param username - Nome de usuário
     * @param email - Email do usuário
     * @param temporaryPassword - Senha temporária
     */
    async createUser(username: string): Promise<string> {
        const params: AdminCreateUserCommandInput = {
            UserPoolId: this.USER_POOL_ID!,
            Username: username,
            MessageAction: 'SUPPRESS', // Supprime o e-mail de boas-vindas automático
        };

        try {
            const command = new AdminCreateUserCommand(params);
            const response = await this.cognitoClient.send(command);
            console.log('Usuário criado com sucesso:', response);
            if (response.User && response.User.Attributes) {
                // Encontre o atributo que você deseja, como o email, por exemplo
                const emailAttribute = response.User.Attributes.find(attr => attr.Name === 'email');
                if (emailAttribute) {
                    return emailAttribute.Value as string;
                }
            }
        } catch (error) {
            console.error('Erro ao criar usuário');
        }
        return "null";
    }
    
    async setUserPassword(username: string, password: string): Promise<void> {
        const params: AdminSetUserPasswordCommandInput = {
            UserPoolId: this.USER_POOL_ID!,
            Username: username,
            Password: password,
            Permanent: true, // Define como uma senha permanente (não temporária)
        };

        try {
            const command = new AdminSetUserPasswordCommand(params);
            const response = await this.cognitoClient.send(command);
            console.log('Senha fixa definida com sucesso:', response);
        } catch (ConflictError) {
            throw new Error('Erro ao definir senha');
        }
    }
}
