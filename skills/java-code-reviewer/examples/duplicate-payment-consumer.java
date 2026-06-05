package com.example.review;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class DuplicatePaymentConsumer {
    private final ShipmentMapper shipmentMapper;

    public DuplicatePaymentConsumer(ShipmentMapper shipmentMapper) {
        this.shipmentMapper = shipmentMapper;
    }

    @KafkaListener(topics = "order-paid")
    public void onMessage(OrderPaidEvent event) {
        Shipment shipment = new Shipment();
        shipment.setOrderId(event.orderId());
        shipment.setAddress(event.address());
        shipmentMapper.insert(shipment);
    }
}
