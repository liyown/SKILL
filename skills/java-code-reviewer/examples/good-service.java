package com.example.order;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Minimal "good" counterpart of {@code bad-service.java}.
 *
 * Each fix is annotated with a tag that maps to the issue list in
 * {@code examples/review-output.md} so the reader can match bad → good 1:1.
 */
@Service
public class GoodOrderService {

    private final OrderMapper orderMapper;
    private final AccountMapper accountMapper;
    private final PaymentClient paymentClient;
    private final ApplicationContext context;

    public GoodOrderService(
        OrderMapper orderMapper,
        AccountMapper accountMapper,
        PaymentClient paymentClient,
        ApplicationContext context
    ) {
        this.orderMapper = orderMapper;
        this.accountMapper = accountMapper;
        this.paymentClient = paymentClient;
        this.context = context;
    }

    /**
     * Outer entry point. Carries the transaction boundary so the inner
     * self-invocation problem in bad-service.java#pay → doPay is gone: doPay
     * is now a separate Spring bean, reached through the proxy.
     *
     * Fixes:
     *   - ownership: query by (orderId, userId) instead of orderId alone
     *   - status race: conditional UPDATE on old status instead of read-then-write
     *   - NPE: explicit Optional + 业务 error on null
     */
    public void pay(Long userId, Long orderId) {
        // Fix 1 (self-invocation): resolve the executor bean via the context
        // so the call is routed through Spring's proxy, not through `this`.
        GoodPayExecutor executor = context.getBean(GoodPayExecutor.class);
        executor.execute(userId, orderId);
    }

    @Service
    public static class GoodPayExecutor {
        private final OrderMapper orderMapper;
        private final AccountMapper accountMapper;
        private final PaymentClient paymentClient;

        public GoodPayExecutor(
            OrderMapper orderMapper,
            AccountMapper accountMapper,
            PaymentClient paymentClient
        ) {
            this.orderMapper = orderMapper;
            this.accountMapper = accountMapper;
            this.paymentClient = paymentClient;
        }

        @Transactional(rollbackFor = Exception.class)
        public void execute(Long userId, Long orderId) {
            // Fix 2 (ownership + NPE): query by (orderId, userId) so the
            // missing order path cannot return another user's row; the
            // null check converts it into a 业务 error rather than NPE.
            Order order = orderMapper.selectByIdAndUserId(orderId, userId);
            if (order == null) {
                throw new BizException("订单不存在或不属于当前用户");
            }
            // Fix 3 (idempotency): the paid-state short-circuit must precede
            // any side effect so a redelivery is a no-op.
            if ("PAID".equals(order.getStatus())) {
                return;
            }

            // Fix 4 (status race): conditional UPDATE on old status closes
            // the read-then-write window. affected rows must be 1.
            int updated = orderMapper.markPaying(orderId, userId, "UNPAID", "PAYING");
            if (updated != 1) {
                return;
            }

            // Fix 5 (NPE on account): explicit null check on account + token
            // so a deleted account surfaces as 业务 error, not NPE.
            Account account = accountMapper.selectByUserId(userId);
            if (account == null || account.getPayToken() == null) {
                throw new BizException("账户或支付凭证缺失");
            }
            paymentClient.charge(account.getPayToken(), order.getAmount());
            orderMapper.markPaid(orderId, "PAYING");
        }
    }

    /**
     * Fix 6 (SQL injection): the sort column is resolved through a fixed
     * whitelist before being passed to the wrapper; {@code last("..." + sort)}
     * is never used so the SQL text never contains user input.
     */
    private static final Map<String, String> SORT_COLUMNS = Map.of(
        "createdTime", "created_time",
        "amount", "amount"
    );

    public IPage<Order> search(String status, String sort, int page, int size) {
        QueryWrapper<Order> wrapper = new QueryWrapper<>();
        if (status != null && !status.isEmpty()) {
            wrapper.eq("status", status);
        }
        String column = SORT_COLUMNS.getOrDefault(sort, "created_time");
        wrapper.orderByDesc(column);
        return orderMapper.selectPage(new Page<>(page, size), wrapper);
    }

    /**
     * Fix 7 (N+1): the loop is replaced by a single IN(...) select +
     * one batch UPDATE; the number of database roundtrips is constant
     * regardless of {@code orderIds.size()}.
     */
    public int batchCancel(List<Long> orderIds) {
        if (orderIds == null || orderIds.isEmpty()) {
            return 0;
        }
        List<Order> orders = orderMapper.selectBatchIds(orderIds);
        if (orders.isEmpty()) {
            return 0;
        }
        return orderMapper.markCanceledByIds(
            orders.stream().map(Order::getId).toList(),
            "UNPAID"
        );
    }

    private static class BizException extends RuntimeException {
        BizException(String message) { super(message); }
    }

    // The following inner types exist so this single file is self-contained.
    // In a real codebase they would be top-level domain types.

    static class Order {
        Long getId() { return null; }
        String getStatus() { return null; }
    }

    static class Account {
        String getPayToken() { return null; }
    }

    interface OrderMapper {
        Order selectByIdAndUserId(Long orderId, Long userId);
        int markPaying(Long orderId, Long userId, String fromStatus, String toStatus);
        int markPaid(Long orderId, String fromStatus);
        List<Order> selectBatchIds(List<Long> ids);
        int markCanceledByIds(List<Long> ids, String fromStatus);
        <E> IPage<E> selectPage(Page<E> page, QueryWrapper<E> wrapper);
        <E> List<E> selectList(QueryWrapper<E> wrapper);
    }

    interface AccountMapper {
        Account selectByUserId(Long userId);
    }

    interface PaymentClient {
        void charge(String payToken, java.math.BigDecimal amount);
    }
}
