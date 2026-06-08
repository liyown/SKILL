package leak

import (
	"context"
	"errors"

	"golang.org/x/sync/errgroup"
)

// Good counterpart of goroutine-leak.go.

var errJob = errors.New("job failed")

func SpawnWorkers(ctx context.Context, jobs <-chan int) error {
	const workers = 5

	// Fix 1 (errgroup): workers run inside errgroup so the first error
	// cancels the rest via gctx; returning the error surfaces failures
	// instead of swallowing them.
	g, gctx := errgroup.WithContext(ctx)
	for i := 0; i < workers; i++ {
		g.Go(func() error {
			// Fix 2 (range over jobs): the loop exits when the producer
			// closes the jobs channel; this is the canonical signal
			// that there is no more work.
			for j := range jobs {
				// Fix 3 (gctx, not ctx): use the errgroup-derived
				// context so cancellation propagates from any
				// sibling worker.
				if err := process(gctx, j); err != nil {
					return err
				}
			}
			return nil
		})
	}

	// Fix 4 (g.Wait): block until every worker exits so the caller
	// never returns while goroutines are still running. Without this
	// the function returns immediately and the workers outlive the
	// call site, leaking memory.
	if err := g.Wait(); err != nil {
		return err
	}
	return nil
}

func process(ctx context.Context, j int) error {
	_ = ctx
	if j < 0 {
		return errJob
	}
	return nil
}
