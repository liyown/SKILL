package nplusone

import "database/sql"

type Order struct{ ID int64 }

func ListOrders(db *sql.DB, ids []int64) ([]Order, error) {
	out := make([]Order, 0, len(ids))
	for _, id := range ids {
		var o Order
		if err := db.QueryRow("SELECT id FROM orders WHERE id = ?", id).Scan(&o.ID); err != nil {
			return nil, err
		}
		out = append(out, o)
	}
	return out, nil
}
