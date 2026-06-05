package com.example.review;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TransactionSelfInvocation {
    private final OrderMapper orderMapper;
    private final InventoryMapper inventoryMapper;

    public TransactionSelfInvocation(OrderMapper orderMapper, InventoryMapper inventoryMapper) {
        this.orderMapper = orderMapper;
        this.inventoryMapper = inventoryMapper;
    }

    public void create(OrderRequest request) {
        saveOrder(request);
    }

    @Transactional(rollbackFor = Exception.class)
    public void saveOrder(OrderRequest request) {
        orderMapper.insert(request.toOrder());
        inventoryMapper.decrease(request.productId(), request.quantity());
    }
}
