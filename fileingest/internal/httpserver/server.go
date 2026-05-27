// Package httpserver wires routes, middleware and handlers into a chi router.
package httpserver

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/elevenpray/fileingest/internal/httpserver/handlers"
	mw "github.com/elevenpray/fileingest/internal/httpserver/middleware"
)

// Deps groups handler dependencies so server wiring stays focused.
type Deps struct {
	Logger           *slog.Logger
	InternalAPIToken string

	Health    *handlers.HealthHandler
	Ingest    *handlers.IngestHandler
	Documents *handlers.DocumentsHandler
	Query     *handlers.QueryHandler
	Chat      *handlers.ChatHandler
}

// New builds an *http.Server bound to addr with all routes mounted.
func New(addr string, d Deps) *http.Server {
	r := chi.NewRouter()

	// Public (no auth) health endpoint plus shared middlewares for everything.
	r.Use(mw.Recoverer(d.Logger))
	r.Use(mw.Logger(d.Logger))

	r.Method(http.MethodGet, "/healthz", d.Health)

	// Authenticated /v1 group.
	r.Route("/v1", func(r chi.Router) {
		r.Use(mw.InternalToken(d.InternalAPIToken))
		r.Method(http.MethodPost, "/ingest", d.Ingest)
		r.Get("/documents/{id}/status", d.Documents.Status)
		r.Method(http.MethodPost, "/query", d.Query)
		r.Method(http.MethodPost, "/chat", d.Chat)
	})

	return &http.Server{
		Addr:              addr,
		Handler:           r,
		ReadHeaderTimeout: 10 * time.Second,
		WriteTimeout:      0, // SSE handlers manage their own deadlines
		IdleTimeout:       120 * time.Second,
	}
}
