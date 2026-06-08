package errwrap

import (
	"database/sql"
	"errors"
	"fmt"
)

func findOrder(id int64) error {
	_, err := query(id)
	if err != nil {
		return fmt.Errorf("find order %d: %v", id, err)
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
