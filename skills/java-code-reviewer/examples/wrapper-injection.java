package com.example.review;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import java.util.List;

public class WrapperInjectionExample {
    private final OrderMapper orderMapper;

    public WrapperInjectionExample(OrderMapper orderMapper) {
        this.orderMapper = orderMapper;
    }

    public List<Order> search(String status, String sort) {
        QueryWrapper<Order> wrapper = new QueryWrapper<>();
        wrapper.eq("status", status);
        wrapper.last("order by " + sort);
        return orderMapper.selectList(wrapper);
    }
}
