package example

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"sync"
	"time"

	"golang.org/x/sync/errgroup"
)

// Minimal "good" counterpart of bad-service.go.
//
// Each fix is annotated with a tag that maps to the issue list in
// examples/review-output.md so bad → good is traceable 1:1.

type Order struct {
	ID     int64
	UserID int64
	Amount int64
	Status string
}

type GoodOrderService struct {
	db        *sql.DB
	payClient *http.Client
	logger    *slog.Logger
}

func NewGoodOrderService(db *sql.DB, logger *slog.Logger) *GoodOrderService {
	// Fix 1 (HTTP timeout): explicit Client.Timeout so a slow downstream
	// cannot hang the request indefinitely; without it a stuck downstream
	// burns a worker until the kernel-level read deadline kicks in.
	return &GoodOrderService{
		db: db,
		payClient: &http.Client{
			Timeout: 5 * time.Second,
		},
		logger: logger,
	}
}

func (s *GoodOrderService) Pay(ctx context.Context, userID, orderID int64) error {
	// Fix 2 (ownership + parameterised SQL): WHERE id = ? AND user_id = ?
	// closes the IDOR; ? binding removes Sprintf injection surface.
	row := s.db.QueryRowContext(
		ctx,
		"SELECT id, user_id, amount, status FROM orders WHERE id = ? AND user_id = ?",
		orderID, userID,
	)
	var o Order
	// Fix 3 (error wrapping): %w preserves sql.ErrNoRows for upstream
	// errors.Is checks; per-call sites return distinct sentinels.
	if err := row.Scan(&o.ID, &o.UserID, &o.Amount, &o.Status); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return fmt.Errorf("order %d not found for user %d: %w", orderID, userID, ErrOrderNotFound)
		}
		return fmt.Errorf("load order %d: %w", orderID, err)
	}
	// Fix 4 (idempotency): the paid-state short-circuit must precede
	// any side effect so a redelivery is a no-op.
	if o.Status == "PAID" {
		return nil
	}

	// Fix 5 (status race): conditional UPDATE on old status closes the
	// read-then-write window. RowsAffected must be 1 to proceed.
	res, err := s.db.ExecContext(
		ctx,
		"UPDATE orders SET status = 'PAYING' WHERE id = ? AND user_id = ? AND status = 'UNPAID'",
		orderID, userID,
	)
	if err != nil {
		return fmt.Errorf("reserve paying: %w", err)
	}
	if n, _ := res.RowsAffected(); n != 1 {
		return ErrConcurrentUpdate
	}

	// Fix 6 (request context): the outbound request inherits ctx so a
	// client disconnect / deadline cancels the upstream call.
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, payURL, nil)
	if err != nil {
		return fmt.Errorf("build pay request: %w", err)
	}
	resp, err := s.payClient.Do(req)
	if err != nil {
		// Fix 7 (no log.Fatal in request path): structured log with
		// per-request fields, return the error for the caller to decide.
		s.logger.Error("pay charge failed",
			slog.Int64("order_id", orderID),
			slog.Int64("user_id", userID),
			slog.String("err", err.Error()),
		)
		return fmt.Errorf("charge: %w", err)
	}
	defer resp.Body.Close()
	// Fix 8 (5xx propagation): distinguish upstream transient errors so
	// the caller can decide retry vs fail.
	if resp.StatusCode >= 500 {
		return fmt.Errorf("charge upstream %d", resp.StatusCode)
	}
	return nil
}

// Fix 9 (goroutine lifecycle): errgroup cancels remaining workers on
// first error; jobs channel closure lets workers exit deterministically;
// g.Wait() blocks the caller until every worker is gone.
func (s *GoodOrderService) Dispatch(ctx context.Context, jobs <-chan int64) {
	const workers = 5
	g, gctx := errgroup.WithContext(ctx)
	for i := 0; i < workers; i++ {
		g.Go(func() error {
			for j := range jobs {
				if err := handleMessage(gctx, j); err != nil {
					return err
				}
			}
			return nil
		})
	}
	_ = g.Wait()
}

// Fix 10 (shared map race): RWMutex around the map; reads use RLock so
// concurrent Get calls don't serialise on each other.
type cache struct {
	mu sync.RWMutex
	m  map[int64]Order
}

func newCache() *cache { return &cache{m: map[int64]Order{}} }

func (c *cache) Get(id int64) (Order, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	o, ok := c.m[id]
	return o, ok
}

func (c *cache) Put(o Order) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.m[o.ID] = o
}

// Fix 11 (lock value-copy): pointer receiver so the mutex is shared with
// the caller; the bad version's value receiver copied `mu` and broke
// synchronisation.
type Counter struct {
	mu sync.Mutex
	n  int64
}

func (c *Counter) Inc() {
	c.mu.Lock()
	c.n++
	c.mu.Unlock()
}

var (
	ErrOrderNotFound   = errors.New("order not found")
	ErrConcurrentUpdate = errors.New("concurrent update lost")
	payURL              = "http://pay.local/charge"
)

func handleMessage(ctx context.Context, m int64) error { return nil }
