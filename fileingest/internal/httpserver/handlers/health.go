package handlers

import (
	"encoding/json"
	"net/http"
)

// HealthHandler reports liveness plus the active model deployments.
type HealthHandler struct {
	ChatDeployment  string
	EmbedDeployment string
}

func (h *HealthHandler) ServeHTTP(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]any{
		"status":            "ok",
		"chat_deployment":   h.ChatDeployment,
		"embed_deployment":  h.EmbedDeployment,
	})
}
