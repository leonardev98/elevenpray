package middleware

import (
	"crypto/subtle"
	"encoding/json"
	"net/http"
)

const internalTokenHeader = "X-Internal-Token"

// InternalToken returns a middleware that rejects requests missing or carrying
// an invalid X-Internal-Token header. Comparison is constant-time.
func InternalToken(expected string) func(http.Handler) http.Handler {
	expectedBytes := []byte(expected)
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			provided := r.Header.Get(internalTokenHeader)
			if provided == "" || subtle.ConstantTimeCompare([]byte(provided), expectedBytes) != 1 {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				_ = json.NewEncoder(w).Encode(map[string]string{"error": "unauthorized"})
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
