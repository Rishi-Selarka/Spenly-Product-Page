package whatsapp

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strings"

	"spenly-whatsapp-backend/lib"
)

// TwilioWebhookRequest represents the incoming Twilio webhook
type TwilioWebhookRequest struct {
	MessageSid    string `json:"MessageSid"`
	AccountSid    string `json:"AccountSid"`
	From          string `json:"From"`
	To            string `json:"To"`
	Body          string `json:"Body"`
	NumMedia      string `json:"NumMedia"`
	MediaURL0     string `json:"MediaUrl0"`
	MediaContentType0 string `json:"MediaContentType0"`
}

// WebhookHandler handles POST /api/whatsapp/webhook from Twilio
func WebhookHandler(w http.ResponseWriter, r *http.Request) {
	// Initialize database if not already done
	if lib.GetDB() == nil {
		if err := lib.InitDB(); err != nil {
			http.Error(w, fmt.Sprintf("Database initialization failed: %v", err), http.StatusInternalServerError)
			return
		}
	}

	// Initialize Twilio if not already done
	if lib.GetTwilioClient() == nil {
		if err := lib.InitTwilio(); err != nil {
			http.Error(w, fmt.Sprintf("Twilio initialization failed: %v", err), http.StatusInternalServerError)
			return
		}
	}

	// Verify Twilio signature (optional but recommended for production)
	verifyToken := os.Getenv("TWILIO_WEBHOOK_VERIFY_TOKEN")
	if verifyToken != "" {
		if !verifyTwilioSignature(r, verifyToken) {
			http.Error(w, "Invalid signature", http.StatusUnauthorized)
			return
		}
	}

	// Parse form data (Twilio sends as application/x-www-form-urlencoded)
	if err := r.ParseForm(); err != nil {
		http.Error(w, fmt.Sprintf("Failed to parse form: %v", err), http.StatusBadRequest)
		return
	}

	// Extract message data
	from := r.FormValue("From")
	body := strings.TrimSpace(r.FormValue("Body"))
	numMedia := r.FormValue("NumMedia")

	// Remove "whatsapp:" prefix from phone number if present
	from = strings.TrimPrefix(from, "whatsapp:")

	if from == "" {
		http.Error(w, "Missing From field", http.StatusBadRequest)
		return
	}

	ctx := context.Background()

	// Handle media messages (images)
	if numMedia != "" && numMedia != "0" {
		mediaURL := r.FormValue("MediaUrl0")
		mediaType := r.FormValue("MediaContentType0")

		// Store message as pending processing
		db := lib.GetDB()
		_, err := db.Exec(ctx, `
			INSERT INTO whatsapp_messages 
			(whatsapp_number, message_type, content, raw_data, status, created_at)
			VALUES ($1, 'image', $2, $3, 'pending_processing', NOW())
		`, from, mediaURL, fmt.Sprintf(`{"url": "%s", "type": "%s"}`, mediaURL, mediaType))
		if err != nil {
			fmt.Printf("Warning: failed to store image message: %v\n", err)
		}

		// Reply to user
		reply := "📸 Receipt received! I'm processing it now. This feature is coming soon - for now, please send transactions as text like 'Coffee $5.50'."
		if err := lib.SendWhatsAppMessage(ctx, fmt.Sprintf("whatsapp:%s", from), reply); err != nil {
			fmt.Printf("Error sending reply: %v\n", err)
		}

		// Return TwiML response (Twilio expects this)
		w.Header().Set("Content-Type", "text/xml")
		w.WriteHeader(http.StatusOK)
		fmt.Fprint(w, `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`)
		return
	}

	// Handle text messages
	if body == "" {
		http.Error(w, "Missing Body field", http.StatusBadRequest)
		return
	}

	// Normalize message to lowercase for command detection
	lowerBody := strings.ToLower(body)

	// Handle help command
	if lowerBody == "help" || lowerBody == "hi" || lowerBody == "hello" {
		reply := lib.HandleHelpMessage()
		if err := lib.SendWhatsAppMessage(ctx, fmt.Sprintf("whatsapp:%s", from), reply); err != nil {
			fmt.Printf("Error sending help reply: %v\n", err)
		}
		w.Header().Set("Content-Type", "text/xml")
		w.WriteHeader(http.StatusOK)
		fmt.Fprint(w, `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`)
		return
	}

	// Handle linking message
	if strings.HasPrefix(lowerBody, "link_") {
		reply, err := lib.HandleLinkingMessage(ctx, from, body)
		if err != nil {
			fmt.Printf("Error handling linking message: %v\n", err)
			reply = "Sorry, there was an error processing your link. Please try again."
		}
		if err := lib.SendWhatsAppMessage(ctx, fmt.Sprintf("whatsapp:%s", from), reply); err != nil {
			fmt.Printf("Error sending link reply: %v\n", err)
		}
		w.Header().Set("Content-Type", "text/xml")
		w.WriteHeader(http.StatusOK)
		fmt.Fprint(w, `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`)
		return
	}

	// Handle transaction message
	reply, err := lib.HandleTransactionMessage(ctx, from, body)
	if err != nil {
		fmt.Printf("Error handling transaction message: %v\n", err)
		reply = "Sorry, there was an error processing your transaction. Please try again or contact support."
	}
	if err := lib.SendWhatsAppMessage(ctx, fmt.Sprintf("whatsapp:%s", from), reply); err != nil {
		fmt.Printf("Error sending transaction reply: %v\n", err)
	}

	// Return TwiML response
	w.Header().Set("Content-Type", "text/xml")
	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`)
}

// verifyTwilioSignature verifies the Twilio webhook signature
func verifyTwilioSignature(r *http.Request, authToken string) bool {
	// Get signature from header
	signature := r.Header.Get("X-Twilio-Signature")
	if signature == "" {
		return false
	}

	// Reconstruct the URL that Twilio used to sign
	url := fmt.Sprintf("https://%s%s", r.Host, r.URL.Path)

	// Get form values
	formValues := make(url.Values)
	for key, values := range r.PostForm {
		formValues[key] = values
	}

	// Sort form values
	sortedKeys := make([]string, 0, len(formValues))
	for k := range formValues {
		sortedKeys = append(sortedKeys, k)
	}

	// Build signature string
	var signatureString strings.Builder
	signatureString.WriteString(url)
	for _, key := range sortedKeys {
		for _, value := range formValues[key] {
			signatureString.WriteString(key)
			signatureString.WriteString(value)
		}
	}

	// Compute HMAC
	mac := hmac.New(sha256.New, []byte(authToken))
	mac.Write([]byte(signatureString.String()))
	expectedSignature := hex.EncodeToString(mac.Sum(nil))

	// Compare signatures
	return hmac.Equal([]byte(signature), []byte(expectedSignature))
}

// Handler is the Vercel serverless function entry point
func Handler(w http.ResponseWriter, r *http.Request) {
	WebhookHandler(w, r)
}

