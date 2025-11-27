package lib

import (
	"fmt"
	"regexp"
	"strings"
	"time"
)

// ParsedTransaction represents a parsed transaction from user message
type ParsedTransaction struct {
	Amount  float64
	Date    time.Time
	Vendor  string
	Note    string
	IsValid bool
}

// ParseMessage extracts transaction details from user message
func ParseMessage(message string) ParsedTransaction {
	message = strings.TrimSpace(message)
	result := ParsedTransaction{
		Date:    time.Now(), // Default to today
		IsValid: false,
	}

	// Extract amount - patterns: $5.50, 5.50, $5, 5, 15 USD, etc.
	amountPatterns := []string{
		`\$?\s*(\d+\.?\d*)`,                    // $5.50 or 5.50
		`(\d+\.?\d*)\s*(USD|EUR|GBP|INR|usd|eur|gbp|inr)`, // 15 USD
	}

	var amount float64
	var amountFound bool
	for _, pattern := range amountPatterns {
		re := regexp.MustCompile(pattern)
		matches := re.FindStringSubmatch(message)
		if len(matches) > 1 {
			fmt.Sscanf(matches[1], "%f", &amount)
			if amount > 0 {
				amountFound = true
				result.Amount = amount
				break
			}
		}
	}

	if !amountFound {
		return result // Invalid if no amount found
	}

	// Extract date - patterns: 12/25/2024, 12-25-2024, today, yesterday
	datePatterns := []string{
		`(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})`, // 12/25/2024
		`(\d{1,2})[\/\-](\d{1,2})`,                 // 12/25 (assume current year)
	}

	lowerMessage := strings.ToLower(message)
	if strings.Contains(lowerMessage, "today") {
		result.Date = time.Now()
	} else if strings.Contains(lowerMessage, "yesterday") {
		result.Date = time.Now().AddDate(0, 0, -1)
	} else {
		for _, pattern := range datePatterns {
			re := regexp.MustCompile(pattern)
			matches := re.FindStringSubmatch(message)
			if len(matches) >= 3 {
				var month, day, year int
				fmt.Sscanf(matches[1], "%d", &month)
				fmt.Sscanf(matches[2], "%d", &day)
				if len(matches) >= 4 {
					fmt.Sscanf(matches[3], "%d", &year)
					if year < 100 {
						year += 2000 // Convert 24 to 2024
					}
				} else {
					year = time.Now().Year()
				}
				result.Date = time.Date(year, time.Month(month), day, 0, 0, 0, 0, time.Local)
				break
			}
		}
	}

	// Extract vendor/note - remove amount and date patterns, use remaining text
	vendorNote := message
	// Remove amount patterns
	for _, pattern := range amountPatterns {
		re := regexp.MustCompile(pattern)
		vendorNote = re.ReplaceAllString(vendorNote, "")
	}
	// Remove date keywords
	vendorNote = regexp.MustCompile(`(?i)(today|yesterday)`).ReplaceAllString(vendorNote, "")
	// Remove date patterns
	for _, pattern := range datePatterns {
		re := regexp.MustCompile(pattern)
		vendorNote = re.ReplaceAllString(vendorNote, "")
	}
	vendorNote = strings.TrimSpace(vendorNote)

	if vendorNote != "" {
		// If vendorNote is short, treat as vendor; otherwise split
		words := strings.Fields(vendorNote)
		if len(words) == 1 {
			result.Vendor = words[0]
		} else if len(words) > 1 {
			result.Vendor = words[0]
			result.Note = strings.Join(words[1:], " ")
		} else {
			result.Note = vendorNote
		}
	} else {
		result.Vendor = "Unknown"
	}

	result.IsValid = true
	return result
}

