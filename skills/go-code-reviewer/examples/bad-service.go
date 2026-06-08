package example

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"
)

type Order struct {
	ID     int64
	UserID int64
	Amount int64
	Status string
}

type BadOrderService struct {
	db        *sql.DB
	payClient *http.Client
}

func (s *BadOrderService) Pay(ctx context.Context, userID, orderID int64) error {
	// 1) 同 goroutine 启协程处理消息，循环捕获变量
	msgs := make(chan int64, 100)
	for _, msg := range fetchPendingMessages() {
		msgs <- msg
	}
	for i := 0; i < 5; i++ {
		go func() {
			for m := range msgs {
				handleMessage(context.Background(), m) // 2) 丢掉请求 ctx
			}
		}()
	}

	// 3) 共享 map 无锁
	var cache = map[int64]Order{}

	// 4) 字符串拼接 SQL
	q := fmt.Sprintf("SELECT id, user_id, amount, status FROM orders WHERE id = %d", orderID)
	row := s.db.QueryRow(q)
	var o Order
	if err := row.Scan(&o.ID, &o.UserID, &o.Amount, &o.Status); err != nil {
		return err
	}

	// 5) 错误用 %v 包装，wrap 链断裂
	if o.Status == "PAID" {
		return fmt.Errorf("order paid: %v", sql.ErrNoRows)
	}

	// 6) HTTP 请求无超时
	req, _ := http.NewRequest("POST", payURL, nil)
	resp, err := s.payClient.Do(req)
	if err != nil {
		log.Fatal(err) // 7) 请求路径 log.Fatal
	}
	defer resp.Body.Close()

	// 8) 并发写共享 map
	cache[orderID] = o
	return nil
}

func fetchPendingMessages() []int64 { return nil }
func handleMessage(ctx context.Context, m int64) {}

var payURL = "http://pay.local/charge"

// 9) 锁复制
type Counter struct {
	mu sync.Mutex
	n  int64
}

func (c Counter) Inc() { // 值接收者复制了 mu
	c.mu.Lock()
	c.n++
	c.mu.Unlock()
}

var _ = time.Second
