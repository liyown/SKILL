package com.example.review;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Good counterpart of {@code duplicate-payment-consumer.java}.
 */
@Component
public class GoodDuplicatePaymentConsumer {

    private final ShipmentMapper shipmentMapper;

    public GoodDuplicatePaymentConsumer(ShipmentMapper shipmentMapper) {
        this.shipmentMapper = shipmentMapper;
    }

    @KafkaListener(topics = "order-paid")
    @Transactional
    public void onMessage(OrderPaidEvent event) {
        try {
            Shipment shipment = new Shipment();
            shipment.setOrderId(event.orderId());
            shipment.setAddress(event.address());
            // Fix 1 (idempotency): de-duplicate on the unique shipment
            // key (orderId). The bad version's plain `insert` would
            // create a duplicate shipment on every Kafka re-delivery
            // or consumer rebalance.
            shipmentMapper.insertIgnoreDuplicate(shipment);
        } catch (DuplicateKeyException e) {
            // Fix 2 (idempotent handling): treat a duplicate-key error
            // as success so the message is acked and not retried. The
            // database unique index is the last line of defence if the
            // mapper does not implement ON CONFLICT IGNORE itself.
        }
    }

    interface OrderPaidEvent { Long orderId(); String address(); }
    static class Shipment { Long getOrderId() { return null; } void setOrderId(Long id) {} String getAddress() { return null; } void setAddress(String a) {} }
    interface ShipmentMapper { void insertIgnoreDuplicate(Shipment s); }
}
