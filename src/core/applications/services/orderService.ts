import {CartRepository} from "../ports/cartRepository";
import {Cart} from "../../domain/cart";
import {Order} from "../../domain/order";
import {OrderRepository} from "../ports/orderRepository";

export class OrderService {
    constructor(private readonly orderRepository: OrderRepository) { }

    async receiveOrder(idCart: string): Promise<Order> {
        return this.orderRepository.receiveOrder(idCart);
    }

    async prepareOrder(idOrder: string): Promise<Order> {
        return this.orderRepository.prepareOrder(idOrder);
    }

    async estimateDelivery(idOrder: string): Promise<string> {
        return this.orderRepository.estimateDelivery(idOrder);
    }

    async sendNotificationEstimatedTime(idOrder: string): Promise<string> {
        return this.orderRepository.sendNotificationEstimatedTime(idOrder);
    }

    async sendNotificationDelivery(idOrder: string): Promise<string> {
        return this.orderRepository.sendNotificationDelivery(idOrder);
    }

    async updateStatusToReady(idOrder: string): Promise<Order> {
        return this.orderRepository.updateStatusToReady(idOrder);
    }

    async updateStatusToDelivered(idOrder: string): Promise<Order> {
        return this.orderRepository.updateStatusToDelivered(idOrder);
    }

    async updateStatusToClosed(idOrder: string): Promise<Order> {
        return this.orderRepository.updateStatusToClosed(idOrder);
    }
    async getAllActiveOrders(): Promise<Order[]>
    {
        return this.orderRepository.getAllActiveOrders();
    }
}