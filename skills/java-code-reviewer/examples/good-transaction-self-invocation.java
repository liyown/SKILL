package com.example.review;

import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Good counterpart of {@code transaction-self-invocation.java}.
 *
 * Alternative fixes (not shown):
 *   - inject the bean into itself via @Autowired (anti-pattern, fragile)
 *   - use TransactionTemplate programmatically
 *   - use AspectJ load-time weaving so the self-call is proxied
 */
@Service
public class GoodTransactionSelfInvocation {

    private final OrderMapper orderMapper;
    private final InventoryMapper inventoryMapper;
    private final ApplicationContext context;

    public GoodTransactionSelfInvocation(
        OrderMapper orderMapper,
        InventoryMapper inventoryMapper,
        ApplicationContext context
    ) {
        this.orderMapper = orderMapper;
        this.inventoryMapper = inventoryMapper;
        this.context = context;
    }

    public void create(OrderRequest request) {
        // Fix 1 (self-invocation): resolve the executor bean through the
        // context so the call is routed through Spring's proxy, not
        // through `this`. The bad version's `this.saveOrder()` skipped
        // the AOP proxy and silently dropped @Transactional.
        context.getBean(OrderTxExecutor.class).saveOrder(request);
    }

    @Service
    public static class OrderTxExecutor {
        private final OrderMapper orderMapper;
        private final InventoryMapper inventoryMapper;

        public OrderTxExecutor(OrderMapper orderMapper, InventoryMapper inventoryMapper) {
            this.orderMapper = orderMapper;
            this.inventoryMapper = inventoryMapper;
        }

        // Fix 2 (rollbackFor): rollback on every checked exception as
        // well as runtime exceptions; the default only rolls back on
        // runtime exceptions and unchecked Errors.
        @Transactional(rollbackFor = Exception.class)
        public void saveOrder(OrderRequest request) {
            orderMapper.insert(request.toOrder());
            inventoryMapper.decrease(request.productId(), request.quantity());
        }
    }

    interface OrderRequest {
        Object toOrder();
        Long productId();
        int quantity();
    }
    interface OrderMapper { void insert(Object o); }
    interface InventoryMapper { void decrease(Long productId, int qty); }
}
