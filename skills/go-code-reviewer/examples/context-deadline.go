package ctxtimeout

import (
	"context"
	"database/sql"
	"time"
)

type Repo struct{ db *sql.DB }

func (r *Repo) GetOrder(ctx context.Context, id int64) error {
	bg := context.Background()
	_, err := r.db.QueryContext(bg, "SELECT * FROM orders WHERE id = ?", id)
	_ = time.Second
	return err
}
