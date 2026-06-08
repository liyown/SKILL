package leak

import "context"

func SpawnWorkers(ctx context.Context, jobs <-chan int) {
	for i := 0; i < 5; i++ {
		go func() {
			for {
				select {
				case <-ctx.Done():
					return
				case j, ok := <-jobs:
					if !ok {
						return
					}
					_ = process(j)
				}
			}
		}()
	}
}

func process(j int) error { return nil }
