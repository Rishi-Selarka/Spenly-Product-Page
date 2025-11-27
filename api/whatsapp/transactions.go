package whatsapp

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"spenly-whatsapp-backend/lib"

	"github.com/jackc/pgx/v5"
)

// Transaction represents a pending transaction
type Transaction struct {
	ID          int     `json:"id"`
	Amount      float64 `json:"amount"`
	Date        string  `json:"date"`
	Vendor      string  `json:"vendor"`
	Category    string  `json:"category"`
	Note        string  `json:"note"`
	CreatedAt   string  `json:"created_at"`
}

// TransactionsResponse represents the response for fetching transactions
type TransactionsResponse struct {
	Transactions []Transaction `json:"transactions"`
	Count        int           `json:"count"`
}

// TransactionsHandler handles GET /api/whatsapp/transactions
func TransactionsHandler(w http.ResponseWriter, r *http.Request) {
	// Only allow GET
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Initialize database if not already done
	if lib.GetDB() == nil {
		if err := lib.InitDB(); err != nil {
			http.Error(w, fmt.Sprintf("Database initialization failed: %v", err), http.StatusInternalServerError)
			return
		}
	}

	// Get Apple User ID from query parameter or header
	appleUserID := r.URL.Query().Get("apple_user_id")
	if appleUserID == "" {
		// Try header as fallback
		appleUserID = r.Header.Get("X-Apple-User-ID")
	}

	if appleUserID == "" {
		http.Error(w, "apple_user_id is required", http.StatusBadRequest)
		return
	}

	// Fetch pending transactions
	ctx := context.Background()
	db := lib.GetDB()

	rows, err := db.Query(ctx, `
		SELECT id, amount, date, vendor, category, note, created_at
		FROM pending_transactions
		WHERE apple_user_id = $1 AND status = 'pending'
		ORDER BY created_at DESC
		LIMIT 50
	`, appleUserID)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to fetch transactions: %v", err), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var transactions []Transaction
	for rows.Next() {
		var txn Transaction
		var date, createdAt pgx.NullTime
		var vendor, category, note pgx.NullString

		err := rows.Scan(&txn.ID, &txn.Amount, &date, &vendor, &category, &note, &createdAt)
		if err != nil {
			fmt.Printf("Error scanning transaction: %v\n", err)
			continue
		}

		if date.Valid {
			txn.Date = date.Time.Format("2006-01-02")
		}
		if vendor.Valid {
			txn.Vendor = vendor.String
		}
		if category.Valid {
			txn.Category = category.String
		}
		if note.Valid {
			txn.Note = note.String
		}
		if createdAt.Valid {
			txn.CreatedAt = createdAt.Time.Format(time.RFC3339)
		}

		transactions = append(transactions, txn)
	}

	response := TransactionsResponse{
		Transactions: transactions,
		Count:        len(transactions),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// ConfirmTransactionHandler handles POST /api/whatsapp/transactions/:id/confirm
func ConfirmTransactionHandler(w http.ResponseWriter, r *http.Request) {
	// Only allow POST
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Initialize database if not already done
	if lib.GetDB() == nil {
		if err := lib.InitDB(); err != nil {
			http.Error(w, fmt.Sprintf("Database initialization failed: %v", err), http.StatusInternalServerError)
			return
		}
	}

	// Extract transaction ID from URL path
	// Format: /api/whatsapp/transactions/123/confirm
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) < 5 {
		http.Error(w, "Invalid URL format", http.StatusBadRequest)
		return
	}

	transactionID, err := strconv.Atoi(pathParts[4])
	if err != nil {
		http.Error(w, "Invalid transaction ID", http.StatusBadRequest)
		return
	}

	// Get Apple User ID
	appleUserID := r.URL.Query().Get("apple_user_id")
	if appleUserID == "" {
		appleUserID = r.Header.Get("X-Apple-User-ID")
	}
	if appleUserID == "" {
		http.Error(w, "apple_user_id is required", http.StatusBadRequest)
		return
	}

	// Mark transaction as synced
	ctx := context.Background()
	db := lib.GetDB()

	result, err := db.Exec(ctx, `
		UPDATE pending_transactions
		SET status = 'synced', synced_at = NOW()
		WHERE id = $1 AND apple_user_id = $2 AND status = 'pending'
	`, transactionID, appleUserID)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to confirm transaction: %v", err), http.StatusInternalServerError)
		return
	}

	if result.RowsAffected() == 0 {
		http.Error(w, "Transaction not found or already synced", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

// Handler is the Vercel serverless function entry point
func Handler(w http.ResponseWriter, r *http.Request) {
	// Route based on path
	if strings.HasSuffix(r.URL.Path, "/confirm") {
		ConfirmTransactionHandler(w, r)
	} else {
		TransactionsHandler(w, r)
	}
}

