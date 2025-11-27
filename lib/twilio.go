package lib

import (
	"context"
	"fmt"
	"os"

	"github.com/twilio/twilio-go"
	twilioApi "github.com/twilio/twilio-go/rest/api/v2010"
)

var twilioClient *twilio.RestClient

// InitTwilio initializes the Twilio client
func InitTwilio() error {
	accountSID := os.Getenv("TWILIO_ACCOUNT_SID")
	authToken := os.Getenv("TWILIO_AUTH_TOKEN")

	if accountSID == "" || authToken == "" {
		return fmt.Errorf("TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN not set")
	}

	twilioClient = twilio.NewRestClientWithParams(twilio.ClientParams{
		Username: accountSID,
		Password: authToken,
	})

	return nil
}

// SendWhatsAppMessage sends a WhatsApp message via Twilio
func SendWhatsAppMessage(ctx context.Context, to, message string) error {
	whatsappNumber := os.Getenv("TWILIO_WHATSAPP_NUMBER")
	if whatsappNumber == "" {
		return fmt.Errorf("TWILIO_WHATSAPP_NUMBER not set")
	}

	params := &twilioApi.CreateMessageParams{}
	params.SetTo(to)
	params.SetFrom(whatsappNumber)
	params.SetBody(message)

	resp, err := twilioClient.Api.CreateMessage(params)
	if err != nil {
		return fmt.Errorf("failed to send WhatsApp message: %w", err)
	}

	if resp.Sid == nil {
		return fmt.Errorf("no message SID returned from Twilio")
	}

	return nil
}

// GetTwilioClient returns the Twilio client instance
func GetTwilioClient() *twilio.RestClient {
	return twilioClient
}

