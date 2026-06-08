package nplusone

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
)

// Good counterpart of n-plus-one.go.

func ListOrders(ctx context.Context, db *sql.DB, ids []int64) ([]Order, error) {
	if len(ids) == 0 {
		return nil, nil
	}

	// Fix 1 (IN query): one database roundtrip instead of N. The
	// placeholders are built from the id count, not user input.
	placeholders := strings.Repeat("?,", len(ids))
	placeholders = placeholders[:len(placeholders)-1]
	args := make([]any, len(ids))
	for i, id := range ids {
		args[i] = id
	}

	// Fix 2 (bound parameters): no Sprintf into the SQL text. The
	// IN-list is parameterised so the only way to inject is to change
	// the placeholder count, which is bound to len(ids).
	query := "SELECT id FROM orders WHERE id IN (" + placeholders + ")"
	rows, err := db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("batch load orders: %w", err)
	}
	// Fix 3 (rows.Close): streaming iteration with explicit close; the
	// returned slice is bounded by len(ids), not by an unbounded
	// server-side scan.
	defer rows.Close()

	out := make([]Order, 0, len(ids))
	for rows.Next() {
		var o Order
		if err := rows.Scan(&o.ID); err != nil {
			return nil, fmt.Errorf("scan order row: %w", err)
		}
		out = append(out, o)
	}
	// Fix 4 (rows.Err): check the iteration's terminal error so a
	// mid-loop network failure is not silently dropped.
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate order rows: %w", err)
	}
	return out, nil
}

type Order struct{ ID int64 }
