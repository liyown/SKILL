package errwrap

import (
	"database/sql"
	"errors"
	"fmt"
)

// Good counterpart of error-wrap.go.

func findOrder(id int64) error {
	_, err := query(id)
	if err != nil {
		// Fix 1 (%w vs %v): use %w so the error chain preserves the
		// sentinel for errors.Is / errors.As. The upstream handler
		// now correctly distinguishes sql.ErrNoRows from other
		// failures instead of always seeing a stringly-typed error.
		return fmt.Errorf("find order %d: %w", id, err)
	}
	return nil
}

func query(id int64) (*struct{}, error) { return nil, sql.ErrNoRows }

func handler(id int64) error {
	err := findOrder(id)
	if errors.Is(err, sql.ErrNoRows) {
		return nil
	}
	return err
}
