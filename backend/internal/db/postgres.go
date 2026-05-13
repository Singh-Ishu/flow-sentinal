package db

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Database struct {
	pool *pgxpool.Pool
}

func NewPostgres() *Database {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		databaseURL = "postgres://postgres:postgres@localhost:5432/pipeline_leak_detection?sslmode=disable"
	}

	config, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		log.Fatalf("Unable to parse DATABASE_URL: %v", err)
	}

	pool, err := pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		log.Fatalf("Unable to create connection pool: %v", err)
	}

	// Test connection
	err = pool.Ping(context.Background())
	if err != nil {
		log.Fatalf("Unable to ping database: %v", err)
	}

	db := &Database{pool: pool}

	// Run migrations
	if err := db.RunMigrations(); err != nil {
		log.Fatalf("Migration failed: %v", err)
	}

	log.Println("Database connected and migrations applied")
	return db
}

func (d *Database) Close() {
	d.pool.Close()
}

func (d *Database) GetPool() *pgxpool.Pool {
	return d.pool
}

// RunMigrations executes all SQL migration files in order
func (d *Database) RunMigrations() error {
	ctx := context.Background()

	// Create migrations table if it doesn't exist
	_, err := d.pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version INTEGER PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		return fmt.Errorf("failed to create schema_migrations table: %w", err)
	}

	// Read migration files
	migrationsDir := "migrations"
	entries, err := os.ReadDir(migrationsDir)
	if err != nil {
		return fmt.Errorf("failed to read migrations directory: %w", err)
	}

	// Sort migrations by version number
	var migrations []os.DirEntry
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		if strings.HasSuffix(entry.Name(), ".sql") {
			migrations = append(migrations, entry)
		}
	}
	sort.Slice(migrations, func(i, j int) bool {
		return migrations[i].Name() < migrations[j].Name()
	})

	// Execute each migration
	for _, entry := range migrations {
		filename := entry.Name()
		// Extract version from filename (e.g., "001_init_schema.sql" -> 1)
		parts := strings.Split(filename, "_")
		version, err := strconv.Atoi(parts[0])
		if err != nil {
			log.Printf("Skipping %s: invalid version format\n", filename)
			continue
		}

		// Check if migration already ran
		var executed bool
		err = d.pool.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE version = $1)", version).Scan(&executed)
		if err != nil {
			return fmt.Errorf("failed to check migration status: %w", err)
		}

		if executed {
			log.Printf("Migration %s already applied, skipping\n", filename)
			continue
		}

		// Read and execute migration
		filepath := filepath.Join(migrationsDir, filename)
		sql, err := os.ReadFile(filepath)
		if err != nil {
			return fmt.Errorf("failed to read migration file %s: %w", filename, err)
		}

		_, err = d.pool.Exec(ctx, string(sql))
		if err != nil {
			return fmt.Errorf("failed to execute migration %s: %w", filename, err)
		}

		// Record migration
		_, err = d.pool.Exec(ctx, "INSERT INTO schema_migrations (version, name) VALUES ($1, $2)", version, filename)
		if err != nil {
			return fmt.Errorf("failed to record migration %s: %w", filename, err)
		}

		log.Printf("Applied migration: %s\n", filename)
	}

	return nil
}
