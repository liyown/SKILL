package com.example.order;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class BadOrderService {
    private final OrderMapper orderMapper;
    private final AccountMapper accountMapper;
    private final PaymentClient paymentClient;

    public BadOrderService(OrderMapper orderMapper, AccountMapper accountMapper, PaymentClient paymentClient) {
        this.orderMapper = orderMapper;
        this.accountMapper = accountMapper;
        this.paymentClient = paymentClient;
    }

    public void pay(Long userId, Long orderId) {
        doPay(userId, orderId);
    }

    @Transactional
    public void doPay(Long userId, Long orderId) {
        Order order = orderMapper.selectById(orderId);
        if (order.getStatus().equals("PAID")) {
            return;
        }

        Account account = accountMapper.selectByUserId(userId);
        accountMapper.decrease(userId, order.getAmount());
        paymentClient.charge(account.getPayToken(), order.getAmount());

        order.setStatus("PAID");
        orderMapper.updateById(order);
    }

    public List<Order> search(String status, String sort) {
        QueryWrapper<Order> wrapper = new QueryWrapper<>();
        wrapper.eq("status", status);
        wrapper.last("order by " + sort);
        return orderMapper.selectList(wrapper);
    }

    public void batchCancel(List<Long> orderIds) {
        for (Long orderId : orderIds) {
            Order order = orderMapper.selectById(orderId);
            if (order.getAmount().compareTo(BigDecimal.ZERO) > 0) {
                order.setStatus("CANCELED");
                orderMapper.updateById(order);
            }
        }
    }
}
