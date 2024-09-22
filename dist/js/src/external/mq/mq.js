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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQ = void 0;
// src/infrastructure/RabbitMQ.ts
const amqplib_1 = __importDefault(require("amqplib"));
const dotenv = __importStar(require("dotenv"));
class RabbitMQ {
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            dotenv.config();
            this.connection = yield amqplib_1.default.connect(process.env.MQ_CONN_STRING);
            this.channel = yield this.connection.createChannel();
        });
    }
    publish(queue, message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.channel.assertQueue(queue, { durable: true });
            this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
        });
    }
    publishReply(queue, message, correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { correlationId: correlationId });
        });
    }
    publishExclusive(queue, message) {
        return __awaiter(this, void 0, void 0, function* () {
            let resposta = "";
            const correlationId = generateCorrelationId();
            const replyQueue = yield this.channel.assertQueue('', { exclusive: true });
            const message_with = {
                message,
                replyTo: replyQueue.queue,
                correlationId,
            };
            this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message_with)), { correlationId, replyTo: replyQueue.queue });
            yield new Promise((resolve) => {
                this.channel.consume(replyQueue.queue, (msg) => {
                    if (msg.properties.correlationId === correlationId) {
                        this.channel.ack(msg);
                        resposta = JSON.parse(msg.content.toString());
                        resolve(JSON.parse(msg.content.toString()).inStock);
                    }
                });
            });
            return resposta;
        });
    }
    consume(queue, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.channel.assertQueue(queue, { durable: true });
            this.channel.consume(queue, (msg) => {
                if (msg !== null) {
                    const content = JSON.parse(msg.content.toString());
                    callback(content);
                    this.channel.ack(msg);
                }
            });
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.channel.close();
            yield this.connection.close();
        });
    }
}
exports.RabbitMQ = RabbitMQ;
function generateCorrelationId() {
    return Math.random().toString() + Math.random().toString();
}
