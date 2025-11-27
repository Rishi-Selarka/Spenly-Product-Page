package lib

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
)

// HandleLinkingMessage processes a linking message (link_<token>)
func HandleLinkingMessage(ctx context.Context, whatsappNumber, message string) (string, error) {
	// Extract token from message (format: link_<token>)
	if len(message) < 6 || message[:5] != "link_" {
		return "Invalid link format. Please use the link button in Spenly app.", nil
	}

	token := message[5:]
	db := GetDB()

	// Find and validate token
	var appleUserID string
	var expiresAt time.Time
	var usedAt sql.NullTime

	err := db.QueryRow(ctx, `
		SELECT apple_user_id, expires_at, used_at
		FROM link_tokens
		WHERE token = $1
	`, token).Scan(&appleUserID, &expiresAt, &usedAt)

	if err == pgx.ErrNoRows {
		return "Invalid or expired link token. Please generate a new one from Spenly app.", nil
	}
	if err != nil {
		return "", fmt.Errorf("failed to query token: %w", err)
	}

	// Check if token is expired
	if time.Now().After(expiresAt) {
		return "This link token has expired. Please generate a new one from Spenly app.", nil
	}

	// Check if token already used
	if usedAt.Valid {
		return "This link token has already been used. Please generate a new one from Spenly app.", nil
	}

	// Mark token as used
	_, err = db.Exec(ctx, `
		UPDATE link_tokens
		SET used_at = NOW(), whatsapp_number = $1
		WHERE token = $2
	`, whatsappNumber, token)
	if err != nil {
		return "", fmt.Errorf("failed to mark token as used: %w", err)
	}

	// Create or update user mapping
	_, err = db.Exec(ctx, `
		INSERT INTO user_mappings (whatsapp_number, apple_user_id, created_at, updated_at)
		VALUES ($1, $2, NOW(), NOW())
		ON CONFLICT (whatsapp_number) 
		DO UPDATE SET apple_user_id = $2, updated_at = NOW()
	`, whatsappNumber, appleUserID)
	if err != nil {
		return "", fmt.Errorf("failed to create user mapping: %w", err)
	}

	// Send welcome message
	welcomeMessage := `✅ Account linked! I'm Spenly AI. How can I help you today?

Try sending:
• "Lunch $15" - Add a transaction
• "Coffee $5.50" - Quick expense entry
• "Help" - See all commands

You can also send photos of receipts!`

	return welcomeMessage, nil
}

// HandleTransactionMessage processes a transaction message and creates pending transaction
func HandleTransactionMessage(ctx context.Context, whatsappNumber, message string) (string, error) {
	// Get Apple User ID from mapping
	db := GetDB()
	var appleUserID string
	err := db.QueryRow(ctx, `
		SELECT apple_user_id
		FROM user_mappings
		WHERE whatsapp_number = $1
	`, whatsappNumber).Scan(&appleUserID)

	if err == pgx.ErrNoRows {
		return "Your WhatsApp number is not linked. Please link your account first using the Spenly app.", nil
	}
	if err != nil {
		return "", fmt.Errorf("failed to get user mapping: %w", err)
	}

	// Parse message
	parsed := ParseMessage(message)
	if !parsed.IsValid {
		return `I couldn't understand that. Please send a transaction like:
• "Lunch $15"
• "Coffee $5.50"
• "Groceries $45.99"

Or type "help" for more options.`, nil
	}

	// Create pending transaction
	var transactionID int
	err = db.QueryRow(ctx, `
		INSERT INTO pending_transactions 
		(apple_user_id, amount, date, vendor, category, note, status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())
		RETURNING id
	`, appleUserID, parsed.Amount, parsed.Date, parsed.Vendor, "Food", parsed.Note).Scan(&transactionID)

	if err != nil {
		return "", fmt.Errorf("failed to create transaction: %w", err)
	}

	// Store raw message
	_, err = db.Exec(ctx, `
		INSERT INTO whatsapp_messages 
		(whatsapp_number, message_type, content, status, created_at)
		VALUES ($1, 'text', $2, 'processed', NOW())
	`, whatsappNumber, message)
	if err != nil {
		// Log error but don't fail the transaction
		fmt.Printf("Warning: failed to store message: %v\n", err)
	}

	// Format response
	vendorText := parsed.Vendor
	if vendorText == "" {
		vendorText = "Transaction"
	}

	response := fmt.Sprintf("✅ Added: %s $%.2f", vendorText, parsed.Amount)
	if parsed.Note != "" {
		response += fmt.Sprintf("\nNote: %s", parsed.Note)
	}
	response += "\n\nTransaction will appear in Spenly after sync."

	return response, nil
}

// HandleHelpMessage returns help text
func HandleHelpMessage() string {
	return `📱 *Spenly WhatsApp Bot - Commands*

*Add Transactions:*
• "Lunch $15" - Add expense
• "Coffee $5.50" - Quick entry
• "Groceries $45.99" - With vendor name

*Other Commands:*
• "Help" - Show this message
• "Link" - Get linking instructions

*Tips:*
• Send receipt photos (coming soon!)
• Include date: "Lunch $15 12/25"
• Use "today" or "yesterday" for dates

Need help? Contact support@spenly.app`
}

// GetAppleUserID returns Apple User ID for a WhatsApp number
func GetAppleUserID(ctx context.Context, whatsappNumber string) (string, error) {
	db := GetDB()
	var appleUserID string
	err := db.QueryRow(ctx, `
		SELECT apple_user_id
		FROM user_mappings
		WHERE whatsapp_number = $1
	`, whatsappNumber).Scan(&appleUserID)

	if err == pgx.ErrNoRows {
		return "", fmt.Errorf("whatsapp number not linked")
	}
	if err != nil {
		return "", fmt.Errorf("failed to get user mapping: %w", err)
	}

	return appleUserID, nil
}

