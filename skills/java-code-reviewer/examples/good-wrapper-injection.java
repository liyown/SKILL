package com.example.review;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import java.util.List;
import java.util.Map;

/**
 * Good counterpart of {@code wrapper-injection.java}.
 */
public class GoodWrapperInjectionExample {

    // Fix 1 (SQL injection): the column is resolved through a fixed
    // whitelist before being passed to the wrapper. `last("..." + sort)`
    // would concatenate raw user input into the SQL text.
    private static final Map<String, String> SORT_COLUMNS = Map.of(
        "createdTime", "created_time",
        "amount", "amount"
    );

    private final OrderMapper orderMapper;

    public GoodWrapperInjectionExample(OrderMapper orderMapper) {
        this.orderMapper = orderMapper;
    }

    public IPage<Order> search(String status, String sort, int page, int size) {
        QueryWrapper<Order> wrapper = new QueryWrapper<>();
        if (status != null && !status.isEmpty()) {
            wrapper.eq("status", status);
        }
        // Fix 2 (whitelist fallback): unknown sort values resolve to a
        // safe default column instead of erroring or echoing input.
        String column = SORT_COLUMNS.getOrDefault(sort, "created_time");
        // Fix 3 (parameterised column): the wrapper serialises the
        // column name through the normal ? binding path, so even if
        // the column string is a constant, no user input ever reaches
        // the SQL text.
        wrapper.orderByDesc(column);
        return orderMapper.selectPage(new Page<>(page, size), wrapper);
    }

    // Stand-in for the actual generated SQL.
    static class Order {}
    interface OrderMapper {
        <E> IPage<E> selectPage(Page<E> page, QueryWrapper<E> wrapper);
    }
}
