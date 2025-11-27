package lib

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

var dbPool *pgxpool.Pool

// InitDB initializes the database connection pool
func InitDB() error {
	postgresURL := os.Getenv("POSTGRES_URL")
	if postgresURL == "" {
		return fmt.Errorf("POSTGRES_URL environment variable not set")
	}

	config, err := pgxpool.ParseConfig(postgresURL)
	if err != nil {
		return fmt.Errorf("failed to parse postgres URL: %w", err)
	}

	config.MaxConns = 10
	config.MaxConnLifetime = 30 * time.Minute
	config.MaxConnIdleTime = 5 * time.Minute

	dbPool, err = pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		return fmt.Errorf("failed to create connection pool: %w", err)
	}

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := dbPool.Ping(ctx); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	// Initialize schema
	if err := initSchema(); err != nil {
		return fmt.Errorf("failed to initialize schema: %w", err)
	}

	return nil
}

// GetDB returns the database connection pool
func GetDB() *pgxpool.Pool {
	return dbPool
}

// CloseDB closes the database connection pool
func CloseDB() {
	if dbPool != nil {
		dbPool.Close()
	}
}

// initSchema creates necessary tables if they don't exist
func initSchema() error {
	ctx := context.Background()
	conn, err := dbPool.Acquire(ctx)
	if err != nil {
		return err
	}
	defer conn.Release()

	queries := []string{
		// Link tokens table
		`CREATE TABLE IF NOT EXISTS link_tokens (
			id SERIAL PRIMARY KEY,
			token VARCHAR(255) UNIQUE NOT NULL,
			apple_user_id VARCHAR(255) NOT NULL,
			whatsapp_number VARCHAR(50),
			created_at TIMESTAMP DEFAULT NOW(),
			expires_at TIMESTAMP NOT NULL,
			used_at TIMESTAMP
		)`,
		// WhatsApp messages table
		`CREATE TABLE IF NOT EXISTS whatsapp_messages (
			id SERIAL PRIMARY KEY,
			whatsapp_number VARCHAR(50) NOT NULL,
			message_type VARCHAR(20) NOT NULL,
			content TEXT,
			raw_data JSONB,
			status VARCHAR(50) DEFAULT 'pending',
			created_at TIMESTAMP DEFAULT NOW()
		)`,
		// Pending transactions table
		`CREATE TABLE IF NOT EXISTS pending_transactions (
			id SERIAL PRIMARY KEY,
			apple_user_id VARCHAR(255) NOT NULL,
			amount DECIMAL(10, 2) NOT NULL,
			date DATE NOT NULL,
			vendor VARCHAR(255),
			category VARCHAR(100),
			note TEXT,
			status VARCHAR(50) DEFAULT 'pending',
			created_at TIMESTAMP DEFAULT NOW(),
			synced_at TIMESTAMP
		)`,
		// User mappings table (links WhatsApp number to Apple User ID)
		`CREATE TABLE IF NOT EXISTS user_mappings (
			id SERIAL PRIMARY KEY,
			whatsapp_number VARCHAR(50) UNIQUE NOT NULL,
			apple_user_id VARCHAR(255) NOT NULL,
			created_at TIMESTAMP DEFAULT NOW(),
			updated_at TIMESTAMP DEFAULT NOW()
		)`,
		// Create indexes
		`CREATE INDEX IF NOT EXISTS idx_link_tokens_token ON link_tokens(token)`,
		`CREATE INDEX IF NOT EXISTS idx_link_tokens_apple_user_id ON link_tokens(apple_user_id)`,
		`CREATE INDEX IF NOT EXISTS idx_user_mappings_whatsapp ON user_mappings(whatsapp_number)`,
		`CREATE INDEX IF NOT EXISTS idx_user_mappings_apple ON user_mappings(apple_user_id)`,
		`CREATE INDEX IF NOT EXISTS idx_pending_transactions_apple_user ON pending_transactions(apple_user_id)`,
		`CREATE INDEX IF NOT EXISTS idx_pending_transactions_status ON pending_transactions(status)`,
	}

	for _, query := range queries {
		if _, err := conn.Exec(ctx, query); err != nil {
			return fmt.Errorf("failed to execute query: %w", err)
		}
	}

	return nil
}

