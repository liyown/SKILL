package ctxtimeout

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"
)

// Good counterpart of context-deadline.go.

type Repo struct{ db *sql.DB }

func (r *Repo) GetOrder(ctx context.Context, id int64) error {
	// Fix 1 (context.Background override): derive a child context from the
	// request ctx instead of replacing it. Cancellation from the caller now
	// propagates into QueryContext.
	ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
	// Fix 2 (context leak): defer cancel so the parent context chain is
	// released even if the caller already gave up. Without this the
	// timer keeps the parent context alive until the deadline.
	defer cancel()

	row := r.db.QueryRowContext(ctx, "SELECT id FROM orders WHERE id = ?", id)
	var got int64
	if err := row.Scan(&got); err != nil {
		// Fix 3 (error wrapping): %w preserves sql.ErrNoRows so upstream
		// errors.Is checks distinguish not-found from other failures.
		if errors.Is(err, sql.ErrNoRows) {
			return fmt.Errorf("order %d not found: %w", id, err)
		}
		return fmt.Errorf("query order %d: %w", id, err)
	}
	return nil
}
