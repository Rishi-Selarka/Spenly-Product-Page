package whatsapp

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"spenly-whatsapp-backend/lib"

	"github.com/google/uuid"
)

// LinkTokenRequest represents the request body for link token generation
type LinkTokenRequest struct {
	AppleUserID string `json:"apple_user_id"`
}

// LinkTokenResponse represents the response for link token generation
type LinkTokenResponse struct {
	Token     string `json:"token"`
	ExpiresAt string `json:"expires_at"`
}

// LinkTokenHandler handles POST /api/whatsapp/link-token
func LinkTokenHandler(w http.ResponseWriter, r *http.Request) {
	// Only allow POST
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse request body
	var req LinkTokenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, fmt.Sprintf("Invalid request body: %v", err), http.StatusBadRequest)
		return
	}

	// Validate Apple User ID
	if req.AppleUserID == "" {
		http.Error(w, "apple_user_id is required", http.StatusBadRequest)
		return
	}

	// Generate unique token
	token := fmt.Sprintf("link_%s", uuid.New().String())

	// Set expiration (10 minutes from now)
	expiresAt := time.Now().Add(10 * time.Minute)

	// Store token in database
	ctx := context.Background()
	db := lib.GetDB()

	_, err := db.Exec(ctx, `
		INSERT INTO link_tokens (token, apple_user_id, expires_at, created_at)
		VALUES ($1, $2, $3, NOW())
	`, token, req.AppleUserID, expiresAt)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to create token: %v", err), http.StatusInternalServerError)
		return
	}

	// Return response
	response := LinkTokenResponse{
		Token:     token,
		ExpiresAt: expiresAt.Format(time.RFC3339),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// Handler is the Vercel serverless function entry point
func Handler(w http.ResponseWriter, r *http.Request) {
	// Initialize database if not already done
	if lib.GetDB() == nil {
		if err := lib.InitDB(); err != nil {
			http.Error(w, fmt.Sprintf("Database initialization failed: %v", err), http.StatusInternalServerError)
			return
		}
	}

	LinkTokenHandler(w, r)
}

